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

  const showInstagram =
    content.sectionVisibility?.instagram !== false &&
    content.brand?.showInstagramButton !== false &&
    Boolean(content.brand?.instagram);

  const showLogo =
    content.header?.showLogo !== false &&
    content.brandingAssets?.headerLogo?.visible !== false;

  const showCta =
    content.header?.showCta !== false &&
    content.sectionVisibility?.startProjectModal !== false;
  const ctaText = content.header?.ctaText || 'Build with Footazix';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute navigation links based on CMS items or individual fields
  const navLinks = React.useMemo(() => {
    if (content.header?.navItems && content.header.navItems.length > 0) {
      return content.header.navItems
        .filter((item) => item.visible !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    const defaultLinks = [];
    if (content.header?.showWorkLink !== false) {
      defaultLinks.push({
        id: 'work',
        label: content.header?.navWork || 'Work',
        href: '#work',
        visible: true,
        order: 1,
      });
    }
    if (content.header?.showSystemLink !== false) {
      defaultLinks.push({
        id: 'system',
        label: content.header?.navSystem || 'System',
        href: '#system',
        visible: true,
        order: 2,
      });
    }
    if (content.header?.showServicesLink !== false) {
      defaultLinks.push({
        id: 'services',
        label: content.header?.navServices || 'Services',
        href: '#services',
        visible: true,
        order: 3,
      });
    }
    if (content.header?.showAboutLink !== false) {
      defaultLinks.push({
        id: 'about',
        label: content.header?.navAbout || 'About',
        href: '#about',
        visible: true,
        order: 4,
      });
    }
    return defaultLinks;
  }, [content.header]);

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = href;
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
        {/* Dynamic Brand Logo */}
        {showLogo ? (
          <motion.a
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            href="#"
            className="shrink-0 flex items-center group cursor-pointer transition-opacity hover:opacity-90 active:scale-[0.99]"
            aria-label={`${content.brand?.name || 'Footazix'} Home`}
          >
            <FootazixLogo />
          </motion.a>
        ) : (
          <div />
        )}

        {/* Desktop Navigation */}
        {navLinks.length > 0 && (
          <motion.nav
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:flex items-center gap-7 lg:gap-8 text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            {navLinks.map((link) => (
              <button
                key={link.id || link.label}
                onClick={() => handleLinkClick(link.href)}
                className="hover:text-white transition-colors cursor-pointer py-1 relative text-left group"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-200 group-hover:w-full" />
              </button>
            ))}
          </motion.nav>
        )}

        {/* Right Action Stack: Optional Instagram + Primary CTA + Mobile Trigger */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3"
        >
          {showInstagram && (
            <a
              href={content.brand.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${content.brand?.name || 'Footazix'} Instagram`}
              className="hidden sm:inline-flex items-center justify-center p-2 rounded-xl text-zinc-400 hover:text-white bg-[#12121c] border border-white/10 hover:border-blue-500/40 transition-colors"
            >
              <Instagram className="w-4 h-4 text-blue-400" />
            </a>
          )}

          {showCta && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpenContact()}
              className="hidden sm:inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-all duration-200 shadow-[0_0_18px_rgba(37,99,235,0.35)] cursor-pointer group"
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white bg-[#12121c] border border-white/10 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
            transition={{ duration: 0.25 }}
            className="md:hidden border-b border-white/10 bg-[#050508]/98 backdrop-blur-xl overflow-hidden px-6 py-6 space-y-4"
          >
            <div className="flex flex-col space-y-3 text-sm font-semibold uppercase tracking-wider text-zinc-300">
              {navLinks.map((link) => (
                <button
                  key={link.id || link.label}
                  onClick={() => handleLinkClick(link.href)}
                  className="text-left py-2 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              {showCta && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenContact();
                  }}
                  className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-all duration-200 shadow-[0_0_16px_rgba(37,99,235,0.35)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {showInstagram && (
                <a
                  href={content.brand.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-zinc-300 bg-[#12121c] border border-white/10 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Instagram className="w-3.5 h-3.5 text-blue-400" />
                  <span>Instagram</span>
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
