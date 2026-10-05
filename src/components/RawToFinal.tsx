import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, Film, Scissors, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface RawToFinalProps {
  onOpenContact?: () => void;
}

export const RawToFinal: React.FC<RawToFinalProps> = ({ onOpenContact }) => {
  const { content } = useApp();
  const rawToReady = content.rawToReady;

  const showBadge = rawToReady?.showBadge !== false;
  const showSubheading = rawToReady?.showSubheading !== false;
  const badgeText = rawToReady?.badge || 'THE TRANSFORMATION';
  const headingText = rawToReady?.heading || 'RAW → EDIT → READY';
  const subheadingText =
    rawToReady?.subheading ||
    'A focused transformation pipeline designed to turn unedited footage into high-retention content.';
  const coreStepBadge = rawToReady?.coreStepBadge || 'CORE STEP';

  const stageIcons = [Film, Scissors, CheckCircle2];

  const steps = rawToReady?.steps || [
    {
      num: '01',
      title: 'RAW FOOTAGE',
      desc: 'Uncut video, raw audio, and unpaced clips from your shoots.',
    },
    {
      num: '02',
      title: 'FOOTAZIX EDIT',
      desc: 'Hook construction, pacing, sound design, and color grading.',
    },
    {
      num: '03',
      title: 'READY TO PUBLISH',
      desc: 'Polished, platform-ready master content tuned for retention.',
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-[#07070b] border-t border-b border-white/5 relative overflow-hidden font-sans">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-14">
          {showBadge && (
            <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
              <span className="font-mono text-[11px]">{badgeText}</span>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight">
            {headingText}
          </h2>
          {showSubheading && (
            <p className="text-zinc-400 text-xs sm:text-sm mt-2 font-normal leading-relaxed">
              {subheadingText}
            </p>
          )}
        </div>

        {/* Compact Visual Transformation Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {steps.map((step, idx) => {
            const Icon = stageIcons[idx] || Film;
            const isMiddle = idx === 1;
            const badgeLabel = step.badge || (isMiddle ? coreStepBadge : null);

            return (
              <motion.div
                key={step.num || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className={`p-6 rounded-2xl border transition-all duration-300 relative ${
                  isMiddle
                    ? 'bg-[#0e0e18] border-blue-500/50 shadow-[0_0_24px_rgba(37,99,235,0.12)]'
                    : 'bg-[#090910] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-400 tracking-wider">
                      {step.num}
                    </span>
                  </div>
                  {badgeLabel && (
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {badgeLabel}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-display font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                  {step.desc}
                </p>

                {/* Step indicator arrow for desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-[#12121c] border border-white/20 text-blue-400 items-center justify-center shadow-md">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Optional Process CTA */}
        {rawToReady?.showCta && rawToReady?.ctaText && (
          <div className="text-center mt-12">
            <button
              onClick={() => {
                if (onOpenContact) {
                  onOpenContact();
                } else {
                  const el = document.getElementById('work') || document.querySelector('header');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <span>{rawToReady.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
