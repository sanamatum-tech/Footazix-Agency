import React, { useState, useEffect } from 'react';
import { SITE_CONFIG } from '../config/siteContent';

interface NavbarProps {
  onOpenContact: (prefillService?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenContact }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Work', href: '#work' },
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href === '#contact') {
      onOpenContact();
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#050508]/85 backdrop-blur-md border-b border-white/8 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Zone 1: Single element wordmark adhering to Top Bar Contract */}
        <a
          href="#"
          className="text-lg font-bold font-display tracking-tight text-white hover:text-blue-400 transition-colors shrink-0 flex items-center gap-2"
          aria-label="FOOTAZIX Home"
        >
          <span>{SITE_CONFIG.brand.name}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
        </a>

        {/* Zone 2: Clean 4-link desktop navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleLinkClick(link.href)}
              className="hover:text-white transition-colors cursor-pointer py-1 relative text-left"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary action button & Mobile Menu trigger */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onOpenContact()}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 active:scale-95 transition-all duration-150 whitespace-nowrap glow-blue-sm"
          >
            Start a Project
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Clean, lightweight, high contrast) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0b10] border-b border-white/10 px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link.href)}
                className="text-left text-base font-medium text-zinc-300 hover:text-white py-2 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>
          <div className="pt-3 border-t border-white/10">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContact();
              }}
              className="w-full py-3 text-center text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 active:scale-95 transition-all"
            >
              Start a Project
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
