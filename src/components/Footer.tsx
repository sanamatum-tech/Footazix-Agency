import React from 'react';
import { useApp } from '../context/AppContext';
import { FootazixLogo } from './FootazixLogo';
import { LockKeyhole, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContact }) => {
  const { content, navigateToAdmin, navigateToTerms, navigateToPrivacy } = useApp();

  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const showInstagram = content.brand.showInstagramButton !== false && Boolean(content.brand.instagram);

  return (
    <footer className="py-16 bg-[#040406] border-t border-white/10 text-zinc-400 text-xs font-sans">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/5">
          {/* Brand Wordmark with Official Logo & Subtitle */}
          <div>
            <a
              href="#"
              className="inline-flex items-center group cursor-pointer hover:opacity-90 transition-opacity"
              aria-label="FOOTAZIX Home"
            >
              <div className="w-[130px] sm:w-[150px] h-[36px] flex items-center">
                <FootazixLogo className="h-full w-auto" />
              </div>
            </a>
            <p className="text-zinc-400 text-xs mt-2 font-mono">
              {content.brand.supportingLine || 'Video Editing • Content • Growth'}
            </p>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-wrap items-center gap-6 sm:gap-8 font-semibold uppercase tracking-wider text-xs">
            <button
              onClick={() => scrollTo('#work')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Work
            </button>
            <button
              onClick={() => scrollTo('#system')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              System
            </button>
            <button
              onClick={() => scrollTo('#services')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Services
            </button>
            <button
              onClick={() => scrollTo('#about')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              About
            </button>

            {showInstagram && (
              <a
                href={content.brand.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <span>Instagram</span>
                <ExternalLink className="w-3 h-3 text-blue-400" />
              </a>
            )}

            <button
              onClick={onOpenContact}
              className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>
        </div>

        {/* Bottom Bar: Copyright, Legal Navigation & Discreet Owner Lock */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-400 font-mono text-[11px]">
          <div className="flex flex-wrap items-center gap-4">
            <span>
              © {new Date().getFullYear()} {content.brand.name}. {content.brand.domain}.
            </span>

            {/* Legal Links */}
            <div className="flex items-center gap-3 border-l border-white/10 pl-3">
              <button
                onClick={navigateToTerms}
                className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer underline underline-offset-2"
              >
                Terms & Conditions
              </button>
              <span className="text-zinc-700">•</span>
              <button
                onClick={navigateToPrivacy}
                className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer underline underline-offset-2"
              >
                Privacy Policy
              </button>
            </div>

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

          <div>
            {content.footer.tagline || 'Turning raw footage into content worth watching.'}
          </div>
        </div>
      </div>
    </footer>
  );
};
