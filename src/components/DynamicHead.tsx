import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';

/**
 * DynamicHead Component
 * 
 * Synchronizes document.title, favicon, apple-touch-icon, and SEO/OG metadata
 * in real-time based on the CMS settings stored in Supabase.
 */
export const DynamicHead: React.FC = () => {
  const { content } = useApp();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Page Title
    const title =
      content.seo?.siteTitle ||
      `${content.brand?.name || 'Footazix'} – Turning Raw Footage Into Content Worth Watching`;
    document.title = title;

    // Helper for meta tags
    const setMetaTag = (attr: 'name' | 'property', key: string, value: string) => {
      if (!value) return;
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    // Helper for link tags
    const setLinkTag = (rel: string, href: string, type?: string) => {
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

    // 2. Meta Description & Keywords
    if (content.seo?.metaDescription) {
      setMetaTag('name', 'description', content.seo.metaDescription);
    }
    if (content.seo?.keywords) {
      setMetaTag('name', 'keywords', content.seo.keywords);
    }

    // 3. OpenGraph Tags
    const ogTitle = content.seo?.ogTitle || title;
    const ogDesc = content.seo?.ogDescription || content.seo?.metaDescription || content.brand?.tagline;
    const ogImg = content.seo?.ogImage || content.brandingAssets?.ogImage?.url;

    if (ogTitle) setMetaTag('property', 'og:title', ogTitle);
    if (ogDesc) setMetaTag('property', 'og:description', ogDesc);
    if (ogImg) setMetaTag('property', 'og:image', ogImg);
    if (content.seo?.canonicalUrl) setLinkTag('canonical', content.seo.canonicalUrl);

    // 4. Dynamic Favicon & Apple Touch Icon
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
  }, [content]);

  return null;
};
