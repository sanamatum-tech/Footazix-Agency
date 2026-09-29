import React from 'react';
import { SITE_CONFIG } from '../config/siteContent';

interface ServicesProps {
  onSelectService: (serviceName: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ onSelectService }) => {
  return (
    <section id="services" className="py-20 bg-[#050508] relative">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>SERVICES</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            {SITE_CONFIG.services.heading}
          </h2>
        </div>

        {/* 3 Services: 01 Video Editing is visually dominant */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          {/* Service 01: VIDEO EDITING (Dominant 6 or 7 cols) */}
          {SITE_CONFIG.services.items
            .filter((s) => s.highlighted)
            .map((service) => (
              <div
                key={service.id}
                className="md:col-span-6 lg:col-span-6 rounded-2xl p-7 bg-gradient-to-br from-zinc-900 via-zinc-950 to-blue-950/30 border border-blue-500/40 shadow-xl relative flex flex-col justify-between glow-blue-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold text-blue-400 tracking-wider">
                      {service.number} // MAIN SERVICE
                    </span>
                    <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                      CORE
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-2">
                    {service.title}
                  </h3>
                  <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={() => onSelectService(service.title)}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-lg active:scale-95 transition-all glow-blue-sm cursor-pointer"
                  >
                    Start Video Editing →
                  </button>
                </div>
              </div>
            ))}

          {/* Services 02 & 03: CONTENT & GROWTH (Stacked in remaining columns) */}
          <div className="md:col-span-6 lg:col-span-6 flex flex-col gap-5">
            {SITE_CONFIG.services.items
              .filter((s) => !s.highlighted)
              .map((service) => (
                <div
                  key={service.id}
                  className="rounded-2xl p-6 bg-zinc-950/80 border border-white/10 hover:border-white/20 transition-all duration-200 flex-1 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-zinc-500 tracking-wider block mb-3">
                      {service.number}
                    </span>
                    <h3 className="text-xl font-display font-bold text-white mb-1.5">
                      {service.title}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5">
                    <button
                      onClick={() => onSelectService(service.title)}
                      className="text-xs font-semibold text-zinc-400 hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Inquire About {service.title}</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
};
