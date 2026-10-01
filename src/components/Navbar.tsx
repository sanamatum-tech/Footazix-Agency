import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onOpenContact: (prefillService?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenContact }) => {
  const { content } = useApp();
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
    { label: 'VSL', href: '#vsl' },
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
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
          ? 'bg-[#050508]/90 backdrop-blur-md border-b border-white/10 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Wordmark with cobalt blue dot */}
        <a
          href="#"
          className="text-lg font-extrabold font-display tracking-tight text-white hover:text-zinc-200 transition-colors shrink-0 flex items-center gap-2 group"
          aria-label="FOOTAZIX Home"
        >
          <span>{content.brand.name || 'FOOTAZIX'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shadow-[0_0_8px_rgba(37,99,235,0.8)] group-hover:scale-125 transition-transform" />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-zinc-400">
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

        {/* Primary action button & Mobile Menu trigger */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenContact()}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all duration-150 whitespace-nowrap shadow-[0_0_16px_rgba(37,99,235,0.35)] cursor-pointer"
          >
            Start a Project
          </motion.button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center p-2 rounded-xl text-zinc-300 hover:text-white bg-zinc-900/80 border border-white/10 transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
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
            </nav>
            <div className="pt-3 border-t border-white/10">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenContact();
                }}
                className="w-full py-3 text-center text-xs font-bold uppercase tracking-wider text-white bg-blue-600 rounded-xl hover:bg-blue-500 active:scale-95 transition-all shadow-[0_0_16px_rgba(37,99,235,0.35)] cursor-pointer"
              >
                Start a Project →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
