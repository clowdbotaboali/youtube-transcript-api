CREATE TABLE IF NOT EXISTS public.seo_transcript_pages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  youtube_video_id text NOT NULL UNIQUE,
  youtube_url text NOT NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  transcript text NOT NULL,
  summary text NOT NULL,
  key_takeaways text[] NOT NULL DEFAULT '{}',
  category text NOT NULL CHECK (category IN ('Education', 'Podcasts', 'Tutorials', 'Languages')),
  keywords text[] NOT NULL DEFAULT '{}',
  seo_title text NOT NULL,
  meta_description text NOT NULL,
  h1_title text NOT NULL,
  canonical text NOT NULL,
  source_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  source_processing_type text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_seo_transcript_pages_slug
  ON public.seo_transcript_pages (slug);

CREATE INDEX IF NOT EXISTS idx_seo_transcript_pages_category
  ON public.seo_transcript_pages (category);

CREATE INDEX IF NOT EXISTS idx_seo_transcript_pages_updated_at
  ON public.seo_transcript_pages (updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_seo_transcript_pages_keywords
  ON public.seo_transcript_pages USING gin (keywords);

CREATE OR REPLACE FUNCTION public.set_seo_transcript_pages_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS seo_transcript_pages_set_updated_at ON public.seo_transcript_pages;
CREATE TRIGGER seo_transcript_pages_set_updated_at
  BEFORE UPDATE ON public.seo_transcript_pages
  FOR EACH ROW EXECUTE PROCEDURE public.set_seo_transcript_pages_updated_at();

ALTER TABLE public.seo_transcript_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read seo transcript pages." ON public.seo_transcript_pages;
CREATE POLICY "Public can read seo transcript pages." ON public.seo_transcript_pages
  FOR SELECT USING (true);

GRANT SELECT ON public.seo_transcript_pages TO anon, authenticated;
