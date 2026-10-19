import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface FinalCTAProps {
  onOpenModal: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenModal }) => {
  const { content } = useApp();
  const ctaConfig = content.finalCta;

  const showBadge = ctaConfig?.showBadge !== false;
  const showSupporting = ctaConfig?.showSupporting !== false;
  const showPrimaryCta =
    ctaConfig?.showPrimaryCta !== false &&
    content.sectionVisibility?.startProjectModal !== false;
  const showSecondaryCta =
    ctaConfig?.showSecondaryCta !== false &&
    content.sectionVisibility?.instagram !== false &&
    content.brand?.showInstagramButton !== false &&
    Boolean(content.brand?.instagram);

  const badgeText = ctaConfig?.badge || "LET'S TALK";
  const headlineText =
    ctaConfig?.heading ||
    content.sectionHeadings?.finalCtaHeadline ||
    'READY TO UPGRADE YOUR CONTENT?';
  const supportingText =
    ctaConfig?.supporting ||
    content.sectionHeadings?.finalCtaSupporting ||
    "Send us your footage. We'll turn it into something worth watching.";
  const primaryBtnText = ctaConfig?.primaryCta || 'BUILD WITH FOOTAZIX';
  const secondaryBtnText = ctaConfig?.secondaryCta || 'INSTAGRAM';

  return (
    <section className="py-24 sm:py-32 bg-[#070809] relative overflow-hidden font-sans">
      {/* Background restrained radial lime gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#B1FF00]/[0.08] blur-[140px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto px-6 relative z-10 text-center"
      >
        {/* Eyebrow */}
        {showBadge && (
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B1FF00] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B1FF00] shadow-[0_0_8px_rgba(177,255,0,0.8)]" />
            <span className="font-mono text-[11px]">{badgeText}</span>
          </div>
        )}

        {/* Headline */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-extrabold text-[#F5F7F2] tracking-tight mb-5 leading-tight text-balance">
          {headlineText}
        </h2>

        {/* Supporting */}
        {showSupporting && (
          <p className="text-base sm:text-lg text-[#A7AEA0] max-w-xl mx-auto mb-10 leading-relaxed font-normal">
            {supportingText}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {showPrimaryCta && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenModal}
              className="w-full sm:w-auto px-8 py-4 text-xs font-bold uppercase tracking-wider text-[#070809] bg-[#B1FF00] rounded-xl hover:bg-[#C4FF45] active:bg-[#96DB00] transition-all duration-200 shadow-[0_0_24px_rgba(177,255,0,0.35)] cursor-pointer flex items-center justify-center gap-2 group"
            >
              <span>{primaryBtnText}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#070809]" />
            </motion.button>
          )}

          {showSecondaryCta && (
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={content.brand.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-4 text-xs font-semibold uppercase tracking-wider text-[#F5F7F2] bg-[#0D0F10] hover:text-[#B1FF00] hover:bg-[#121512] border border-[#292E25] hover:border-[#B1FF00]/40 rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2"
            >
              <span>{secondaryBtnText}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#B1FF00]" />
            </motion.a>
          )}
        </div>
      </motion.div>
    </section>
  );
};
