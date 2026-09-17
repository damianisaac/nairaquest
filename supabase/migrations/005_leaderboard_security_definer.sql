-- Fix global leaderboard: plain views respect RLS on the underlying tables,
-- so each user only saw their own profile row (= only 1 entry).
-- Replacing with a SECURITY DEFINER function matches how category_leaderboard works.

DROP VIEW IF EXISTS public.leaderboard;
DROP VIEW IF EXISTS public.wallet_leaderboard;

CREATE OR REPLACE FUNCTION public.global_leaderboard(lim integer DEFAULT 100)
RETURNS TABLE (
  id           uuid,
  name         text,
  age_track    text,
  level        integer,
  total_mastery integer,
  avatar_seed  text,
  badge_ids    text[],
  rank         bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.name,
    p.age_track,
    p.level,
    p.total_mastery,
    p.avatar_seed,
    p.badge_ids,
    rank() OVER (ORDER BY p.total_mastery DESC)::bigint AS rank
  FROM public.profiles p
  WHERE p.total_mastery > 0
  ORDER BY p.total_mastery DESC
  LIMIT lim;
$$;

GRANT EXECUTE ON FUNCTION public.global_leaderboard(integer) TO authenticated, anon;
