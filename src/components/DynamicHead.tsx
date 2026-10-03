import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';

/**
 * Universal Absolute HTTPS fallback OG Image stored in Supabase Storage.
 * This is the deliberate Footazix brand card uploaded to Supabase Storage.
 */
export const DEFAULT_FOOTAZIX_OG_IMAGE =
  'https://gdwlkqrzcixjajzvcwvg.supabase.co/storage/v1/object/public/footazix-media/branding/1790997433105_1001608268.png';

export const FALLBACK_FOOTAZIX_OG_ASSET = 'https://footazix.site/assets/branding/footazix-og-default.png';

/**
 * Helper to ensure a URL is an absolute HTTPS URL suitable for social link scrapers.
 * Rejects temporary blobs, localhost, and legacy VSL posters.
 */
export function resolveUniversalOgImageUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return DEFAULT_FOOTAZIX_OG_IMAGE;
  }
  const trimmed = rawUrl.trim();
  // Filter out any legacy references to the VSL poster or AI studio placeholders
  if (
    trimmed.includes('vsl-poster.jpg') ||
    trimmed.includes('blob:') ||
    trimmed.includes('localhost') ||
    trimmed === ''
  ) {
    return DEFAULT_FOOTAZIX_OG_IMAGE;
  }
  if (trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('http://')) {
    return trimmed.replace('http://', 'https://');
  }
  if (trimmed.startsWith('/')) {
    return `https://footazix.site${trimmed}`;
  }
  return DEFAULT_FOOTAZIX_OG_IMAGE;
}

/**
 * DynamicHead Component
 * 
 * Synchronizes:
 * - document.title
 * - meta description & keywords
 * - Complete OpenGraph specifications (og:type, og:url, og:site_name, og:title, og:description,
 *   og:image, og:image:url, og:image:secure_url, og:image:type, og:image:width, og:image:height, og:image:alt)
 * - Complete X / Twitter Card specifications (twitter:card, twitter:title, twitter:description, twitter:image, twitter:image:alt)
 * - Canonical link tag
 * - Favicon and Apple Touch Icon
 * - Schema.org JSON-LD
 * 
 * Synchronized live from CMS content.
 */
export const DynamicHead: React.FC = () => {
  const { content } = useApp();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Page Title
    const title =
      content.seo?.siteTitle ||
      `${content.brand?.name || 'Footazix'} — Turn Raw Footage Into Content Worth Watching`;
    document.title = title;

    // Helper for updating or creating meta tags
    const setMetaTag = (attr: 'name' | 'property', key: string, value: string | undefined | null) => {
      if (value === undefined || value === null || value === '') return;
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    // Helper for link tags
    const setLinkTag = (rel: string, href: string | undefined, type?: string) => {
      if (!href) return;
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
      if (type) {
        el.setAttribute('type', type);
      }
    };

    // 2. Standard Search Meta
    const metaDescription =
      content.seo?.metaDescription ||
      'Footazix is a content growth agency helping creators, brands and businesses turn raw footage into engaging content through professional editing, scripting and content strategy.';
    setMetaTag('name', 'description', metaDescription);

    if (content.seo?.keywords) {
      setMetaTag('name', 'keywords', content.seo.keywords);
    }
    setMetaTag('name', 'robots', 'index, follow');

    // 3. Universal OpenGraph Metadata
    const ogTitle = content.seo?.ogTitle || title;
    const ogDesc = content.seo?.ogDescription || metaDescription;
    const canonicalUrl = content.seo?.canonicalUrl || 'https://footazix.site';
    const siteName = content.brand?.name || 'FOOTAZIX';

    // Prioritize CMS brandingAssets.ogImage as single source of truth
    const candidateOgUrl = content.brandingAssets?.ogImage?.url || content.seo?.ogImage;
    const ogImgUrl = resolveUniversalOgImageUrl(candidateOgUrl);
    const ogImgAlt =
      content.brandingAssets?.ogImage?.alt ||
      content.seo?.ogImageAlt ||
      `${siteName} Content Growth Agency`;

    const ogImgWidth = String(
      content.brandingAssets?.ogImage?.width || content.seo?.ogImageWidth || 1734
    );
    const ogImgHeight = String(
      content.brandingAssets?.ogImage?.height || content.seo?.ogImageHeight || 907
    );
    const ogImgType =
      content.brandingAssets?.ogImage?.type ||
      content.seo?.ogImageType ||
      (ogImgUrl.endsWith('.jpg') || ogImgUrl.endsWith('.jpeg') ? 'image/jpeg' : 'image/png');

    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:site_name', siteName);
    setMetaTag('property', 'og:title', ogTitle);
    setMetaTag('property', 'og:description', ogDesc);
    setMetaTag('property', 'og:image', ogImgUrl);
    setMetaTag('property', 'og:image:url', ogImgUrl);
    setMetaTag('property', 'og:image:secure_url', ogImgUrl);
    setMetaTag('property', 'og:image:type', ogImgType);
    setMetaTag('property', 'og:image:width', ogImgWidth);
    setMetaTag('property', 'og:image:height', ogImgHeight);
    setMetaTag('property', 'og:image:alt', ogImgAlt);

    // 4. X / Twitter Card Compatibility
    const twitterHandle = content.brand?.instagramHandle
      ? `@${content.brand.instagramHandle.replace('@', '')}`
      : '@footazix';

    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:site', twitterHandle);
    setMetaTag('name', 'twitter:title', ogTitle);
    setMetaTag('name', 'twitter:description', ogDesc);
    setMetaTag('name', 'twitter:image', ogImgUrl);
    setMetaTag('name', 'twitter:image:alt', ogImgAlt);

    // 5. Canonical Link
    setLinkTag('canonical', canonicalUrl);

    // 6. Dynamic Favicon & Touch Icon
    const faviconUrl = content.brandingAssets?.favicon?.url || '/favicon.svg';
    if (faviconUrl) {
      const isSvg = faviconUrl.endsWith('.svg') || faviconUrl.includes('.svg');
      setLinkTag('icon', faviconUrl, isSvg ? 'image/svg+xml' : 'image/png');
    }

    const touchIconUrl =
      content.brandingAssets?.favicon?.appleTouchIconUrl ||
      content.brandingAssets?.favicon?.url ||
      '/apple-touch-icon.png';
    if (touchIconUrl) {
      setLinkTag('apple-touch-icon', touchIconUrl);
    }

    // 7. Schema.org JSON-LD Structured Data
    try {
      let ldJsonScript = document.querySelector('script[type="application/ld+json"]');
      if (!ldJsonScript) {
        ldJsonScript = document.createElement('script');
        ldJsonScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(ldJsonScript);
      }
      const schemaData = {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        name: siteName,
        url: canonicalUrl,
        logo: content.brandingAssets?.headerLogo?.url || 'https://footazix.site/assets/logo/footazix-logo.png',
        image: ogImgUrl,
        description: metaDescription,
        sameAs: [content.brand?.instagram || 'https://www.instagram.com/footazix'],
        serviceArea: 'Worldwide',
        priceRange: '$$$',
      };
      ldJsonScript.textContent = JSON.stringify(schemaData, null, 2);
    } catch (e) {
      console.warn('Could not update JSON-LD schema:', e);
    }
  }, [content]);

  return null;
};
