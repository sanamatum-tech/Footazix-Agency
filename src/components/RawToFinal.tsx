import React from 'react';
import { SITE_CONFIG } from '../config/siteContent';

export const RawToFinal: React.FC = () => {
  return (
    <section className="py-16 bg-[#08080c] border-t border-b border-white/5 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>THE TRANSFORMATION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            {SITE_CONFIG.rawToReady.heading}
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            {SITE_CONFIG.rawToReady.subheading}
          </p>
        </div>

        {/* Compact Visual Transformation Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {SITE_CONFIG.rawToReady.steps.map((step, idx) => (
            <div
              key={step.num}
              className={`p-5 rounded-xl border transition-all duration-200 relative ${
                idx === 1
                  ? 'bg-zinc-900/90 border-blue-500/50 glow-blue-sm'
                  : 'bg-zinc-950/70 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-blue-400 tracking-wider">
                  {step.num}
                </span>
                {idx === 1 && (
                  <span className="text-[10px] font-bold tracking-wider uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    CORE STEP
                  </span>
                )}
              </div>

              <h3 className="text-base font-display font-bold text-white mb-1.5">
                {step.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {step.desc}
              </p>

              {/* Step indicator arrow for desktop */}
              {idx < 2 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-zinc-900 border border-white/20 text-blue-400 items-center justify-center text-xs font-bold shadow-md">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
