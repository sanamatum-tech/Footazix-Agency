import React from 'react';
import { useApp } from '../context/AppContext';

interface FootazixLogoProps {
  className?: string;
  variant?: 'full' | 'mark' | 'footer';
  alt?: string;
  customUrl?: string;
  desktopWidth?: number;
  mobileWidth?: number;
  visible?: boolean;
}

/**
 * Official Footazix Brand Logo Component
 * 
 * Strictly uses the authoritative CMS-configured logo uploaded via Supabase Storage.
 * Zero hardcoded fallbacks or legacy bundled assets.
 * 
 * If CMS branding has not loaded yet, maintains a stable reserved footprint
 * without rendering any incorrect or placeholder logo.
 */
export const FootazixLogo: React.FC<FootazixLogoProps> = ({
  className = '',
  variant = 'full',
  alt,
  customUrl,
  desktopWidth,
  mobileWidth,
  visible,
}) => {
  const { content } = useApp();

  const isFooter = variant === 'footer';
  const logoConfig = isFooter
    ? content.brandingAssets?.footerLogo
    : content.brandingAssets?.headerLogo;

  // Determine visibility: explicit prop overrides CMS, otherwise use CMS setting
  const isVisible = visible !== undefined ? visible : logoConfig?.visible !== false;
  if (!isVisible) {
    return null;
  }

  const footerConfig = isFooter ? content.brandingAssets?.footerLogo : undefined;

  // Single authoritative source: CMS Branding -> Supabase Storage
  let rawUrl = isFooter
    ? (!footerConfig?.useHeaderLogo && footerConfig?.url ? footerConfig.url : content.brandingAssets?.headerLogo?.url)
    : content.brandingAssets?.headerLogo?.url;

  if (customUrl) {
    rawUrl = customUrl;
  }

  // Strictly block any obsolete legacy logo asset (e.g. 1790995570940 or /assets/logo/)
  const isObsoleteLogo = Boolean(
    rawUrl &&
    (rawUrl.includes('1790995570940') ||
      rawUrl.includes('/assets/logo/') ||
      rawUrl.startsWith('/assets/'))
  );

  const resolvedUrl = isObsoleteLogo ? '' : (rawUrl || '');

  const resolvedAlt =
    alt ||
    content.brandingAssets?.headerLogo?.alt ||
    `${content.brand?.name || 'Footazix'} Creative Agency`;

  const dWidth = desktopWidth || logoConfig?.desktopWidth || (isFooter ? 130 : 130);
  const mWidth = mobileWidth || (logoConfig as any)?.mobileWidth || 100;

  // If CMS branding has not loaded yet, keep area visually stable without painting any wrong logo
  if (!resolvedUrl) {
    return (
      <div
        className={`inline-block shrink-0 select-none ${className}`}
        style={{
          width: `${dWidth}px`,
          height: '2rem',
          maxWidth: '100%',
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center shrink-0 select-none ${className}`}
      style={{
        width: 'var(--logo-width, auto)',
        maxWidth: '100%',
      }}
    >
      <img
        src={resolvedUrl}
        alt={resolvedAlt}
        draggable={false}
        loading="eager"
        className="w-auto h-auto object-contain select-none max-h-12 footazix-logo-img"
        style={{
          width: `${dWidth}px`,
          maxWidth: '100%',
        }}
      />
      <style>{`
        @media (max-width: 640px) {
          .footazix-logo-img {
            width: ${mWidth}px !important;
          }
        }
      `}</style>
    </div>
  );
};
