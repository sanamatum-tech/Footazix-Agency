-- ==============================================================================
-- FOOTAZIX PORTFOLIO CMS & PUBLIC WORK UPGRADE MIGRATION
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/gdwlkqrzcixjajzvcwvg/sql
-- ==============================================================================

-- 1. ADD ASPECT RATIOS, VISIBILITY & PROJECT URL COLUMNS TO PROJECTS TABLE
ALTER TABLE IF EXISTS public.projects
  ADD COLUMN IF NOT EXISTS video_aspect_ratio TEXT DEFAULT '16:9',
  ADD COLUMN IF NOT EXISTS thumbnail_aspect_ratio TEXT DEFAULT '16:9',
  ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS project_url TEXT;

-- 2. ENSURE DEFAULT VALUES FOR EXISTING ROWS (16:9 / visible)
UPDATE public.projects
SET 
  video_aspect_ratio = COALESCE(video_aspect_ratio, '16:9'),
  thumbnail_aspect_ratio = COALESCE(thumbnail_aspect_ratio, '16:9'),
  visible = COALESCE(visible, true);

-- 3. UPDATE ROW LEVEL SECURITY (RLS) FOR PUBLIC & CMS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Allow public visitors to read published & visible projects (and authenticated users)
DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;
CREATE POLICY "Public can view published projects"
  ON public.projects FOR SELECT
  TO anon, authenticated
  USING (
    (status = 'published' AND COALESCE(visible, true) = true)
    OR auth.role() = 'authenticated'
    OR public.is_admin()
  );

-- Allow CMS editors to perform full CRUD on projects (SELECT, INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;
DROP POLICY IF EXISTS "CMS can manage projects" ON public.projects;
CREATE POLICY "CMS can manage projects"
  ON public.projects FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 4. ENSURE FOOTAZIX-MEDIA STORAGE BUCKET ALLOWS PUBLIC ACCESS & UPLOADS
INSERT INTO storage.buckets (id, name, public)
VALUES ('footazix-media', 'footazix-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view media" ON storage.objects;
CREATE POLICY "Public can view media"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'footazix-media');

DROP POLICY IF EXISTS "Admins can upload and manage media" ON storage.objects;
DROP POLICY IF EXISTS "CMS can upload media" ON storage.objects;
CREATE POLICY "CMS can upload media"
  ON storage.objects FOR ALL
  TO anon, authenticated
  USING (bucket_id = 'footazix-media')
  WITH CHECK (bucket_id = 'footazix-media');

-- 5. LINK OWNER ADMIN PROFILE TO FIX is_admin() CHECKS
INSERT INTO public.admin_profiles (id, email, name, role)
VALUES 
  ('598e1422-47f6-460b-995e-0b520ebb6f91', 'footazix@gmail.com', 'Footazix Owner', 'owner')
ON CONFLICT (id) DO UPDATE SET role = 'owner';

-- 6. REFRESH / RELOAD SUPABASE POSTGREST SCHEMA CACHE IMMEDIATELY
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
