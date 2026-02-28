-- Create users table
CREATE TABLE public.users (
  id uuid REFERENCES auth.users NOT NULL,
  email text,
  credits integer DEFAULT 5, -- 5 free links for new users
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Users can view their own profile." ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- Create transcripts history table
CREATE TABLE public.transcripts_history (
  id uuid DEFAULT uuid_generate_v4() NOT NULL,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  video_id text NOT NULL,
  video_title text,
  transcript text NOT NULL,
  ai_result text,
  processing_type text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.transcripts_history ENABLE ROW LEVEL SECURITY;

-- Create policies for history
CREATE POLICY "Users can view their own history." ON public.transcripts_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own history." ON public.transcripts_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own history." ON public.transcripts_history FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically create a user profile when they sign up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Payments table for manual billing/audit
CREATE TABLE public.payments (
  id uuid DEFAULT uuid_generate_v4() NOT NULL,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  credits_added integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL,
  payer_contact text,
  transfer_reference text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments." ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- Subscription columns for tier-based access
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

-- API usage and security analytics log
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
