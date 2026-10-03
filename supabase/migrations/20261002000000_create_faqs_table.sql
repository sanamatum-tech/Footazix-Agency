-- ==============================================================================
-- FOOTAZIX — FAQ TABLE & RLS POLICIES MIGRATION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  display_order INTEGER NOT NULL DEFAULT 1,
  published BOOLEAN NOT NULL DEFAULT true,
  visible BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  last_reviewed_date DATE DEFAULT CURRENT_DATE,
  related_service TEXT,
  related_project TEXT,
  cta_text TEXT,
  cta_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for efficient ordering and category filtering
CREATE INDEX IF NOT EXISTS idx_faqs_display_order ON public.faqs (display_order ASC);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON public.faqs (category);
CREATE INDEX IF NOT EXISTS idx_faqs_published_visible ON public.faqs (published, visible);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- 1. Public visitors can view published & visible FAQs
DROP POLICY IF EXISTS "Public can view published faqs" ON public.faqs;
CREATE POLICY "Public can view published faqs"
  ON public.faqs FOR SELECT
  TO anon, authenticated
  USING (published = true AND visible = true);

-- 2. Authenticated administrators can manage all FAQs
DROP POLICY IF EXISTS "Admins can manage faqs" ON public.faqs;
CREATE POLICY "Admins can manage faqs"
  ON public.faqs FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
