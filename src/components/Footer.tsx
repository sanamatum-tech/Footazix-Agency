import React from 'react';
import { useApp } from '../context/AppContext';
import { FootazixLogo } from './FootazixLogo';
import { LockKeyhole, ExternalLink, ArrowUp } from 'lucide-react';

interface FooterProps {
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContact }) => {
  const { content, navigateToAdmin, navigateToTerms, navigateToPrivacy } = useApp();
  const footerConfig = content.footer;

  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showInstagram =
    content.sectionVisibility?.instagram !== false &&
    content.brand?.showInstagramButton !== false &&
    footerConfig?.showInstagram !== false &&
    Boolean(content.brand?.instagram);

  const showDescription = footerConfig?.showDescription !== false;
  const showCopyright = footerConfig?.showCopyright !== false;
  const showLegal = footerConfig?.showLegal !== false;
  const showBackToTop = footerConfig?.showBackToTop !== false;

  const descriptionText =
    footerConfig?.description ||
    content.brand?.supportingLine ||
    'Turning raw footage into content worth watching.';

  const navWork = footerConfig?.navWork || 'Work';
  const navSystem = footerConfig?.navSystem || 'System';
  const navServices = footerConfig?.navServices || 'Services';
  const navAbout = footerConfig?.navAbout || 'About';
  const contactText = footerConfig?.contactText || 'Contact';
  const instagramText = footerConfig?.instagramText || 'Instagram';
  const termsText = footerConfig?.termsLabel || 'Terms & Conditions';
  const privacyText = footerConfig?.privacyLabel || 'Privacy Policy';
  const backToTopText = footerConfig?.backToTopText || 'Back to top';
  const copyrightText =
    footerConfig?.copyrightText ||
    `© ${new Date().getFullYear()} ${content.brand?.name || 'Footazix'}. ${content.brand?.domain || 'footazix.site'}. All rights reserved.`;

  return (
    <footer className="py-16 bg-[#040406] border-t border-white/10 text-zinc-400 text-xs font-sans">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/5">
          {/* Brand Wordmark with Official/Custom Footer Logo & Subtitle */}
          <div>
            <a
              href="#"
              className="inline-flex items-center group cursor-pointer hover:opacity-90 transition-opacity"
              aria-label={`${content.brand?.name || 'Footazix'} Home`}
            >
              <FootazixLogo variant="footer" />
            </a>
            {showDescription && (
              <p className="text-zinc-400 text-xs mt-2 font-mono">
                {descriptionText}
              </p>
            )}
          </div>

          {/* Navigation links */}
          <nav className="flex flex-wrap items-center gap-6 sm:gap-8 font-semibold uppercase tracking-wider text-xs">
            <button
              onClick={() => scrollTo('#work')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {navWork}
            </button>
            <button
              onClick={() => scrollTo('#system')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {navSystem}
            </button>
            <button
              onClick={() => scrollTo('#services')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {navServices}
            </button>
            <button
              onClick={() => scrollTo('#about')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {navAbout}
            </button>

            {showInstagram && (
              <a
                href={content.brand.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <span>{instagramText}</span>
                <ExternalLink className="w-3 h-3 text-blue-400" />
              </a>
            )}

            <button
              onClick={onOpenContact}
              className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              {contactText}
            </button>
          </nav>
        </div>

        {/* Bottom Bar: Copyright, Legal Navigation & Discreet Owner Lock */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-400 font-mono text-[11px]">
          <div className="flex flex-wrap items-center gap-4">
            {showCopyright && <span>{copyrightText}</span>}

            {/* Legal Links */}
            {showLegal && (
              <div className="flex items-center gap-3 border-l border-white/10 pl-3">
                <button
                  onClick={navigateToTerms}
                  className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer underline underline-offset-2"
                >
                  {termsText}
                </button>
                <span className="text-zinc-700">•</span>
                <button
                  onClick={navigateToPrivacy}
                  className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer underline underline-offset-2"
                >
                  {privacyText}
                </button>
              </div>
            )}

            {/* Owner Discreet Lock Button */}
            <button
              onClick={navigateToAdmin}
              className="inline-flex items-center justify-center p-1 text-zinc-600 hover:text-zinc-400 active:text-blue-400 transition-colors cursor-pointer rounded opacity-60 hover:opacity-100"
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
              className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <span>{backToTopText}</span>
              <ArrowUp className="w-3 h-3 text-blue-400" />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
