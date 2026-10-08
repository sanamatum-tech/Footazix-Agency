-- ==============================================================================
-- FOOTAZIX — VSL Aspect Ratio & Visibility Migration
-- ==============================================================================
-- Adds aspect_ratio to vsl_settings table and refreshes schema cache.
-- Sensible default '16:9' guarantees existing projects and players do not break.

ALTER TABLE public.vsl_settings 
ADD COLUMN IF NOT EXISTS aspect_ratio VARCHAR(20) DEFAULT '16:9';

-- Refresh existing default row if NULL
UPDATE public.vsl_settings 
SET aspect_ratio = '16:9' 
WHERE aspect_ratio IS NULL;

-- Ensure RLS policies and permissions are open for public read and authenticated/anon upsert
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vsl_settings TO anon, authenticated;

-- Storage policies for footazix-media bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('footazix-media', 'footazix-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view media" ON storage.objects;
CREATE POLICY "Public can view media"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'footazix-media');

DROP POLICY IF EXISTS "Admins can upload and manage media" ON storage.objects;
CREATE POLICY "Admins can upload and manage media"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'footazix-media')
  WITH CHECK (bucket_id = 'footazix-media');

-- Force PostgREST to immediately refresh its schema cache
NOTIFY pgrst, 'reload schema';
