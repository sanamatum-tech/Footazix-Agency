/**
 * FOOTAZIX — Content Service
 * 
 * Interacts with Supabase:
 * - `site_settings`
 * - `hero_content`
 * - `vsl_settings`
 * - `about_content`
 * - Storage `footazix-media/config/extended_cms_content.json`
 * 
 * Falls back seamlessly to local cache so the website is always fast and resilient.
 */

import { supabase, isSupabaseConfigured, SUPABASE_STORAGE_BUCKET } from '../lib/supabase';
import { WebsiteContent, VSLSettings } from '../types';
import { INITIAL_WEBSITE_CONTENT } from '../data/mockData';

const STORAGE_KEY = 'footazix_website_content';

type Listener = (content: WebsiteContent) => void;
const listeners: Set<Listener> = new Set();

function getStoredContent(): WebsiteContent {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return INITIAL_WEBSITE_CONTENT;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_WEBSITE_CONTENT;
    const parsed = JSON.parse(raw);
    
    // Purge any stale legacy logo paths or obsolete logo IDs from cached local storage
    if (
      parsed.brandingAssets?.headerLogo?.url &&
      (parsed.brandingAssets.headerLogo.url.includes('1790995570940') ||
        parsed.brandingAssets.headerLogo.url.includes('/assets/logo/') ||
        parsed.brandingAssets.headerLogo.url.startsWith('/assets/'))
    ) {
      parsed.brandingAssets.headerLogo.url = '';
    }
    if (
      parsed.brandingAssets?.footerLogo?.url &&
      (parsed.brandingAssets.footerLogo.url.includes('1790995570940') ||
        parsed.brandingAssets.footerLogo.url.includes('/assets/logo/') ||
        parsed.brandingAssets.footerLogo.url.startsWith('/assets/'))
    ) {
      parsed.brandingAssets.footerLogo.url = '';
    }
    if (
      parsed.brandingAssets?.favicon?.url &&
      parsed.brandingAssets.favicon.url.includes('favicon.svg')
    ) {
      parsed.brandingAssets.favicon.url = '/favicon.png';
    }

    return deepMerge(INITIAL_WEBSITE_CONTENT, parsed);
  } catch (err) {
    console.warn('Failed reading website content from localStorage:', err);
    return INITIAL_WEBSITE_CONTENT;
  }
}

function saveStoredContent(content: WebsiteContent): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    }
    listeners.forEach((fn) => fn(content));
  } catch (err) {
    console.error('Failed saving website content to localStorage:', err);
  }
}

function deepMerge(target: any, source: any): any {
  if (!source) return target;
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      key in target &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      output[key] = deepMerge(target[key], source[key]);
    } else if (source[key] !== undefined) {
      output[key] = source[key];
    }
  }
  return output;
}

let activeContentFetchPromise: Promise<WebsiteContent> | null = null;

export const contentService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async getWebsiteContent(): Promise<WebsiteContent> {
    if (activeContentFetchPromise) {
      return activeContentFetchPromise;
    }

    activeContentFetchPromise = (async () => {
      try {
        const current = getStoredContent();

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

        // Attempt reading authoritative extended configuration from Supabase storage with cache-busting
        let extendedFromStorage: Partial<WebsiteContent> | null = null;
        try {
          const publicConfigUrl = `${supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl('config/extended_cms_content.json').data.publicUrl}?t=${Date.now()}`;
          const res = await fetch(publicConfigUrl, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
            },
          });
          if (res.ok) {
            extendedFromStorage = await res.json();
          } else {
            const { data: fileData, error: fileError } = await supabase.storage
              .from(SUPABASE_STORAGE_BUCKET)
              .download('config/extended_cms_content.json');

            if (!fileError && fileData) {
              const text = await fileData.text();
              extendedFromStorage = JSON.parse(text);
            }
          }
        } catch {
          try {
            const { data: fileData, error: fileError } = await supabase.storage
              .from(SUPABASE_STORAGE_BUCKET)
              .download('config/extended_cms_content.json');

            if (!fileError && fileData) {
              const text = await fileData.text();
              extendedFromStorage = JSON.parse(text);
            }
          } catch {
            // Storage file may not exist yet on fresh installations
          }
        }

        const baseMerged = extendedFromStorage
          ? deepMerge(current, extendedFromStorage)
          : current;

        // Sanitize OG image: enforce single source of truth and purge legacy VSL poster / relative paths
        const defaultOgUrl = 'https://gdwlkqrzcixjajzvcwvg.supabase.co/storage/v1/object/public/footazix-media/branding/1790997433105_1001608268.png';
        let resolvedOgUrl = baseMerged.brandingAssets?.ogImage?.url;
        if (!resolvedOgUrl || resolvedOgUrl.includes('vsl-poster.jpg') || resolvedOgUrl.startsWith('/')) {
          resolvedOgUrl = (baseMerged.seo?.ogImage && !baseMerged.seo.ogImage.includes('vsl-poster.jpg') && !baseMerged.seo.ogImage.startsWith('/'))
            ? baseMerged.seo.ogImage
            : defaultOgUrl;
        }

        const resolvedOgAlt = baseMerged.brandingAssets?.ogImage?.alt || baseMerged.seo?.ogImageAlt || 'Footazix Content Growth Agency';
        const resolvedOgWidth = baseMerged.brandingAssets?.ogImage?.width || 1734;
        const resolvedOgHeight = baseMerged.brandingAssets?.ogImage?.height || 907;
        const resolvedOgType = baseMerged.brandingAssets?.ogImage?.type || 'image/png';

        if (baseMerged.brandingAssets) {
          baseMerged.brandingAssets.ogImage = {
            url: resolvedOgUrl,
            alt: resolvedOgAlt,
            width: resolvedOgWidth,
            height: resolvedOgHeight,
            type: resolvedOgType,
          };
        }
        // Sanitize Header & Footer Logos: purge obsolete asset (1790995570940) or legacy relative paths
        if (baseMerged.brandingAssets) {
          if (
            baseMerged.brandingAssets.headerLogo?.url &&
            (baseMerged.brandingAssets.headerLogo.url.includes('1790995570940') ||
              baseMerged.brandingAssets.headerLogo.url.includes('/assets/logo/') ||
              baseMerged.brandingAssets.headerLogo.url.startsWith('/assets/'))
          ) {
            baseMerged.brandingAssets.headerLogo.url = '';
          }

          if (
            baseMerged.brandingAssets.footerLogo?.url &&
            (baseMerged.brandingAssets.footerLogo.url.includes('1790995570940') ||
              baseMerged.brandingAssets.footerLogo.url.includes('/assets/logo/') ||
              baseMerged.brandingAssets.footerLogo.url.startsWith('/assets/'))
          ) {
            baseMerged.brandingAssets.footerLogo.url = baseMerged.brandingAssets.headerLogo?.url || '';
          }

          if (baseMerged.brandingAssets.footerLogo?.useHeaderLogo) {
            baseMerged.brandingAssets.footerLogo.url = baseMerged.brandingAssets.headerLogo?.url || '';
          }

          if (
            baseMerged.brandingAssets.favicon?.url &&
            baseMerged.brandingAssets.favicon.url.includes('favicon.svg')
          ) {
            baseMerged.brandingAssets.favicon.url = '/favicon.png';
          }
        }

        const content: WebsiteContent = {
          ...baseMerged,
          brand: {
            ...baseMerged.brand,
            name: siteSettings?.brand_name || baseMerged.brand.name,
            domain: siteSettings?.domain || baseMerged.brand.domain,
            url: siteSettings?.url || baseMerged.brand.url,
            instagram: siteSettings?.instagram ?? baseMerged.brand.instagram,
            instagramHandle: siteSettings?.instagram_handle || baseMerged.brand.instagramHandle,
            email: siteSettings?.email || baseMerged.brand.email,
            tagline: siteSettings?.tagline || baseMerged.brand.tagline,
            supportingLine: siteSettings?.supporting_line || baseMerged.brand.supportingLine,
            accentColor: siteSettings?.accent_color || baseMerged.brand.accentColor,
          },
          hero: {
            ...baseMerged.hero,
            badgeText: heroContent?.badge_text || baseMerged.hero.badgeText,
            headlineLine1: heroContent?.headline_line1 || baseMerged.hero.headlineLine1,
            headlineLine2: heroContent?.headline_line2 || baseMerged.hero.headlineLine2,
            supportingLine: heroContent?.supporting_line || baseMerged.hero.supportingLine,
            description: heroContent?.description || baseMerged.hero.description,
            primaryCta: heroContent?.primary_cta || baseMerged.hero.primaryCta,
            secondaryCta: heroContent?.secondary_cta || baseMerged.hero.secondaryCta,
          },
          vsl: {
            ...baseMerged.vsl,
            label: vslSettings?.label || baseMerged.vsl.label,
            heading: vslSettings?.heading || baseMerged.vsl.heading,
            description: vslSettings?.description || baseMerged.vsl.description,
            videoSource: vslSettings?.video_source || baseMerged.vsl.videoSource,
            videoUrl: vslSettings?.video_url || baseMerged.vsl.videoUrl,
            posterUrl: vslSettings?.poster_url || baseMerged.vsl.posterUrl,
            captionUrl: vslSettings?.caption_url ?? baseMerged.vsl.captionUrl,
            published: vslSettings?.published ?? baseMerged.vsl.published,
          },
          rawToReady: {
            ...baseMerged.rawToReady,
            heading: aboutContent?.heading || baseMerged.rawToReady.heading,
            subheading: aboutContent?.subheading || baseMerged.rawToReady.subheading,
            steps: aboutContent?.steps || baseMerged.rawToReady.steps,
          },
          sectionHeadings: {
            ...baseMerged.sectionHeadings,
            portfolioHeading: siteSettings?.portfolio_heading || baseMerged.sectionHeadings.portfolioHeading,
            portfolioSubheading: siteSettings?.portfolio_subheading || baseMerged.sectionHeadings.portfolioSubheading,
            servicesHeading: siteSettings?.services_heading || baseMerged.sectionHeadings.servicesHeading,
            servicesSubheading: siteSettings?.services_subheading || baseMerged.sectionHeadings.servicesSubheading,
            teamHeading: siteSettings?.team_heading || baseMerged.sectionHeadings.teamHeading,
            teamCopy: siteSettings?.team_copy || baseMerged.sectionHeadings.teamCopy,
            finalCtaHeadline: siteSettings?.final_cta_headline || baseMerged.sectionHeadings.finalCtaHeadline,
            finalCtaSupporting: siteSettings?.final_cta_supporting || baseMerged.sectionHeadings.finalCtaSupporting,
          },
          footer: {
            ...baseMerged.footer,
            copyrightText: siteSettings?.footer_copyright || baseMerged.footer.copyrightText,
            tagline: siteSettings?.footer_tagline || baseMerged.footer.tagline,
          },
        };

        // Guarantee sectionVisibility.faq is enabled by default
        if (content.sectionVisibility && content.sectionVisibility.faq === undefined) {
          content.sectionVisibility.faq = true;
        }

        // Guarantee sectionOrder contains 'faq' after services and before finalCta
        if (content.sectionOrder && !content.sectionOrder.includes('faq')) {
          const sIdx = content.sectionOrder.indexOf('services');
          if (sIdx !== -1) {
            content.sectionOrder.splice(sIdx + 1, 0, 'faq');
          } else {
            const ctaIdx = content.sectionOrder.indexOf('finalCta');
            if (ctaIdx !== -1) {
              content.sectionOrder.splice(ctaIdx, 0, 'faq');
            } else {
              content.sectionOrder.push('faq');
            }
          }
        }

        saveStoredContent(content);
        return content;
      } catch (err) {
        console.warn('Error fetching website content from Supabase, falling back to cache:', err);
      }
    }

    return current;
  } finally {
    activeContentFetchPromise = null;
  }
})();

return activeContentFetchPromise;
},

  async updateWebsiteContent(partial: Partial<WebsiteContent>): Promise<WebsiteContent> {
    const current = getStoredContent();
    const updated: WebsiteContent = deepMerge(current, partial);

    // Keep brandingAssets.ogImage and seo.ogImage in 100% lockstep
    if (partial.brandingAssets?.ogImage?.url) {
      updated.seo.ogImage = partial.brandingAssets.ogImage.url;
      if (partial.brandingAssets.ogImage.alt) updated.seo.ogImageAlt = partial.brandingAssets.ogImage.alt;
      if (partial.brandingAssets.ogImage.width) updated.seo.ogImageWidth = partial.brandingAssets.ogImage.width;
      if (partial.brandingAssets.ogImage.height) updated.seo.ogImageHeight = partial.brandingAssets.ogImage.height;
      if (partial.brandingAssets.ogImage.type) updated.seo.ogImageType = partial.brandingAssets.ogImage.type;
    } else if (partial.seo?.ogImage) {
      updated.brandingAssets.ogImage = {
        ...updated.brandingAssets.ogImage,
        url: partial.seo.ogImage,
        alt: partial.seo.ogImageAlt || updated.brandingAssets.ogImage.alt,
        width: partial.seo.ogImageWidth || updated.brandingAssets.ogImage.width,
        height: partial.seo.ogImageHeight || updated.brandingAssets.ogImage.height,
        type: partial.seo.ogImageType || updated.brandingAssets.ogImage.type,
      };
    }

    // Guarantee sectionVisibility.faq is enabled by default
    if (updated.sectionVisibility && updated.sectionVisibility.faq === undefined) {
      updated.sectionVisibility.faq = true;
    }

    // Guarantee sectionOrder contains 'faq'
    if (updated.sectionOrder && !updated.sectionOrder.includes('faq')) {
      const sIdx = updated.sectionOrder.indexOf('services');
      if (sIdx !== -1) {
        updated.sectionOrder.splice(sIdx + 1, 0, 'faq');
      } else {
        const ctaIdx = updated.sectionOrder.indexOf('finalCta');
        if (ctaIdx !== -1) {
          updated.sectionOrder.splice(ctaIdx, 0, 'faq');
        } else {
          updated.sectionOrder.push('faq');
        }
      }
    }

    // Save to local cache immediately
    saveStoredContent(updated);

    if (isSupabaseConfigured() && supabase) {
      try {
        const promises: PromiseLike<any>[] = [];

        // 1. Sync public.site_settings
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

        // 2. Sync public.hero_content
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

        // 3. Sync public.vsl_settings
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

        // 4. Sync public.about_content
        promises.push(
          supabase.from('about_content').upsert({
            id: 'default',
            heading: updated.rawToReady.heading,
            subheading: updated.rawToReady.subheading,
            steps: updated.rawToReady.steps,
            updated_at: new Date().toISOString(),
          })
        );

        // 5. Store extended CMS snapshot into Supabase Storage
        try {
          const payloadToUpload: any = { ...updated };
          if (!payloadToUpload.faqs) {
            try {
              const { data: fileData } = await supabase.storage
                .from(SUPABASE_STORAGE_BUCKET)
                .download('config/extended_cms_content.json');
              if (fileData) {
                const text = await fileData.text();
                const parsedExisting = JSON.parse(text);
                if (Array.isArray(parsedExisting.faqs)) {
                  payloadToUpload.faqs = parsedExisting.faqs;
                }
              }
            } catch {
              // Non-blocking
            }
          }

          const jsonBlob = new Blob([JSON.stringify(payloadToUpload, null, 2)], {
            type: 'application/json',
          });
          promises.push(
            supabase.storage
              .from(SUPABASE_STORAGE_BUCKET)
              .upload('config/extended_cms_content.json', jsonBlob, {
                upsert: true,
                contentType: 'application/json',
                cacheControl: '0',
              })
          );
        } catch (storageErr) {
          console.warn('Storage JSON upload non-blocking warning:', storageErr);
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
