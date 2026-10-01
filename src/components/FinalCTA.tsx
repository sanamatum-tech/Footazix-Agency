import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface FinalCTAProps {
  onOpenModal: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenModal }) => {
  const { content } = useApp();

  return (
    <section className="py-24 sm:py-32 bg-[#050508] relative overflow-hidden font-sans">
      {/* Background restrained radial blue gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/[0.08] blur-[140px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto px-6 relative z-10 text-center"
      >
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
          <span className="font-mono text-[11px]">LET'S TALK</span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-extrabold text-white tracking-tight mb-5 leading-tight text-balance">
          {content.sectionHeadings.finalCtaHeadline || 'READY TO UPGRADE YOUR CONTENT?'}
        </h2>

        {/* Supporting */}
        <p className="text-base sm:text-lg text-zinc-300 max-w-xl mx-auto mb-10 leading-relaxed font-normal">
          {content.sectionHeadings.finalCtaSupporting ||
            "Send us your footage. We'll turn it into something worth watching."}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenModal}
            className="w-full sm:w-auto px-8 py-4 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all duration-200 shadow-[0_0_24px_rgba(37,99,235,0.4)] cursor-pointer flex items-center justify-center gap-2 group"
          >
            <span>BUILD WITH FOOTAZIX</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {content.brand.showInstagramButton !== false && Boolean(content.brand.instagram) && (
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={content.brand.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-300 bg-[#12121c] hover:text-white hover:bg-[#1a1a28] border border-white/10 rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2"
            >
              <span>INSTAGRAM</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            </motion.a>
          )}
        </div>
      </motion.div>
    </section>
  );
};
