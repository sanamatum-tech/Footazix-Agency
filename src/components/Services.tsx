import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, Sparkles, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface ServicesProps {
  onSelectService: (serviceName: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ onSelectService }) => {
  const { content, services } = useApp();
  const servicesConfig = content.servicesContent;

  const visibleServices = services.filter((s) => s.visible !== false);

  const showBadge = servicesConfig?.showBadge !== false;
  const showSubheading = servicesConfig?.showSubheading !== false;
  const showNumbers = servicesConfig?.showNumbers !== false;
  const showFeatureList = servicesConfig?.showFeatureList !== false;
  const showCta = servicesConfig?.showCta !== false;

  const badgeText = servicesConfig?.badge || 'SERVICES';
  const headingText =
    servicesConfig?.heading || content.sectionHeadings?.servicesHeading || 'WHAT WE DO';
  const subheadingText =
    servicesConfig?.subheading ||
    content.sectionHeadings?.servicesSubheading ||
    'High-retention editing and content strategy built around growth.';
  const highlightedBadge = servicesConfig?.highlightedBadge || 'MAIN SPECIALTY';

  return (
    <section id="services" className="py-20 sm:py-28 bg-[#050508] relative font-sans">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          {showBadge && (
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
              <span className="font-mono text-[11px]">{badgeText}</span>
            </div>
          )}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight mb-3">
            {headingText}
          </h2>
          {showSubheading && (
            <p className="text-sm sm:text-base text-zinc-400 font-normal">
              {subheadingText}
            </p>
          )}
        </div>

        {/* Services Cards */}
        {visibleServices.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-sm">
            No services published currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleServices.map((service, index) => {
              const isHighlighted = service.highlighted || index === 0;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className={`rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 relative group ${
                    isHighlighted
                      ? 'bg-[#0b0b14] border-2 border-blue-600/70 shadow-2xl shadow-blue-950/30'
                      : 'bg-[#08080f] border border-white/10 hover:border-white/20'
                  }`}
                >
                  {isHighlighted && (
                    <div className="absolute -top-3 left-6">
                      <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-600 text-white shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{highlightedBadge}</span>
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Number label */}
                    {showNumbers && (
                      <div className="flex items-center justify-between mb-6">
                        <span className="font-mono text-xs font-bold text-blue-400">
                          {service.number || `0${index + 1}`}
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white mb-3 tracking-tight">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6 font-normal">
                      {service.description}
                    </p>

                    {/* Feature bullets */}
                    {showFeatureList && service.features && service.features.length > 0 && (
                      <ul className="space-y-2.5 mb-8 border-t border-white/5 pt-5">
                        {service.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2.5 text-xs text-zinc-300 font-normal">
                            <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Service CTA */}
                  {showCta && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelectService(service.title)}
                      className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group ${
                        isHighlighted
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                          : 'bg-[#12121c] hover:bg-[#1a1a28] text-white border border-white/10'
                      }`}
                    >
                      <span>{service.ctaText || 'START EDITING PROJECT'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
