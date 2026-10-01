import React from 'react';
import { useApp } from '../context/AppContext';

interface ServicesProps {
  onSelectService: (serviceName: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ onSelectService }) => {
  const { content, services } = useApp();

  const visibleServices = services.filter((s) => s.visible !== false);

  return (
    <section id="services" className="py-20 sm:py-28 bg-[#050508] relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
            <span>SERVICES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight mb-3">
            {content.sectionHeadings.servicesHeading || 'WHAT WE DO'}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-normal">
            {content.sectionHeadings.servicesSubheading || 'High-retention editing and content strategy built around growth.'}
          </p>
        </div>

        {/* Services Cards */}
        {visibleServices.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-sm">
            No services published currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleServices.map((service, index) => {
              const isFirst = index === 0 || service.highlighted;
              return (
                <div
                  key={service.id}
                  className={`rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 relative group ${
                    isFirst
                      ? 'bg-zinc-950 border-2 border-blue-600/70 shadow-xl shadow-blue-950/20'
                      : 'bg-zinc-950/70 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {isFirst && (
                    <div className="absolute -top-3 left-6">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white shadow-md">
                        MAIN SPECIALTY
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Number label */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono text-xs font-bold text-blue-400">
                        {service.number || `0${index + 1}`}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-3 tracking-tight">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                      {service.description}
                    </p>

                    {/* Feature bullets if available */}
                    {service.features && service.features.length > 0 && (
                      <ul className="space-y-2 mb-8 border-t border-white/5 pt-4">
                        {service.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2 text-xs text-zinc-300">
                            <span className="text-blue-500 font-bold mt-0.5">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Service CTA */}
                  <button
                    onClick={() => onSelectService(service.title)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                      isFirst
                        ? 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95 glow-blue-sm'
                        : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-white/10'
                    }`}
                  >
                    <span>{service.ctaText || 'START THIS SERVICE'}</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
