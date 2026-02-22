CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users NOT NULL,
  email text,
  credits integer DEFAULT 10,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Users can view their own profile.'
  ) THEN
    CREATE POLICY "Users can view their own profile."
      ON public.users
      FOR SELECT
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Users can update their own profile.'
  ) THEN
    CREATE POLICY "Users can update their own profile."
      ON public.users
      FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.transcripts_history (
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

ALTER TABLE public.transcripts_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'transcripts_history'
      AND policyname = 'Users can view their own history.'
  ) THEN
    CREATE POLICY "Users can view their own history."
      ON public.transcripts_history
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'transcripts_history'
      AND policyname = 'Users can insert their own history.'
  ) THEN
    CREATE POLICY "Users can insert their own history."
      ON public.transcripts_history
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'transcripts_history'
      AND policyname = 'Users can delete their own history.'
  ) THEN
    CREATE POLICY "Users can delete their own history."
      ON public.transcripts_history
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;
