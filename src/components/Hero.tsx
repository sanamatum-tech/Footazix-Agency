import React from 'react';
import { useApp } from '../context/AppContext';
import { FootazixHero3D } from './FootazixHero3D';

interface HeroProps {
  onWorkWithUs: () => void;
  onWatchVSL: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onWorkWithUs, onWatchVSL }) => {
  const { content } = useApp();

  return (
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center pt-28 pb-16 overflow-hidden bg-radial-hero">
      {/* Background ambient lighting accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Grid overlay lines (subtle creative studio texture) */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-6 w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Typographic Focus */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Small label */}
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-4 sm:mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
            <span>{content.hero.badgeText}</span>
          </div>

          {/* Main Headline (Manrope 800) */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.12] mb-4 text-balance">
            <span>{content.hero.headlineLine1}</span>
            <br />
            <span className="text-blue-500">{content.hero.headlineLine2}</span>
          </h1>

          {/* Supporting line */}
          <p className="text-sm sm:text-base font-semibold text-zinc-300 mb-2">
            {content.hero.supportingLine}
          </p>

          {/* Description */}
          <p className="text-xs sm:text-sm font-normal text-zinc-400 mb-8 max-w-lg leading-relaxed">
            {content.hero.description}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onWorkWithUs}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 rounded-lg hover:bg-blue-500 active:scale-95 transition-all duration-200 glow-blue-sm cursor-pointer"
            >
              <span>{content.hero.primaryCta}</span>
            </button>

            <button
              onClick={onWatchVSL}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-300 bg-zinc-900/80 hover:text-white hover:bg-zinc-800 border border-white/10 rounded-lg active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>{content.hero.secondaryCta}</span>
            </button>
          </div>
        </div>

        {/* Right Column: 3D Interactive Abstract Sculpture */}
        <div className="lg:col-span-5 flex items-center justify-center relative min-h-[300px] sm:min-h-[380px] lg:min-h-[460px]">
          {/* Subtle blue focal glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 rounded-full bg-blue-600/12 blur-3xl" />
          </div>

          <FootazixHero3D className="w-full h-[320px] sm:h-[400px] max-w-[420px]" />
        </div>
      </div>
    </section>
  );
};
