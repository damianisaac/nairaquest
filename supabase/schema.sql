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
