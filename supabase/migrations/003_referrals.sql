-- NairaQuest — Referral system
-- Run this in Supabase SQL editor: https://app.supabase.com → SQL editor

-- ─── 1. Add referral_code column to profiles ─────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- ─── 2. Referrals table ───────────────────────────────────────────────────────
-- Each referred user can only have ONE referral record (unique on referred_id).
-- sessions_completed tracks how many sessions the referred user has completed.
-- rewarded_at is set when the reward fires (sessions_completed reaches 3).

CREATE TABLE IF NOT EXISTS public.referrals (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sessions_completed  integer NOT NULL DEFAULT 0,
  rewarded_at         timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT referrals_referred_id_unique UNIQUE (referred_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can read referrals where they are the referrer or the referred party
CREATE POLICY "Users can read own referral records"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- A newly signed-up user inserts their own referral record
CREATE POLICY "Referred user can create referral on signup"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referred_id);

-- ─── 3. RPC: increment referral session count and trigger reward ──────────────
-- SECURITY DEFINER lets this function update ANY profile's wallet_balance,
-- bypassing the row-level security policy that normally restricts to own rows.

CREATE OR REPLACE FUNCTION public.increment_referral_session(p_referred_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rec referrals%ROWTYPE;
  v_new_count integer;
BEGIN
  -- Fetch and lock the referral row for this user (only if not yet rewarded)
  SELECT * INTO v_rec
  FROM public.referrals
  WHERE referred_id = p_referred_id
    AND rewarded_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('rewarded', false);
  END IF;

  v_new_count := v_rec.sessions_completed + 1;

  -- Increment session count
  UPDATE public.referrals
  SET sessions_completed = v_new_count
  WHERE id = v_rec.id;

  -- Trigger reward when referred user has completed 3 sessions
  IF v_new_count >= 3 THEN
    UPDATE public.referrals
    SET rewarded_at = now()
    WHERE id = v_rec.id;

    -- Credit referrer: N500
    UPDATE public.profiles
    SET wallet_balance = wallet_balance + 500
    WHERE id = v_rec.referrer_id;

    -- Credit referred user: N200
    UPDATE public.profiles
    SET wallet_balance = wallet_balance + 200
    WHERE id = p_referred_id;

    RETURN json_build_object(
      'rewarded',            true,
      'sessions_completed',  v_new_count,
      'referrer_reward',     500,
      'referred_reward',     200
    );
  END IF;

  RETURN json_build_object(
    'rewarded',           false,
    'sessions_completed', v_new_count
  );
END;
$$;

-- Allow authenticated users to call this function
GRANT EXECUTE ON FUNCTION public.increment_referral_session(uuid) TO authenticated;
