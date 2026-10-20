-- ==============================================================================
-- FOOTAZIX — Testimonial & Feedback Gallery Migration
-- Table: public.feedback_gallery
-- Storage: footazix-media/feedback/
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.feedback_gallery (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  aspect_ratio TEXT DEFAULT '1:1',
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  visible BOOLEAN DEFAULT true,
  alt_text TEXT DEFAULT 'Client Feedback Screenshot',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.feedback_gallery ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policy: Anyone can view published & visible feedback images
CREATE POLICY "Public visitors can view published feedback gallery"
  ON public.feedback_gallery
  FOR SELECT
  USING (published = true AND visible = true);

-- 2. Authenticated Admin Full Access Policy
CREATE POLICY "Admins have full access to feedback gallery"
  ON public.feedback_gallery
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Service role fallback for CMS direct updates
CREATE POLICY "Service role has full access to feedback gallery"
  ON public.feedback_gallery
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Indices for rapid ordering and lookup
CREATE INDEX IF NOT EXISTS idx_feedback_gallery_order ON public.feedback_gallery (display_order ASC);
CREATE INDEX IF NOT EXISTS idx_feedback_gallery_visibility ON public.feedback_gallery (published, visible);
