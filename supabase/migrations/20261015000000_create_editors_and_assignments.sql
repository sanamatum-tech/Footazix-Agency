-- ==============================================================================
-- FOOTAZIX DATABASE MIGRATION: EDITORS & VIDEO ASSIGNMENTS
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. EDITORS TABLE
CREATE TABLE IF NOT EXISTS public.editors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('editor', 'lead_editor')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'inactive')),
  avatar TEXT,
  specialties JSONB DEFAULT '[]'::jsonb,
  software JSONB DEFAULT '[]'::jsonb,
  bio TEXT,
  phone TEXT,
  turnaround_hours_avg NUMERIC DEFAULT 24,
  assigned_tasks_count INTEGER DEFAULT 0,
  completed_tasks_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_active TEXT DEFAULT 'Recently'
);

ALTER TABLE public.editors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active editors" ON public.editors;
CREATE POLICY "Public can view active editors"
  ON public.editors FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage editors" ON public.editors;
CREATE POLICY "Admins can manage editors"
  ON public.editors FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 2. VIDEO ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.editor_assignments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  editor_id TEXT NOT NULL REFERENCES public.editors(id) ON DELETE CASCADE,
  editor_name TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT '9:16 Reel',
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'review_needed', 'revision_requested', 'approved', 'completed', 'archived')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  due_date TIMESTAMPTZ NOT NULL,
  target_duration TEXT,
  raw_footage_url TEXT NOT NULL,
  asset_folder_url TEXT,
  brief TEXT NOT NULL,
  style_notes TEXT,
  draft_video_url TEXT,
  feedback_notes TEXT,
  editor_notes TEXT,
  submission_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.editor_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Editors and Admins can view assignments" ON public.editor_assignments;
CREATE POLICY "Editors and Admins can view assignments"
  ON public.editor_assignments FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Editors and Admins can update assignments" ON public.editor_assignments;
CREATE POLICY "Editors and Admins can update assignments"
  ON public.editor_assignments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. INITIAL SEED EDITORS
INSERT INTO public.editors (id, name, email, role, status, specialties, software, bio, turnaround_hours_avg, assigned_tasks_count, completed_tasks_count)
VALUES
  ('editor-alex-01', 'Alex Rivera', 'alex@footazix.com', 'lead_editor', 'active', '["High-Retention Reels", "Sound Design", "Pacing & Hooks"]'::jsonb, '["Premiere Pro", "After Effects", "DaVinci Resolve"]'::jsonb, 'Lead Post-Production Editor specializing in fast-paced founder reels and YouTube hooks.', 24, 2, 48),
  ('editor-maya-02', 'Maya Chen', 'maya@footazix.com', 'editor', 'active', '["Motion Graphics", "Typography Animations", "Brand Stories"]'::jsonb, '["After Effects", "Premiere Pro", "Illustrator"]'::jsonb, 'Visual effects and kinetic typography specialist for luxury tech & creator brands.', 36, 1, 34),
  ('editor-david-03', 'David Vance', 'david@footazix.com', 'editor', 'active', '["YouTube Long-Form", "Color Grading", "Documentary Pacing"]'::jsonb, '["DaVinci Resolve Studio", "Premiere Pro"]'::jsonb, 'Colorist and long-form storytelling editor with deep narrative pacing expertise.', 48, 1, 29)
ON CONFLICT (id) DO NOTHING;

-- Grant access to Supabase API roles
GRANT ALL ON TABLE public.editors TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.editor_assignments TO anon, authenticated, service_role;
