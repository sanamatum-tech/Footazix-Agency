-- ==============================================================================
-- FOOTAZIX DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) MIGRATION
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Standard privileges for Supabase API roles (RLS enforces actual row-level access)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ==============================================================================
-- 2. ADMIN PROFILES TABLE & AUTH HELPERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'editor')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_admin_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT count(*) FROM public.admin_profiles) = 0 OR NEW.email = 'footazix@gmail.com' THEN
    INSERT INTO public.admin_profiles (id, email, name, role)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), 'owner')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_user_signup();

DROP POLICY IF EXISTS "Admins can view profiles" ON public.admin_profiles;
CREATE POLICY "Admins can view profiles"
  ON public.admin_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Owners can manage admin profiles" ON public.admin_profiles;
CREATE POLICY "Owners can manage admin profiles"
  ON public.admin_profiles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 3. SITE SETTINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  brand_name TEXT NOT NULL DEFAULT 'FOOTAZIX',
  domain TEXT NOT NULL DEFAULT 'footazix.site',
  url TEXT NOT NULL DEFAULT 'https://footazix.site',
  instagram TEXT NOT NULL DEFAULT 'https://www.instagram.com/footazix',
  instagram_handle TEXT NOT NULL DEFAULT '@footazix',
  email TEXT NOT NULL DEFAULT 'footazix@gmail.com',
  tagline TEXT NOT NULL DEFAULT 'Short-Form Experts',
  supporting_line TEXT NOT NULL DEFAULT 'Creators • Brands • Businesses',
  accent_color TEXT NOT NULL DEFAULT '#2563eb',
  portfolio_heading TEXT DEFAULT 'SELECTED WORK',
  portfolio_subheading TEXT DEFAULT 'Recent video edits engineered for audience retention and growth.',
  services_heading TEXT DEFAULT 'WHAT WE DO',
  services_subheading TEXT DEFAULT 'Specialized video editing and content execution for modern creators.',
  team_heading TEXT DEFAULT 'BEHIND FOOTAZIX',
  team_copy TEXT DEFAULT 'A dedicated team of creative editors, strategists, and storytellers.',
  final_cta_headline TEXT DEFAULT 'READY TO UPGRADE YOUR CONTENT?',
  final_cta_supporting TEXT DEFAULT 'Send us your footage. We will turn it into something worth watching.',
  footer_copyright TEXT DEFAULT '© Footazix. All rights reserved.',
  footer_tagline TEXT DEFAULT 'Turning raw footage into content worth watching.',
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 4. HERO CONTENT TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.hero_content (
  id TEXT PRIMARY KEY DEFAULT 'default',
  badge_text TEXT NOT NULL DEFAULT 'FOOTAZIX / CONTENT GROWTH AGENCY',
  headline_line1 TEXT NOT NULL DEFAULT 'TURN RAW FOOTAGE INTO',
  headline_line2 TEXT NOT NULL DEFAULT 'CONTENT WORTH WATCHING.',
  supporting_line TEXT NOT NULL DEFAULT 'Video Editing • Content • Growth',
  description TEXT NOT NULL DEFAULT 'We turn raw footage and ideas into content people want to watch. High-retention editing for creators, brands, and businesses.',
  primary_cta TEXT NOT NULL DEFAULT 'WORK WITH FOOTAZIX →',
  secondary_cta TEXT NOT NULL DEFAULT 'WATCH THE VSL ↓',
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view hero content" ON public.hero_content;
CREATE POLICY "Public can view hero content"
  ON public.hero_content FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can update hero content" ON public.hero_content;
CREATE POLICY "Admins can update hero content"
  ON public.hero_content FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 5. VSL SETTINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vsl_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  label TEXT NOT NULL DEFAULT 'FOUNDER VSL',
  heading TEXT NOT NULL DEFAULT 'SEE HOW FOOTAZIX WORKS.',
  description TEXT NOT NULL DEFAULT 'A quick 90-second walk through our high-retention video editing framework.',
  video_source TEXT NOT NULL DEFAULT 'direct' CHECK (video_source IN ('youtube', 'drive', 'direct', 'local')),
  video_url TEXT NOT NULL DEFAULT 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-video-editor-working-on-his-computer-42861-large.mp4',
  poster_url TEXT NOT NULL DEFAULT '/assets/vsl/vsl-poster.jpg',
  caption_url TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.vsl_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published VSL" ON public.vsl_settings;
CREATE POLICY "Public can view published VSL"
  ON public.vsl_settings FOR SELECT
  TO anon, authenticated
  USING (published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update VSL settings" ON public.vsl_settings;
CREATE POLICY "Admins can update VSL settings"
  ON public.vsl_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 6. ABOUT / RAW TO READY CONTENT TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.about_content (
  id TEXT PRIMARY KEY DEFAULT 'default',
  heading TEXT NOT NULL DEFAULT 'RAW → EDIT → READY',
  subheading TEXT NOT NULL DEFAULT 'Three clean stages. Zero friction.',
  steps JSONB NOT NULL DEFAULT '[
    {"num": "01", "title": "RAW FOOTAGE", "desc": "Drop in raw camera cuts, phone clips, or unedited podcast recordings."},
    {"num": "02", "title": "FOOTAZIX EDIT", "desc": "Pacing, sound design, motion graphics, and retention hooks applied."},
    {"num": "03", "title": "READY TO PUBLISH", "desc": "Final color-graded, high-converting edits delivered ready to post."}
  ]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view about content" ON public.about_content;
CREATE POLICY "Public can view about content"
  ON public.about_content FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can update about content" ON public.about_content;
CREATE POLICY "Admins can update about content"
  ON public.about_content FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 7. PROJECTS (PORTFOLIO) TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Reels' CHECK (category IN ('Reels', 'Shorts', 'YouTube', 'Brand', 'Motion', 'Other')),
  description TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  video_url TEXT,
  client_name TEXT,
  display_order INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;
CREATE POLICY "Public can view published projects"
  ON public.projects FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;
CREATE POLICY "Admins can manage projects"
  ON public.projects FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 8. SERVICES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  cta_text TEXT NOT NULL DEFAULT 'REQUEST THIS SERVICE →',
  highlighted BOOLEAN NOT NULL DEFAULT false,
  visible BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view visible services" ON public.services;
CREATE POLICY "Public can view visible services"
  ON public.services FOR SELECT
  TO anon, authenticated
  USING (visible = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 9. TEAM MEMBERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT NOT NULL,
  photo TEXT NOT NULL,
  social_link TEXT,
  email TEXT,
  display_order INTEGER NOT NULL DEFAULT 1,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view visible team members" ON public.team_members;
CREATE POLICY "Public can view visible team members"
  ON public.team_members FOR SELECT
  TO anon, authenticated
  USING (visible = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;
CREATE POLICY "Admins can manage team members"
  ON public.team_members FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 10. INQUIRIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  service TEXT[] NOT NULL DEFAULT '{}',
  project_details TEXT NOT NULL,
  budget_range TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'completed', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit inquiries" ON public.inquiries;
CREATE POLICY "Public can submit inquiries"
  ON public.inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view and manage inquiries" ON public.inquiries;
CREATE POLICY "Admins can view and manage inquiries"
  ON public.inquiries FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 11. SUPABASE STORAGE BUCKET: footazix-media
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('footazix-media', 'footazix-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view media" ON storage.objects;
CREATE POLICY "Public can view media"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'footazix-media');

DROP POLICY IF EXISTS "Admins can upload and manage media" ON storage.objects;
CREATE POLICY "Admins can upload and manage media"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'footazix-media' AND public.is_admin())
  WITH CHECK (bucket_id = 'footazix-media' AND public.is_admin());

-- ==============================================================================
-- 12. INITIAL SEED DATA
-- ==============================================================================
INSERT INTO public.site_settings (id, brand_name, domain, url, instagram, email)
VALUES ('default', 'FOOTAZIX', 'footazix.site', 'https://footazix.site', 'https://www.instagram.com/footazix', 'footazix@gmail.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hero_content (id, headline_line1, headline_line2, supporting_line, description)
VALUES ('default', 'TURN RAW FOOTAGE INTO', 'CONTENT WORTH WATCHING.', 'Video Editing • Content • Growth', 'We turn raw footage and ideas into content people want to watch. High-retention editing for creators, brands, and businesses.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.vsl_settings (id, label, heading, description, video_source, video_url, poster_url, published)
VALUES ('default', 'FOUNDER VSL', 'SEE HOW FOOTAZIX WORKS.', 'A quick 90-second walk through our high-retention video editing framework.', 'direct', 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-video-editor-working-on-his-computer-42861-large.mp4', '/assets/vsl/vsl-poster.jpg', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.about_content (id, heading, subheading)
VALUES ('default', 'RAW → EDIT → READY', 'Three clean stages. Zero friction.')
ON CONFLICT (id) DO NOTHING;

-- Initial Services
INSERT INTO public.services (number, title, description, features, highlighted, visible, display_order)
VALUES 
  ('01', 'VIDEO EDITING', 'High-retention short-form and long-form video editing engineered to capture and hold audience attention from the first second.', ARRAY['Pacing & Retention Hooks', 'Motion Graphics & Subtitles', 'Sound Design & Transitions', 'Format Adaptation (9:16 & 16:9)'], true, true, 1),
  ('02', 'CONTENT SCRIPTING', 'Engaging hooks and punchy scripts crafted around your core message to keep viewers invested until the final frame.', ARRAY['Opening Hook Engineering', 'Structure & Story Flow', 'Concept Ideation', 'Clear Call-to-Actions'], false, true, 2),
  ('03', 'CONTENT STRATEGY', 'Targeted advisory and publishing frameworks to turn one piece of recorded footage into multiple high-performing assets.', ARRAY['Footage Auditing & Batching', 'Cross-Platform Repurposing', 'Content Cadence Planning', 'Growth Optimization'], false, true, 3)
ON CONFLICT DO NOTHING;

-- Initial Team
INSERT INTO public.team_members (name, role, description, photo, social_link, email, display_order, visible)
VALUES 
  ('Sanamatum', 'Founder & Creative Lead', 'Directing creative video editing workflows and high-retention content systems for modern creators and brands.', '/assets/founder.jpg', 'https://www.instagram.com/footazix', 'footazix@gmail.com', 1, true)
ON CONFLICT DO NOTHING;

-- Initial Projects
INSERT INTO public.projects (title, category, description, cover_image, client_name, display_order, status)
VALUES 
  ('Creator Retention Reel', 'Reels', 'Paced short-form edit transforming raw talking-head footage into high-retention social content with kinetic typography.', '/assets/portfolio/project-01/cover.jpg', 'Creator Showcase', 1, 'published'),
  ('Cinematic Brand Story', 'Brand', 'Editorial cut showcasing brand narrative with punchy sound design and color grading.', '/assets/vsl/vsl-poster.jpg', 'Modern Brand', 2, 'published'),
  ('YouTube Long-Form Hook Cut', 'YouTube', 'Dynamic intro hook sequence engineered to retain viewer attention past the crucial 30-second mark.', '/assets/portfolio/project-01/cover.jpg', 'YouTube Studio', 3, 'published')
ON CONFLICT DO NOTHING;
