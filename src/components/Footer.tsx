import React from 'react';
import { SITE_CONFIG } from '../config/siteContent';

interface FooterProps {
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContact }) => {
  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="py-16 bg-[#040406] border-t border-white/10 text-zinc-400 text-xs">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/5">
          {/* Brand Wordmark & Subtitle */}
          <div>
            <a
              href="#"
              className="text-xl font-display font-extrabold text-white tracking-tight hover:text-blue-400 transition-colors flex items-center gap-2"
            >
              <span>{SITE_CONFIG.brand.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
            </a>
            <p className="text-zinc-400 text-xs mt-1 font-mono">
              Content • Editing • Growth
            </p>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-wrap items-center gap-6 sm:gap-8 font-medium">
            <button
              onClick={() => scrollTo('#work')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Work
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
            <a
              href={SITE_CONFIG.brand.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Instagram
            </a>
            <button
              onClick={onOpenContact}
              className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>
        </div>

        {/* Bottom Bar: Copyright & Domain */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-400 font-mono text-[11px]">
          <div>
            © {new Date().getFullYear()} {SITE_CONFIG.brand.name}. {SITE_CONFIG.brand.domain}. All rights reserved.
          </div>
          <div>
            Turning raw footage into content worth watching.
          </div>
        </div>
      </div>
    </footer>
  );
};
