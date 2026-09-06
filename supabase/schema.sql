-- NairaQuest Supabase Schema
-- Run this in your Supabase SQL editor at: https://app.supabase.com → SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── profiles ───────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                       uuid primary key references auth.users(id) on delete cascade,
  name                     text not null,
  age_track                text not null default 'adults' check (age_track in ('kids','teens','adults')),
  avatar_seed              text not null default 'default',
  avatar_item_ids          text[] not null default '{}',
  level                    integer not null default 0,
  total_mastery            integer not null default 0,
  daily_streak             integer not null default 0,
  last_played              text,
  badge_ids                text[] not null default '{}',
  -- Wallet fields (Learning Credits — not real money)
  wallet_balance           bigint not null default 0,
  wallet_disclaimer_seen   boolean not null default false,
  -- Role: 'general' for students/adults, 'teacher' for classroom managers
  user_role                text not null default 'general' check (user_role in ('general','teacher')),
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- ─── category_progress ──────────────────────────────────────────────────────
create table if not exists public.category_progress (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  category_id         text not null,
  mastery_points      integer not null default 0,
  peak_mastery_points integer not null default 0,
  questions_answered  integer not null default 0,
  last_practiced        bigint,
  answered_question_ids text[] not null default '{}',
  updated_at            timestamptz not null default now(),
  unique (user_id, category_id)
);

alter table public.category_progress enable row level security;

create policy "Users can manage own progress"
  on public.category_progress for all using (auth.uid() = user_id);

-- ─── sessions ───────────────────────────────────────────────────────────────
create table if not exists public.sessions (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  category_id           text not null,
  difficulty            text not null,
  correct_count         integer not null default 0,
  total_count           integer not null default 0,
  mastery_points_earned integer not null default 0,
  played_at             timestamptz not null default now()
);

alter table public.sessions enable row level security;

create policy "Users can insert own sessions"
  on public.sessions for insert with check (auth.uid() = user_id);

create policy "Users can read own sessions"
  on public.sessions for select using (auth.uid() = user_id);

-- ─── wallet_transactions ─────────────────────────────────────────────────────
-- NOTE: These are LEARNING CREDITS only — not real money, not withdrawable.
create table if not exists public.wallet_transactions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  timestamp_ms  bigint not null,
  category_id   text not null,
  difficulty    text,
  amount        integer not null,
  type          text not null check (type in ('answer','streak_bonus','mastery_bonus')),
  label         text not null,
  created_at    timestamptz not null default now()
);

alter table public.wallet_transactions enable row level security;

create policy "Users can manage own wallet transactions"
  on public.wallet_transactions for all using (auth.uid() = user_id);

-- Wallet leaderboard (by learning credits) — clearly labelled as game scores
create or replace view public.wallet_leaderboard as
  select
    p.id,
    p.name,
    p.age_track,
    p.level,
    p.wallet_balance,
    p.avatar_seed,
    rank() over (order by p.wallet_balance desc) as rank
  from public.profiles p
  order by p.wallet_balance desc
  limit 100;

-- ─── leaderboard_view ───────────────────────────────────────────────────────
-- Leaderboard: top 100 by total mastery across all tracks
create or replace view public.leaderboard as
  select
    p.id,
    p.name,
    p.age_track,
    p.level,
    p.total_mastery,
    p.avatar_seed,
    p.badge_ids,
    rank() over (order by p.total_mastery desc) as rank
  from public.profiles p
  order by p.total_mastery desc
  limit 100;

-- Per-category leaderboard function
create or replace function public.category_leaderboard(cat_id text, lim integer default 50)
returns table (
  user_id uuid,
  name text,
  mastery_points integer,
  level integer,
  avatar_seed text,
  rank bigint
) language sql security definer as $$
  select
    p.id,
    p.name,
    cp.mastery_points,
    p.level,
    p.avatar_seed,
    rank() over (order by cp.mastery_points desc)
  from public.category_progress cp
  join public.profiles p on p.id = cp.user_id
  where cp.category_id = cat_id
  order by cp.mastery_points desc
  limit lim;
$$;

-- ─── parent_links ────────────────────────────────────────────────────────────
-- Parents can link to a child's account (child must be on 'kids' track)
create table if not exists public.parent_links (
  id         uuid primary key default uuid_generate_v4(),
  parent_id  uuid not null references public.profiles(id) on delete cascade,
  child_id   uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (parent_id, child_id)
);

alter table public.parent_links enable row level security;

create policy "Parents can manage own links"
  on public.parent_links for all using (auth.uid() = parent_id);

create policy "Children can read links about them"
  on public.parent_links for select using (auth.uid() = child_id);

-- ─── triggers ────────────────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger category_progress_updated_at
  before update on public.category_progress
  for each row execute function public.handle_updated_at();

-- ─── classes ─────────────────────────────────────────────────────────────────
-- Teacher-managed classrooms for school/group play
create table if not exists public.classes (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  age_track         text not null,
  class_code        text not null unique,
  teacher_user_id   uuid references public.profiles(id) on delete set null,
  teacher_name      text not null,
  focus_category_id text,
  created_at        timestamptz not null default now()
);

alter table public.classes enable row level security;

create policy "Teachers can manage own classes"
  on public.classes for all
  using (auth.uid() = teacher_user_id);

create policy "Anyone can read class by code"
  on public.classes for select
  using (true);

-- ─── class_members ───────────────────────────────────────────────────────────
create table if not exists public.class_members (
  class_id     uuid not null references public.classes(id) on delete cascade,
  user_id      uuid not null,
  display_name text not null,
  joined_at    timestamptz not null default now(),
  primary key (class_id, user_id)
);

alter table public.class_members enable row level security;

create policy "Members can read own membership"
  on public.class_members for select
  using (auth.uid() = user_id);

create policy "Teachers can read class members"
  on public.class_members for select
  using (
    exists (
      select 1 from public.classes
      where classes.id = class_id
        and classes.teacher_user_id = auth.uid()
    )
  );

create policy "Anyone can join a class"
  on public.class_members for insert
  with check (true);

-- ─── families ────────────────────────────────────────────────────────────────
create table if not exists public.families (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text not null unique,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.families enable row level security;

create policy "Family members can read their family"
  on public.families for select
  using (
    exists (
      select 1 from public.family_members
      where family_members.family_id = families.id
        and family_members.user_id = auth.uid()
    )
  );

create policy "Authenticated users can create families"
  on public.families for insert
  with check (auth.uid() = created_by);

-- ─── family_members ──────────────────────────────────────────────────────────
create table if not exists public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

alter table public.family_members enable row level security;

create policy "Family members can read members"
  on public.family_members for select
  using (auth.uid() = user_id);

create policy "Users can join families"
  on public.family_members for insert
  with check (auth.uid() = user_id);

create policy "Users can leave families"
  on public.family_members for delete
  using (auth.uid() = user_id);

-- ─── family_duels ────────────────────────────────────────────────────────────
create table if not exists public.family_duels (
  id               uuid primary key default gen_random_uuid(),
  family_id        uuid not null references public.families(id) on delete cascade,
  category_id      text not null,
  difficulty       text not null,
  initiator_id     uuid references public.profiles(id) on delete set null,
  initiator_name   text not null,
  opponent_id      uuid references public.profiles(id) on delete set null,
  opponent_name    text not null,
  initiator_score  integer,
  opponent_score   integer,
  question_ids     text[] not null,
  status           text not null default 'pending',
  created_at       timestamptz not null default now(),
  resolved_at      timestamptz
);

alter table public.family_duels enable row level security;

create policy "Family members can read duels"
  on public.family_duels for select
  using (
    exists (
      select 1 from public.family_members
      where family_members.family_id = family_duels.family_id
        and family_members.user_id = auth.uid()
    )
  );

create policy "Family members can create duels"
  on public.family_duels for insert
  with check (auth.uid() = initiator_id);

create policy "Players can submit their score"
  on public.family_duels for update
  using (auth.uid() = initiator_id or auth.uid() = opponent_id);
