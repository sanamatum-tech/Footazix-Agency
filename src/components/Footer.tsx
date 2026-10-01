import React from 'react';
import { useApp } from '../context/AppContext';

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
    <footer className="py-16 bg-[#040406] border-t border-white/10 text-zinc-400 text-xs">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/5">
          {/* Brand Wordmark & Subtitle */}
          <div>
            <a
              href="#"
              className="text-xl font-display font-extrabold text-white tracking-tight hover:text-blue-400 transition-colors flex items-center gap-2"
            >
              <span>{content.brand.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
            </a>
            <p className="text-zinc-500 text-xs mt-1 font-mono">
              {content.brand.supportingLine || 'Video Editing • Content • Growth'}
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

        {/* Bottom Bar: Copyright & Subtle Owner Lock */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span>
              © {new Date().getFullYear()} {content.brand.name}. {content.brand.domain}. All rights reserved.
            </span>
            {/* Owner Discreet Lock Button (Not a prominent public button) */}
            <button
              onClick={navigateToAdmin}
              className="inline-flex items-center justify-center p-1 text-zinc-600 hover:text-zinc-400 active:text-blue-400 transition-colors cursor-pointer rounded opacity-60 hover:opacity-100"
              title="Owner access"
              aria-label="Owner access"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
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
