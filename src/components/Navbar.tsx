import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FootazixLogo } from './FootazixLogo';
import { Menu, X, ArrowRight, Instagram } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onOpenContact: (prefillService?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenContact }) => {
  const { content } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const showInstagram = content.brand.showInstagramButton !== false && Boolean(content.brand.instagram);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: content.header?.navWork || 'Work', href: '#work' },
    { label: content.header?.navSystem || 'System', href: '#system' },
    { label: content.header?.navServices || 'Services', href: '#services' },
    { label: content.header?.navAbout || 'About', href: '#about' },
  ];

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans ${
        scrolled
          ? 'bg-[#050508]/92 backdrop-blur-md border-b border-white/10 py-3.5 shadow-2xl shadow-black/60'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6 flex items-center justify-between">
        {/* Official Footazix Logo (Desktop: ~140-170px, Mobile: ~115-140px) */}
        <motion.a
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          href="#"
          className="shrink-0 flex items-center group cursor-pointer transition-opacity hover:opacity-90 active:scale-[0.99]"
          aria-label="Footazix Home"
        >
          <div className="w-[125px] sm:w-[155px] h-[34px] sm:h-[40px] flex items-center">
            <FootazixLogo className="h-full w-auto" />
          </div>
        </motion.a>

        {/* Desktop Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="hidden md:flex items-center gap-7 lg:gap-8 text-xs font-semibold uppercase tracking-wider text-zinc-400"
        >
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleLinkClick(link.href)}
              className="hover:text-white transition-colors cursor-pointer py-1 relative text-left group"
            >
              <span>{link.label}</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-200 group-hover:w-full" />
            </button>
          ))}
        </motion.nav>

        {/* Right Action Stack: Optional Instagram + Primary CTA + Mobile Trigger */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3"
        >
          {/* Conditional Instagram Button based strictly on CMS Toggle */}
          {showInstagram && (
            <a
              href={content.brand.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Footazix Instagram"
              className="hidden sm:inline-flex items-center justify-center p-2 rounded-xl text-zinc-400 hover:text-white bg-[#12121c] border border-white/10 hover:border-blue-500/40 transition-colors"
            >
              <Instagram className="w-4 h-4 text-blue-400" />
            </a>
          )}

          {/* Primary CTA: "Build with Footazix" */}
          <button
            onClick={() => onOpenContact()}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 rounded-xl hover:bg-blue-500 active:scale-95 transition-all duration-150 whitespace-nowrap shadow-[0_0_16px_rgba(37,99,235,0.35)] cursor-pointer"
          >
            {content.header?.ctaText || 'Build with Footazix'}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center p-2.5 rounded-xl text-zinc-300 hover:text-white bg-zinc-900/90 border border-white/10 transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
          </button>
        </motion.div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden bg-[#07070c] border-b border-white/10 px-6 py-6 space-y-4 overflow-hidden"
          >
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleLinkClick(link.href)}
                  className="text-left text-sm font-semibold uppercase tracking-wider text-zinc-300 hover:text-white py-2 transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              ))}

              {/* Instagram link in mobile menu if enabled */}
              {showInstagram && (
                <a
                  href={content.brand.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-left text-sm font-semibold uppercase tracking-wider text-blue-400 hover:text-blue-300 py-2 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Instagram</span>
                </a>
              )}
            </nav>

            <div className="pt-3 border-t border-white/10">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenContact();
                }}
                className="w-full py-3.5 text-center text-xs font-bold uppercase tracking-wider text-white bg-blue-600 rounded-xl hover:bg-blue-500 active:scale-95 transition-all shadow-[0_0_16px_rgba(37,99,235,0.35)] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{content.header?.ctaText || 'Build with Footazix'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
