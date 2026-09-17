-- Fix leaderboard: exclude accounts that have never played
-- (total_mastery = 0 means the user signed up but never completed a session)

CREATE OR REPLACE VIEW public.leaderboard AS
  SELECT
    p.id,
    p.name,
    p.age_track,
    p.level,
    p.total_mastery,
    p.avatar_seed,
    p.badge_ids,
    rank() OVER (ORDER BY p.total_mastery DESC) AS rank
  FROM public.profiles p
  WHERE p.total_mastery > 0
  ORDER BY p.total_mastery DESC
  LIMIT 100;
