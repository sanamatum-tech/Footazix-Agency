import React from 'react';
import { useApp } from '../context/AppContext';
import { FootazixHero3D } from './FootazixHero3D';
import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onWorkWithUs: () => void;
  onWatchVSL: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onWorkWithUs, onWatchVSL }) => {
  const { content } = useApp();
  const hero = content.hero;

  const showBadge = hero.showBadge !== false && Boolean(hero.badgeText);
  const showSupportingLine = hero.showSupportingLine !== false && Boolean(hero.supportingLine);
  const showDescription = hero.showDescription !== false && Boolean(hero.description);
  const showPrimaryCta =
    hero.showPrimaryCta !== false &&
    content.sectionVisibility?.startProjectModal !== false &&
    Boolean(hero.primaryCta);
  const showSecondaryCta = hero.showSecondaryCta !== false && Boolean(hero.secondaryCta);

  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center pt-28 pb-16 overflow-hidden bg-[#050508]">
      {/* Background ambient lighting accents */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/[0.08] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[300px] bg-blue-500/[0.04] blur-[120px] rounded-full pointer-events-none" />

      {/* Grid overlay lines */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-6 w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Typographic Stagger & CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Badge Kicker */}
          {showBadge && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-5 sm:mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
              <span className="font-mono text-[11px]">{hero.badgeText}</span>
            </motion.div>
          )}

          {/* Optional Eyebrow */}
          {hero.eyebrow && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400 mb-2"
            >
              {hero.eyebrow}
            </motion.p>
          )}

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.1] mb-4 text-balance overflow-hidden">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              {hero.headlineLine1 || 'TURN RAW FOOTAGE INTO'}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="block text-blue-500"
            >
              {hero.headlineLine2 || 'CONTENT WORTH WATCHING.'}
            </motion.span>
          </h1>

          {/* Supporting line */}
          {showSupportingLine && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm sm:text-base font-semibold text-zinc-300 mb-2"
            >
              {hero.supportingLine}
            </motion.p>
          )}

          {/* Description */}
          {showDescription && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.44, ease: [0.16, 1, 0.3, 1] }}
              className="text-xs sm:text-sm font-normal text-zinc-400 mb-8 max-w-lg leading-relaxed"
            >
              {hero.description}
            </motion.p>
          )}

          {/* Action CTAs */}
          {(showPrimaryCta || showSecondaryCta) && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.54, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto"
            >
              {showPrimaryCta && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onWorkWithUs}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all duration-200 shadow-[0_0_24px_rgba(37,99,235,0.4)] cursor-pointer group"
                >
                  <span>{hero.primaryCta}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              )}

              {showSecondaryCta && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onWatchVSL}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-300 bg-zinc-900/80 hover:text-white hover:bg-zinc-800 border border-white/10 rounded-xl transition-all duration-200 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                  <span>{hero.secondaryCta}</span>
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Optional small supporting note under CTAs */}
          {hero.smallSupportingText && (
            <p className="text-[11px] text-zinc-400 mt-3 font-mono">
              {hero.smallSupportingText}
            </p>
          )}
        </div>

        {/* Right Column: 3D Interactive Abstract Sculpture */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex items-center justify-center relative min-h-[300px] sm:min-h-[380px] lg:min-h-[460px]"
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 rounded-full bg-blue-600/10 blur-3xl" />
          </div>

          <FootazixHero3D className="w-full h-[320px] sm:h-[400px] max-w-[420px]" />
        </motion.div>
      </div>
    </section>
  );
};
