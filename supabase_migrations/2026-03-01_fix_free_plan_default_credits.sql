-- Ensure new users start with the current free plan credits.
ALTER TABLE public.users
  ALTER COLUMN credits SET DEFAULT 5;

-- Normalize legacy rows created with old default (10) for free users who never had approved payments.
UPDATE public.users AS u
SET credits = 5
WHERE COALESCE(u.subscription_tier, 'free') = 'free'
  AND u.credits = 10
  AND NOT EXISTS (
    SELECT 1
    FROM public.payments AS p
    WHERE p.user_id = u.id
      AND p.status = 'approved'
  );
