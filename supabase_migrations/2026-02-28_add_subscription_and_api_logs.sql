ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamp with time zone;

UPDATE public.users
SET subscription_tier = 'free'
WHERE subscription_tier IS NULL;

ALTER TABLE public.users
  ALTER COLUMN subscription_tier SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_subscription_tier_check'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_subscription_tier_check
      CHECK (subscription_tier IN ('free', 'pro', 'admin'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_subscription_tier
  ON public.users (subscription_tier);

CREATE INDEX IF NOT EXISTS idx_users_subscription_expires_at
  ON public.users (subscription_expires_at);

CREATE TABLE IF NOT EXISTS public.api_request_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ip text,
  route text NOT NULL,
  method text NOT NULL,
  video_id text,
  tier text,
  status_code integer NOT NULL,
  success boolean NOT NULL,
  response_time_ms integer,
  error_code text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_api_request_logs_created_at
  ON public.api_request_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_request_logs_user_created
  ON public.api_request_logs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_request_logs_route_created
  ON public.api_request_logs (route, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_request_logs_ip_created
  ON public.api_request_logs (ip, created_at DESC);

ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;
