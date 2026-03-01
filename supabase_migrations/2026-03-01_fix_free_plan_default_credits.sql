-- Ensure new users start with the current free plan credits.
ALTER TABLE public.users
  ALTER COLUMN credits SET DEFAULT 5;

-- Normalize legacy free/unpaid balances based on actual used links.
WITH free_link_usage AS (
  SELECT
    th.user_id,
    COUNT(DISTINCT th.video_id)::int AS used_links
  FROM public.transcripts_history AS th
  WHERE th.processing_type = 'quota_extract_marker'
  GROUP BY th.user_id
),
target_free_users AS (
  SELECT
    u.id,
    GREATEST(5 - COALESCE(flu.used_links, 0), 0) AS expected_credits
  FROM public.users AS u
  LEFT JOIN free_link_usage AS flu
    ON flu.user_id = u.id
  WHERE COALESCE(u.subscription_tier, 'free') = 'free'
    AND NOT EXISTS (
      SELECT 1
      FROM public.payments AS p
      WHERE p.user_id = u.id
        AND p.status = 'approved'
    )
)
UPDATE public.users AS u
SET credits = t.expected_credits
FROM target_free_users AS t
WHERE u.id = t.id
  AND u.credits > 5
  AND u.credits <> t.expected_credits;
