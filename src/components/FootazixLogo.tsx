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
 * Dynamically resolves to the CMS-configured header or footer logo
 * uploaded to Supabase Storage, with fallback to official bundled assets.
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

  // Determine source URL
  const resolvedUrl =
    customUrl ||
    (isFooter && !footerConfig?.useHeaderLogo && footerConfig?.url
      ? footerConfig.url
      : content.brandingAssets?.headerLogo?.url) ||
    '/assets/logo/footazix-logo.png';

  const resolvedAlt =
    alt ||
    content.brandingAssets?.headerLogo?.alt ||
    `${content.brand?.name || 'Footazix'} Creative Agency`;

  const dWidth = desktopWidth || logoConfig?.desktopWidth || (isFooter ? 145 : 155);
  const mWidth = mobileWidth || (logoConfig as any)?.mobileWidth || 125;

  if (variant === 'mark') {
    return (
      <picture className="inline-block shrink-0 select-none">
        <source srcSet="/assets/logo/footazix-mark.svg" type="image/svg+xml" />
        <img
          src="/assets/logo/footazix-mark.png"
          alt={resolvedAlt}
          className={`${className} select-none object-contain`}
          draggable={false}
          loading="eager"
        />
      </picture>
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
        className="w-auto h-auto object-contain select-none max-h-12"
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
