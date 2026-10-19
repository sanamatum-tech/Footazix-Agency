import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Minus, HelpCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQSectionProps {
  onOpenContact?: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ onOpenContact }) => {
  const { content, faqs, isLoading } = useApp();
  const faqConfig = content.faqSection;

  // Filter public visible and published FAQs only
  const publicFaqs = faqs
    .filter((f) => f.visible !== false && f.published !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openIds, setOpenIds] = useState<string[]>([]);

  // Calculate unique categories from published FAQs
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    publicFaqs.forEach((f) => {
      if (f.category && f.category.trim()) {
        set.add(f.category.trim());
      }
    });
    return ['All', ...Array.from(set)];
  }, [publicFaqs]);

  // Filter list by selected category
  const filteredFaqs = React.useMemo(() => {
    if (selectedCategory === 'All') return publicFaqs;
    return publicFaqs.filter((f) => f.category === selectedCategory);
  }, [publicFaqs, selectedCategory]);

  const toggleFAQ = (id: string) => {
    const allowMultiple = faqConfig?.allowMultipleOpen ?? false;
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  const badgeText = faqConfig?.badge || 'QUESTIONS & CLARITY';
  const headingText = faqConfig?.heading || 'FREQUENTLY ASKED QUESTIONS';
  const subheadingText =
    faqConfig?.subheading ||
    'Everything you need to know about our editing pipeline, raw footage workflow, and content partnerships.';
  const ctaText = faqConfig?.ctaText || 'HAVE A CUSTOM QUESTION? REACH OUT →';
  const showCta = faqConfig?.ctaVisible !== false;

  return (
    <section
      id="faq"
      className="relative py-24 sm:py-32 bg-[#070809] text-white border-t border-[#292E25] overflow-hidden"
    >
      {/* Background Ambience (No random gradients, subtle lime glow only) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#B1FF00]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B1FF00]/10 border border-[#B1FF00]/20 text-[#B1FF00] text-xs font-mono font-bold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B1FF00] shadow-[0_0_8px_rgba(177,255,0,0.8)]" />
            <span>{badgeText}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[#F5F7F2] tracking-tight uppercase leading-[1.1] mb-4">
            {headingText}
          </h2>

          {subheadingText && (
            <p className="text-sm sm:text-base text-[#A7AEA0] leading-relaxed font-sans">
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
                        ? 'bg-[#B1FF00] text-[#070809] border border-[#B1FF00] shadow-[0_0_12px_rgba(177,255,0,0.3)] font-bold'
                        : 'bg-[#0D0F10] text-[#A7AEA0] border border-[#292E25] hover:text-[#F5F7F2] hover:border-[#B1FF00]/30'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && publicFaqs.length === 0 && (
          <div className="space-y-3.5 max-w-3xl mx-auto animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-[#292E25] bg-[#121512] p-5 sm:p-6 space-y-2.5"
              >
                <div className="h-3 w-16 bg-[#B1FF00]/20 rounded" />
                <div className="h-5 w-3/4 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && publicFaqs.length === 0 && (
          <div className="max-w-2xl mx-auto p-8 sm:p-10 rounded-2xl bg-[#121512] border border-[#292E25] text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#B1FF00]/10 border border-[#B1FF00]/20 flex items-center justify-center mx-auto text-[#B1FF00]">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#F5F7F2] tracking-tight">
              No Frequently Asked Questions Published Yet
            </h3>
            <p className="text-xs sm:text-sm text-[#A7AEA0] max-w-md mx-auto leading-relaxed">
              Have a specific question about our video editing pipelines, turnaround times, or creative strategy? Reach out to our team directly.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenContact}
                className="px-6 py-3 rounded-xl text-xs font-bold font-mono uppercase tracking-wider text-[#070809] bg-[#B1FF00] hover:bg-[#C4FF45] active:bg-[#96DB00] transition-all shadow-lg shadow-[#B1FF00]/20 cursor-pointer inline-flex items-center gap-2"
              >
                <span>REACH OUT TO OUR TEAM →</span>
              </button>
            </div>
          </div>
        )}

        {/* Accordion List */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-3.5 max-w-3xl mx-auto">
            {filteredFaqs.map((faq) => {
              const isOpen = openIds.includes(faq.id);
              const buttonId = `faq-btn-${faq.id}`;
              const panelId = `faq-panel-${faq.id}`;

              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl transition-all duration-200 border ${
                    isOpen
                      ? 'bg-[#181C16] border-[#B1FF00]/40 shadow-[0_4px_24px_rgba(177,255,0,0.08)]'
                      : 'bg-[#121512] border-[#292E25] hover:border-[#B1FF00]/30'
                  }`}
                >
                  <button
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full py-5 px-5 sm:px-6 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B1FF00] rounded-2xl select-none"
                  >
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#B1FF00] font-semibold block">
                        {faq.category}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-[#F5F7F2] tracking-tight leading-snug">
                        {faq.question}
                      </h3>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center transition-colors duration-200 mt-0.5 ${
                        isOpen
                          ? 'bg-[#B1FF00] text-[#070809] shadow-md'
                          : 'bg-[#0D0F10] text-[#A7AEA0] border border-[#292E25]'
                      }`}
                    >
                      {isOpen ? <Minus className="w-4 h-4 text-[#070809]" /> : <Plus className="w-4 h-4" />}
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
                        <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-[#292E25] space-y-4">
                          <p className="text-sm sm:text-base text-[#F5F7F2] leading-relaxed font-sans whitespace-pre-line">
                            {faq.answer}
                          </p>

                          {/* Optional item-specific CTA */}
                          {faq.ctaText && faq.ctaUrl && (
                            <div className="pt-2">
                              {faq.ctaUrl === '#inquiry' || faq.ctaUrl === 'inquiry' ? (
                                <button
                                  type="button"
                                  onClick={onOpenContact}
                                  className="inline-flex items-center gap-2 text-xs font-bold text-[#B1FF00] hover:text-[#C4FF45] font-mono tracking-wider uppercase cursor-pointer"
                                >
                                  <span>{faq.ctaText}</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-[#B1FF00]" />
                                </button>
                              ) : (
                                <a
                                  href={faq.ctaUrl}
                                  className="inline-flex items-center gap-2 text-xs font-bold text-[#B1FF00] hover:text-[#C4FF45] font-mono tracking-wider uppercase"
                                >
                                  <span>{faq.ctaText}</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-[#B1FF00]" />
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
        ) : (
          publicFaqs.length > 0 && (
            <div className="text-center py-12 text-[#A7AEA0] text-sm font-mono border border-[#292E25] rounded-2xl bg-[#121512] max-w-xl mx-auto">
              No questions found in category &ldquo;{selectedCategory}&rdquo;.
            </div>
          )
        )}

        {/* Section Bottom CTA Banner */}
        {showCta && (
          <div className="mt-14 sm:mt-20 p-6 sm:p-8 rounded-2xl bg-[#121512] border border-[#292E25] text-center max-w-2xl mx-auto space-y-4">
            <h4 className="text-base sm:text-lg font-bold text-[#F5F7F2] tracking-tight">
              Have a specific question about your footage or editing needs?
            </h4>
            <p className="text-xs sm:text-sm text-[#A7AEA0] max-w-md mx-auto">
              Our team can review your raw files, discuss retention strategy, and provide a tailored plan.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenContact}
                className="px-6 py-3 rounded-xl text-xs font-bold font-mono uppercase tracking-wider text-[#070809] bg-[#B1FF00] hover:bg-[#C4FF45] active:bg-[#96DB00] transition-all shadow-lg shadow-[#B1FF00]/20 cursor-pointer inline-flex items-center gap-2"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#070809]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
