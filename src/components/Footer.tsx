import React from 'react';
import { useApp } from '../context/AppContext';
import { FootazixLogo } from './FootazixLogo';
import { LockKeyhole, ExternalLink, ArrowUp, ArrowRight } from 'lucide-react';
import { FooterNavItem, FooterSocialLinkItem, FooterLegalLinkItem } from '../types';

interface FooterProps {
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContact }) => {
  const { content, navigateToAdmin, navigateToTerms, navigateToPrivacy } = useApp();
  const footerConfig = content.footer;

  const handleLinkClick = (href: string) => {
    if (!href || href === '#') return;
    if (href === 'contact' || href === '#contact') {
      onOpenContact();
      return;
    }
    if (href === 'terms' || href === '/terms') {
      navigateToTerms();
      return;
    }
    if (href === 'privacy' || href === '/privacy') {
      navigateToPrivacy();
      return;
    }
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showLogo =
    content.brandingAssets?.footerLogo?.visible !== false &&
    content.brandingAssets?.headerLogo?.visible !== false;

  const showDescription = footerConfig?.showDescription !== false;
  const showCopyright = footerConfig?.showCopyright !== false;
  const showLegal = footerConfig?.showLegal !== false;
  const showBackToTop = footerConfig?.showBackToTop !== false;
  const showContact = footerConfig?.showContact !== false;
  const showCta = Boolean(footerConfig?.showCta && footerConfig?.ctaText);

  const descriptionText =
    footerConfig?.description ||
    footerConfig?.tagline ||
    content.brand?.supportingLine ||
    'Turning raw footage into content worth watching.';

  const contactText = footerConfig?.contactText || 'Contact';
  const ctaText = footerConfig?.ctaText || 'START A PROJECT →';
  const backToTopText = footerConfig?.backToTopText || 'Back to top';
  const copyrightText =
    footerConfig?.copyrightText ||
    `© ${content.brand?.name || 'Footazix'}`;

  const showDeveloperCredit = footerConfig?.showDeveloperCredit !== false;
  const developedByLabel = footerConfig?.developedByLabel || 'Developed by';
  const developerName = footerConfig?.developerName || 'Sanamatum Ningthoujam';
  const developerUrl =
    footerConfig?.developerUrl ||
    'https://www.instagram.com/sanamatum_creates?stkn=MXVjbzVtamQwaGJveg==';
  const developerNewTab = footerConfig?.developerNewTab !== false;

  // Dynamic Navigation Items with fallback to legacy props
  const navItems = React.useMemo<FooterNavItem[]>(() => {
    if (footerConfig?.navItems && footerConfig.navItems.length > 0) {
      return [...footerConfig.navItems]
        .filter((item: FooterNavItem) => item.visible !== false)
        .sort((a: FooterNavItem, b: FooterNavItem) => (a.order || 0) - (b.order || 0));
    }
    return [
      { id: 'work', label: footerConfig?.navWork || 'Work', href: '#work', visible: true, order: 1 },
      { id: 'system', label: footerConfig?.navSystem || 'System', href: '#system', visible: true, order: 2 },
      { id: 'services', label: footerConfig?.navServices || 'Services', href: '#services', visible: true, order: 3 },
      { id: 'about', label: footerConfig?.navAbout || 'About', href: '#about', visible: true, order: 4 },
      { id: 'faq', label: 'FAQ', href: '#faq', visible: true, order: 5 },
    ];
  }, [footerConfig]);

  // Dynamic Social Links with fallback
  const socialLinks = React.useMemo<FooterSocialLinkItem[]>(() => {
    if (footerConfig?.socialLinks && footerConfig.socialLinks.length > 0) {
      return [...footerConfig.socialLinks]
        .filter((item: FooterSocialLinkItem) => item.visible !== false)
        .sort((a: FooterSocialLinkItem, b: FooterSocialLinkItem) => (a.order || 0) - (b.order || 0));
    }
    const list: FooterSocialLinkItem[] = [];
    if (
      content.sectionVisibility?.instagram !== false &&
      content.brand?.showInstagramButton !== false &&
      footerConfig?.showInstagram !== false &&
      content.brand?.instagram
    ) {
      list.push({
        id: 'ig',
        platform: 'Instagram',
        label: footerConfig?.instagramText || 'Instagram',
        url: content.brand.instagram,
        visible: true,
        order: 1,
      });
    }
    return list;
  }, [footerConfig, content.brand, content.sectionVisibility]);

  // Dynamic Legal Links with fallback
  const legalLinks = React.useMemo<FooterLegalLinkItem[]>(() => {
    if (footerConfig?.legalLinks && footerConfig.legalLinks.length > 0) {
      return [...footerConfig.legalLinks]
        .filter((item: FooterLegalLinkItem) => item.visible !== false)
        .sort((a: FooterLegalLinkItem, b: FooterLegalLinkItem) => (a.order || 0) - (b.order || 0));
    }
    return [
      {
        id: 'terms',
        label: footerConfig?.termsLabel || 'Terms & Conditions',
        href: 'terms',
        visible: true,
        order: 1,
      },
      {
        id: 'privacy',
        label: footerConfig?.privacyLabel || 'Privacy Policy',
        href: 'privacy',
        visible: true,
        order: 2,
      },
    ];
  }, [footerConfig]);

  return (
    <footer className="py-16 bg-[#070809] border-t border-[#292E25] text-[#A7AEA0] text-xs font-sans">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-[#292E25]">
          {/* Brand Wordmark with Official/Custom Footer Logo & Subtitle */}
          <div>
            {showLogo && (
              <a
                href="#"
                className="inline-flex items-center group cursor-pointer hover:opacity-90 transition-opacity"
                aria-label={`${content.brand?.name || 'Footazix'} Home`}
              >
                <FootazixLogo variant="footer" />
              </a>
            )}
            {showDescription && (
              <p className="text-[#A7AEA0] text-xs mt-2 font-mono">
                {descriptionText}
              </p>
            )}
          </div>

          {/* Navigation & Action Stack */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 flex-wrap">
            {/* Primary Nav Links */}
            {navItems.length > 0 && (
              <nav className="flex flex-wrap items-center gap-6 font-semibold uppercase tracking-wider text-xs">
                {navItems.map((item) => (
                  <button
                    key={item.id || item.label}
                    onClick={() => handleLinkClick(item.href)}
                    className="hover:text-[#F5F7F2] transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-5 text-xs font-semibold uppercase tracking-wider border-l border-[#292E25] pl-6 hidden md:flex">
                {socialLinks.map((item) => (
                  <a
                    key={item.id || item.platform}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#F5F7F2] transition-colors inline-flex items-center gap-1"
                  >
                    <span>{item.label}</span>
                    <ExternalLink className="w-3 h-3 text-[#B1FF00]" />
                  </a>
                ))}
              </div>
            )}

            {/* Contact / CTA buttons */}
            <div className="flex items-center gap-3">
              {showContact && (
                <button
                  onClick={onOpenContact}
                  className="text-[#B1FF00] hover:text-[#C4FF45] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {contactText}
                </button>
              )}

              {showCta && (
                <button
                  onClick={onOpenContact}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#070809] bg-[#B1FF00] hover:bg-[#C4FF45] active:bg-[#96DB00] transition-all shadow-[0_0_14px_rgba(177,255,0,0.3)] cursor-pointer flex items-center gap-1.5"
                >
                  <span>{ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#070809]" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Legal Navigation & Discreet Owner Lock */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#737B6B] font-mono text-[11px]">
          <div className="flex flex-wrap items-center gap-4">
            {showCopyright && (
              <div className="inline-flex items-center gap-1.5 flex-wrap">
                <span>{copyrightText}</span>
                {showDeveloperCredit && developerName && (
                  <>
                    <span className="text-zinc-600">|</span>
                    <span>{developedByLabel}</span>
                    {developerUrl ? (
                      <a
                        href={developerUrl}
                        target={developerNewTab ? '_blank' : undefined}
                        rel={developerNewTab ? 'noopener noreferrer' : undefined}
                        className="text-[#A7AEA0] hover:text-[#B1FF00] transition-colors underline underline-offset-2 cursor-pointer inline-flex items-center gap-0.5 group"
                      >
                        <span>{developerName}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ) : (
                      <span className="text-[#A7AEA0]">{developerName}</span>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Legal Links */}
            {showLegal && legalLinks.length > 0 && (
              <div className="flex items-center gap-3 border-l border-[#292E25] pl-3">
                {legalLinks.map((link, idx) => (
                  <React.Fragment key={link.id || link.label}>
                    {idx > 0 && <span className="text-zinc-700">•</span>}
                    <button
                      onClick={() => handleLinkClick(link.href)}
                      className="text-[#737B6B] hover:text-[#F5F7F2] transition-colors cursor-pointer underline underline-offset-2"
                    >
                      {link.label}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Owner Discreet Lock Button */}
            <button
              onClick={navigateToAdmin}
              className="inline-flex items-center justify-center p-1 text-zinc-600 hover:text-[#B1FF00] active:text-[#B1FF00] transition-colors cursor-pointer rounded opacity-60 hover:opacity-100"
              title="Private Studio Access"
              aria-label="Private Studio Access"
            >
              <LockKeyhole className="w-3 h-3" />
            </button>
          </div>

          {/* Back to top */}
          {showBackToTop && (
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-[#A7AEA0] hover:text-[#F5F7F2] transition-colors cursor-pointer"
            >
              <span>{backToTopText}</span>
              <ArrowUp className="w-3 h-3 text-[#B1FF00]" />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
