-- ==============================================================================
-- FOOTAZIX CMS EXTENSION MIGRATION
-- Run this in Supabase SQL Editor (optional, since extended CMS automatically
-- persists via Supabase Storage + site_settings + hero_content + vsl_settings + about_content)
-- ==============================================================================

ALTER TABLE IF EXISTS public.site_settings
  ADD COLUMN IF NOT EXISTS header_settings JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS section_visibility JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS section_order JSONB DEFAULT '["hero", "system", "portfolio", "process", "services", "about", "finalCta"]'::jsonb,
  ADD COLUMN IF NOT EXISTS branding_assets JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS seo_settings JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS legal_content JSONB DEFAULT '{}'::jsonb;
