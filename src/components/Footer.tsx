import React from 'react';
import { useApp } from '../context/AppContext';
import { LockKeyhole, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContact }) => {
  const { content, navigateToAdmin } = useApp();

  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="py-16 bg-[#040406] border-t border-white/10 text-zinc-400 text-xs font-sans">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/5">
          {/* Brand Wordmark & Subtitle */}
          <div>
            <a
              href="#"
              className="text-xl font-display font-extrabold text-white tracking-tight hover:text-zinc-200 transition-colors flex items-center gap-2 group"
            >
              <span>{content.brand.name || 'FOOTAZIX'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shadow-[0_0_8px_rgba(37,99,235,0.8)] group-hover:scale-125 transition-transform" />
            </a>
            <p className="text-zinc-400 text-xs mt-1.5 font-mono">
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
              onClick={() => scrollTo('#vsl')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              VSL
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
              href={content.brand.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors inline-flex items-center gap-1"
            >
              <span>Instagram</span>
              <ExternalLink className="w-3 h-3 text-blue-400" />
            </a>
            <button
              onClick={onOpenContact}
              className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>
        </div>

        {/* Bottom Bar: Copyright & Subtle Owner Lock */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-400 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span>
              © {new Date().getFullYear()} {content.brand.name}. {content.brand.domain}. All rights reserved.
            </span>
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
