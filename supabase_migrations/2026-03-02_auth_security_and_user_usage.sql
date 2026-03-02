-- Security and quota upgrade:
-- - user_usage table
-- - quota reset/consume RPC functions
-- - new-user bootstrap to include user_usage row

CREATE TABLE IF NOT EXISTS public.user_usage (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  monthly_quota integer NOT NULL DEFAULT 5 CHECK (monthly_quota >= 0),
  used_this_month integer NOT NULL DEFAULT 0 CHECK (used_this_month >= 0),
  last_reset_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_user_usage_last_reset
  ON public.user_usage (last_reset_at DESC);

ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_usage'
      AND policyname = 'Users can view their own usage.'
  ) THEN
    CREATE POLICY "Users can view their own usage."
      ON public.user_usage
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_usage'
      AND policyname = 'Users can update their own usage.'
  ) THEN
    DROP POLICY "Users can update their own usage." ON public.user_usage;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.touch_user_usage_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_user_usage_updated_at'
  ) THEN
    CREATE TRIGGER on_user_usage_updated_at
      BEFORE UPDATE ON public.user_usage
      FOR EACH ROW
      EXECUTE PROCEDURE public.touch_user_usage_updated_at();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.refresh_user_quota_if_due(p_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  monthly_quota integer,
  used_this_month integer,
  remaining integer,
  last_reset_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  usage_row public.user_usage%ROWTYPE;
BEGIN
  INSERT INTO public.user_usage (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT *
  INTO usage_row
  FROM public.user_usage
  WHERE public.user_usage.user_id = p_user_id
  FOR UPDATE;

  IF usage_row.user_id IS NULL THEN
    RAISE EXCEPTION 'User usage row is missing for %', p_user_id;
  END IF;

  IF usage_row.last_reset_at <= (timezone('utc'::text, now()) - interval '30 days') THEN
    UPDATE public.user_usage
    SET used_this_month = 0,
        last_reset_at = timezone('utc'::text, now())
    WHERE public.user_usage.user_id = p_user_id
    RETURNING * INTO usage_row;
  END IF;

  RETURN QUERY
  SELECT
    usage_row.user_id,
    usage_row.monthly_quota,
    usage_row.used_this_month,
    GREATEST(usage_row.monthly_quota - usage_row.used_this_month, 0) AS remaining,
    usage_row.last_reset_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_user_quota(p_user_id uuid)
RETURNS TABLE (
  allowed boolean,
  user_id uuid,
  monthly_quota integer,
  used_this_month integer,
  remaining integer,
  last_reset_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  usage_row public.user_usage%ROWTYPE;
BEGIN
  INSERT INTO public.user_usage (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT *
  INTO usage_row
  FROM public.user_usage
  WHERE public.user_usage.user_id = p_user_id
  FOR UPDATE;

  IF usage_row.user_id IS NULL THEN
    RAISE EXCEPTION 'User usage row is missing for %', p_user_id;
  END IF;

  IF usage_row.last_reset_at <= (timezone('utc'::text, now()) - interval '30 days') THEN
    usage_row.used_this_month := 0;
    usage_row.last_reset_at := timezone('utc'::text, now());
  END IF;

  IF usage_row.used_this_month >= usage_row.monthly_quota THEN
    UPDATE public.user_usage
    SET used_this_month = usage_row.used_this_month,
        last_reset_at = usage_row.last_reset_at
    WHERE public.user_usage.user_id = p_user_id;

    RETURN QUERY
    SELECT
      false AS allowed,
      usage_row.user_id,
      usage_row.monthly_quota,
      usage_row.used_this_month,
      GREATEST(usage_row.monthly_quota - usage_row.used_this_month, 0) AS remaining,
      usage_row.last_reset_at;
    RETURN;
  END IF;

  usage_row.used_this_month := usage_row.used_this_month + 1;

  UPDATE public.user_usage
  SET used_this_month = usage_row.used_this_month,
      last_reset_at = usage_row.last_reset_at
  WHERE public.user_usage.user_id = p_user_id
  RETURNING * INTO usage_row;

  RETURN QUERY
  SELECT
    true AS allowed,
    usage_row.user_id,
    usage_row.monthly_quota,
    usage_row.used_this_month,
    GREATEST(usage_row.monthly_quota - usage_row.used_this_month, 0) AS remaining,
    usage_row.last_reset_at;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_user_quota_if_due(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.refresh_user_quota_if_due(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.refresh_user_quota_if_due(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_user_quota_if_due(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.consume_user_quota(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_user_quota(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.consume_user_quota(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.consume_user_quota(uuid) TO service_role;

-- Ensure existing users have a usage row.
INSERT INTO public.user_usage (user_id)
SELECT u.id
FROM public.users u
LEFT JOIN public.user_usage uu ON uu.user_id = u.id
WHERE uu.user_id IS NULL;

-- Keep auth-trigger bootstrap aligned.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_usage (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$;
