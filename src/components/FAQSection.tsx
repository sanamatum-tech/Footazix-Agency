import React, { useState, useId } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Minus, ArrowRight, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FAQ } from '../types';

interface FAQSectionProps {
  onOpenContact?: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ onOpenContact }) => {
  const { content, faqs } = useApp();
  const faqConfig = content.faqSection;

  // Filter only published and visible FAQs, sorted by display order
  const publicFaqs = React.useMemo(() => {
    return faqs
      .filter((f) => f.published !== false && f.visible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [faqs]);

  // Categories
  const categories = React.useMemo(() => {
    const raw = Array.from(new Set(publicFaqs.map((f) => f.category || 'General')));
    return ['ALL', ...raw];
  }, [publicFaqs]);

  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Filtered FAQs by category
  const filteredFaqs = React.useMemo(() => {
    if (selectedCategory === 'ALL') return publicFaqs;
    return publicFaqs.filter(
      (f) => (f.category || 'General').toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [publicFaqs, selectedCategory]);

  // Accordion state
  const allowMultiple = faqConfig?.allowMultipleOpen || false;
  const [openIds, setOpenIds] = useState<string[]>(() => {
    // Default open the first featured or first item
    const first = publicFaqs.find((f) => f.featured) || publicFaqs[0];
    return first ? [first.id] : [];
  });

  const toggleFAQ = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  if (publicFaqs.length === 0) {
    return null;
  }

  const badgeText = faqConfig?.badge || 'QUESTIONS & ANSWERS';
  const headingText = faqConfig?.heading || 'FREQUENTLY ASKED QUESTIONS';
  const subheadingText =
    faqConfig?.subheading ||
    'Everything you need to know about our video editing pipeline, raw footage workflow, and growth partnerships.';
  const ctaText = faqConfig?.ctaText || 'HAVE A CUSTOM QUESTION? REACH OUT →';
  const showCta = faqConfig?.ctaVisible !== false;

  return (
    <section
      id="faq"
      className="relative py-24 sm:py-32 bg-[#050508] text-white border-t border-white/5 overflow-hidden"
    >
      {/* Background Ambience (No random gradients, subtle electric blue glow only) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
            <span>{badgeText}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight uppercase leading-[1.1] mb-4">
            {headingText}
          </h2>

          {subheadingText && (
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-sans">
              {subheadingText}
            </p>
          )}

          {/* Category Filter Chips */}
          {categories.length > 2 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    type="button"
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border border-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                        : 'bg-[#0e0e18] text-zinc-400 border border-white/10 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5 max-w-3xl mx-auto">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIds.includes(faq.id);
            const buttonId = `faq-btn-${faq.id}`;
            const panelId = `faq-panel-${faq.id}`;

            return (
              <div
                key={faq.id}
                className={`rounded-2xl transition-all duration-200 border ${
                  isOpen
                    ? 'bg-[#0a0d18] border-blue-500/40 shadow-[0_4px_24px_rgba(37,99,235,0.08)]'
                    : 'bg-[#090910] border-white/10 hover:border-white/20'
                }`}
              >
                <button
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full py-5 px-5 sm:px-6 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl select-none"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-semibold block">
                      {faq.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                      {faq.question}
                    </h3>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center transition-colors duration-200 mt-0.5 ${
                      isOpen
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-[#12121c] text-zinc-400 border border-white/10'
                    }`}
                  >
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-white/5 space-y-4">
                        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
                          {faq.answer}
                        </p>

                        {/* Optional item-specific CTA */}
                        {faq.ctaText && faq.ctaUrl && (
                          <div className="pt-2">
                            {faq.ctaUrl === '#inquiry' || faq.ctaUrl === 'inquiry' ? (
                              <button
                                type="button"
                                onClick={onOpenContact}
                                className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 font-mono tracking-wider uppercase cursor-pointer"
                              >
                                <span>{faq.ctaText}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <a
                                href={faq.ctaUrl}
                                className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 font-mono tracking-wider uppercase"
                              >
                                <span>{faq.ctaText}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Section Bottom CTA Banner */}
        {showCta && (
          <div className="mt-14 sm:mt-20 p-6 sm:p-8 rounded-2xl bg-[#090910] border border-white/10 text-center max-w-2xl mx-auto space-y-4">
            <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Have a specific question about your footage or editing needs?
            </h4>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
              Our team can review your raw files, discuss retention strategy, and provide a tailored plan.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenContact}
                className="px-6 py-3 rounded-xl text-xs font-bold font-mono uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 cursor-pointer active:scale-95 inline-flex items-center gap-2"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
