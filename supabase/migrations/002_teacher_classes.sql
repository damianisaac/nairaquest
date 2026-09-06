-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 002 — Teacher/Class support
-- Run this ONCE in your Supabase SQL editor:
--   https://app.supabase.com → your project → SQL editor → New query
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add user_role column to profiles
--    Default 'general' so every existing account is unaffected.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_role text NOT NULL DEFAULT 'general'
  CHECK (user_role IN ('general', 'teacher'));

-- 2. Set the role for any existing teacher accounts you have created.
--    Replace the email below with the teacher account's email, then run.
--    (You can run this block multiple times with different emails.)
UPDATE public.profiles
SET user_role = 'teacher'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'YOUR_TEACHER_EMAIL_HERE'
);

-- 3. Create the classes table (teacher-managed classrooms)
CREATE TABLE IF NOT EXISTS public.classes (
  id                UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT    NOT NULL,
  age_track         TEXT    NOT NULL,
  class_code        TEXT    NOT NULL UNIQUE,
  teacher_user_id   UUID    REFERENCES public.profiles(id) ON DELETE SET NULL,
  teacher_name      TEXT    NOT NULL,
  focus_category_id TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Teachers can manage own classes"
    ON public.classes FOR ALL
    USING (auth.uid() = teacher_user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can read class by code"
    ON public.classes FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. Create the class_members table
CREATE TABLE IF NOT EXISTS public.class_members (
  class_id     UUID  NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id      UUID  NOT NULL,
  display_name TEXT  NOT NULL,
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (class_id, user_id)
);

ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Members can read own membership"
    ON public.class_members FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Teachers can read class members"
    ON public.class_members FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.classes
        WHERE classes.id = class_id
          AND classes.teacher_user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can join a class"
    ON public.class_members FOR INSERT
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. Create the families table (optional — needed for Family Hub feature)
CREATE TABLE IF NOT EXISTS public.families (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Family members can read their family"
    ON public.families FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.family_members
        WHERE family_members.family_id = families.id
          AND family_members.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can create families"
    ON public.families FOR INSERT
    WITH CHECK (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 6. Create the family_members table
CREATE TABLE IF NOT EXISTS public.family_members (
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (family_id, user_id)
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Family members can read members"
    ON public.family_members FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can join families"
    ON public.family_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can leave families"
    ON public.family_members FOR DELETE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7. Create the family_duels table
CREATE TABLE IF NOT EXISTS public.family_duels (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id       UUID    NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  category_id     TEXT    NOT NULL,
  difficulty      TEXT    NOT NULL,
  initiator_id    UUID    REFERENCES public.profiles(id) ON DELETE SET NULL,
  initiator_name  TEXT    NOT NULL,
  opponent_id     UUID    REFERENCES public.profiles(id) ON DELETE SET NULL,
  opponent_name   TEXT    NOT NULL,
  initiator_score INTEGER,
  opponent_score  INTEGER,
  question_ids    TEXT[]  NOT NULL,
  status          TEXT    NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ
);

ALTER TABLE public.family_duels ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Family members can read duels"
    ON public.family_duels FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.family_members
        WHERE family_members.family_id = family_duels.family_id
          AND family_members.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Family members can create duels"
    ON public.family_duels FOR INSERT
    WITH CHECK (auth.uid() = initiator_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Players can submit their score"
    ON public.family_duels FOR UPDATE
    USING (auth.uid() = initiator_id OR auth.uid() = opponent_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
