/**
 * FOOTAZIX — Content Service
 * 
 * Interacts with Supabase tables:
 * - `site_settings`
 * - `hero_content`
 * - `vsl_settings`
 * - `about_content`
 * 
 * Falls back to local/cached state when Supabase environment variables are pending.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { WebsiteContent, VSLSettings } from '../types';
import { INITIAL_WEBSITE_CONTENT } from '../data/mockData';

const STORAGE_KEY = 'footazix_website_content';

type Listener = (content: WebsiteContent) => void;
const listeners: Set<Listener> = new Set();

function getStoredContent(): WebsiteContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_WEBSITE_CONTENT;
    return { ...INITIAL_WEBSITE_CONTENT, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Failed reading website content from localStorage:', err);
    return INITIAL_WEBSITE_CONTENT;
  }
}

function saveStoredContent(content: WebsiteContent): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    listeners.forEach((fn) => fn(content));
  } catch (err) {
    console.error('Failed saving website content to localStorage:', err);
  }
}

export const contentService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async getWebsiteContent(): Promise<WebsiteContent> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const [
          { data: siteSettings },
          { data: heroContent },
          { data: vslSettings },
          { data: aboutContent },
        ] = await Promise.all([
          supabase.from('site_settings').select('*').eq('id', 'default').maybeSingle(),
          supabase.from('hero_content').select('*').eq('id', 'default').maybeSingle(),
          supabase.from('vsl_settings').select('*').eq('id', 'default').maybeSingle(),
          supabase.from('about_content').select('*').eq('id', 'default').maybeSingle(),
        ]);

        const current = getStoredContent();

        const content: WebsiteContent = {
          brand: {
            name: siteSettings?.brand_name || current.brand.name,
            domain: siteSettings?.domain || current.brand.domain,
            url: siteSettings?.url || current.brand.url,
            instagram: siteSettings?.instagram || current.brand.instagram,
            instagramHandle: siteSettings?.instagram_handle || current.brand.instagramHandle,
            email: siteSettings?.email || current.brand.email,
            tagline: siteSettings?.tagline || current.brand.tagline,
            supportingLine: siteSettings?.supporting_line || current.brand.supportingLine,
            accentColor: siteSettings?.accent_color || current.brand.accentColor,
          },
          hero: {
            badgeText: heroContent?.badge_text || current.hero.badgeText,
            headlineLine1: heroContent?.headline_line1 || current.hero.headlineLine1,
            headlineLine2: heroContent?.headline_line2 || current.hero.headlineLine2,
            supportingLine: heroContent?.supporting_line || current.hero.supportingLine,
            description: heroContent?.description || current.hero.description,
            primaryCta: heroContent?.primary_cta || current.hero.primaryCta,
            secondaryCta: heroContent?.secondary_cta || current.hero.secondaryCta,
          },
          vsl: {
            label: vslSettings?.label || current.vsl.label,
            heading: vslSettings?.heading || current.vsl.heading,
            description: vslSettings?.description || current.vsl.description,
            videoSource: vslSettings?.video_source || current.vsl.videoSource,
            videoUrl: vslSettings?.video_url || current.vsl.videoUrl,
            posterUrl: vslSettings?.poster_url || current.vsl.posterUrl,
            captionUrl: vslSettings?.caption_url || current.vsl.captionUrl,
            published: vslSettings?.published ?? current.vsl.published,
          },
          rawToReady: {
            heading: aboutContent?.heading || current.rawToReady.heading,
            subheading: aboutContent?.subheading || current.rawToReady.subheading,
            steps: aboutContent?.steps || current.rawToReady.steps,
          },
          sectionHeadings: {
            portfolioHeading: siteSettings?.portfolio_heading || current.sectionHeadings.portfolioHeading,
            portfolioSubheading: siteSettings?.portfolio_subheading || current.sectionHeadings.portfolioSubheading,
            servicesHeading: siteSettings?.services_heading || current.sectionHeadings.servicesHeading,
            servicesSubheading: siteSettings?.services_subheading || current.sectionHeadings.servicesSubheading,
            teamHeading: siteSettings?.team_heading || current.sectionHeadings.teamHeading,
            teamCopy: siteSettings?.team_copy || current.sectionHeadings.teamCopy,
            finalCtaHeadline: siteSettings?.final_cta_headline || current.sectionHeadings.finalCtaHeadline,
            finalCtaSupporting: siteSettings?.final_cta_supporting || current.sectionHeadings.finalCtaSupporting,
          },
          footer: {
            copyrightText: siteSettings?.footer_copyright || current.footer.copyrightText,
            tagline: siteSettings?.footer_tagline || current.footer.tagline,
          },
        };

        saveStoredContent(content);
        return content;
      } catch (err) {
        console.warn('Error fetching website content from Supabase, falling back to cache:', err);
      }
    }

    return getStoredContent();
  },

  async updateWebsiteContent(partial: Partial<WebsiteContent>): Promise<WebsiteContent> {
    const current = getStoredContent();
    const updated: WebsiteContent = {
      ...current,
      ...partial,
      brand: { ...current.brand, ...(partial.brand || {}) },
      hero: { ...current.hero, ...(partial.hero || {}) },
      vsl: { ...current.vsl, ...(partial.vsl || {}) },
      rawToReady: { ...current.rawToReady, ...(partial.rawToReady || {}) },
      sectionHeadings: { ...current.sectionHeadings, ...(partial.sectionHeadings || {}) },
      footer: { ...current.footer, ...(partial.footer || {}) },
    };

    saveStoredContent(updated);

    if (isSupabaseConfigured() && supabase) {
      try {
        const promises = [];

        if (partial.brand || partial.sectionHeadings || partial.footer) {
          promises.push(
            supabase.from('site_settings').upsert({
              id: 'default',
              brand_name: updated.brand.name,
              domain: updated.brand.domain,
              url: updated.brand.url,
              instagram: updated.brand.instagram,
              instagram_handle: updated.brand.instagramHandle,
              email: updated.brand.email,
              tagline: updated.brand.tagline,
              supporting_line: updated.brand.supportingLine,
              accent_color: updated.brand.accentColor,
              portfolio_heading: updated.sectionHeadings.portfolioHeading,
              portfolio_subheading: updated.sectionHeadings.portfolioSubheading,
              services_heading: updated.sectionHeadings.servicesHeading,
              services_subheading: updated.sectionHeadings.servicesSubheading,
              team_heading: updated.sectionHeadings.teamHeading,
              team_copy: updated.sectionHeadings.teamCopy,
              final_cta_headline: updated.sectionHeadings.finalCtaHeadline,
              final_cta_supporting: updated.sectionHeadings.finalCtaSupporting,
              footer_copyright: updated.footer.copyrightText,
              footer_tagline: updated.footer.tagline,
              updated_at: new Date().toISOString(),
            })
          );
        }

        if (partial.hero) {
          promises.push(
            supabase.from('hero_content').upsert({
              id: 'default',
              badge_text: updated.hero.badgeText,
              headline_line1: updated.hero.headlineLine1,
              headline_line2: updated.hero.headlineLine2,
              supporting_line: updated.hero.supportingLine,
              description: updated.hero.description,
              primary_cta: updated.hero.primaryCta,
              secondary_cta: updated.hero.secondaryCta,
              updated_at: new Date().toISOString(),
            })
          );
        }

        if (partial.vsl) {
          promises.push(
            supabase.from('vsl_settings').upsert({
              id: 'default',
              label: updated.vsl.label,
              heading: updated.vsl.heading,
              description: updated.vsl.description,
              video_source: updated.vsl.videoSource,
              video_url: updated.vsl.videoUrl,
              poster_url: updated.vsl.posterUrl,
              caption_url: updated.vsl.captionUrl || null,
              published: updated.vsl.published,
              updated_at: new Date().toISOString(),
            })
          );
        }

        if (partial.rawToReady) {
          promises.push(
            supabase.from('about_content').upsert({
              id: 'default',
              heading: updated.rawToReady.heading,
              subheading: updated.rawToReady.subheading,
              steps: updated.rawToReady.steps,
              updated_at: new Date().toISOString(),
            })
          );
        }

        await Promise.all(promises);
      } catch (err) {
        console.error('Failed to sync website content to Supabase:', err);
      }
    }

    return updated;
  },

  async getVSLSettings(): Promise<VSLSettings> {
    const content = await this.getWebsiteContent();
    return content.vsl;
  },

  async updateVSLSettings(vsl: Partial<VSLSettings>): Promise<VSLSettings> {
    const updated = await this.updateWebsiteContent({ vsl: vsl as VSLSettings });
    return updated.vsl;
  },

  async resetWebsiteContent(): Promise<WebsiteContent> {
    saveStoredContent(INITIAL_WEBSITE_CONTENT);
    if (isSupabaseConfigured() && supabase) {
      try {
        await this.updateWebsiteContent(INITIAL_WEBSITE_CONTENT);
      } catch (err) {
        console.warn('Reset Supabase error:', err);
      }
    }
    return INITIAL_WEBSITE_CONTENT;
  },
};
