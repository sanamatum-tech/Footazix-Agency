import React from 'react';
import { SITE_CONFIG } from '../config/siteContent';

interface SelectedWorkProps {
  onSelectProjectForInquiry?: (projectTitle: string) => void;
}

export const SelectedWork: React.FC<SelectedWorkProps> = ({ onSelectProjectForInquiry }) => {
  return (
    <section id="work" className="py-20 bg-[#050508]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>PORTFOLIO</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            {SITE_CONFIG.portfolio.heading}
          </h2>
          <p className="text-zinc-400 text-sm mt-1.5">
            "{SITE_CONFIG.portfolio.subheading}"
          </p>
        </div>

        {/* Portfolio Grid: 3-4 Strong Projects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {SITE_CONFIG.portfolio.projects.map((project) => (
            <article
              key={project.id}
              onClick={() => onSelectProjectForInquiry && onSelectProjectForInquiry(project.title)}
              className="group relative rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-blue-500/40 transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* Large Visual Thumbnail */}
              <div className="relative w-full aspect-video overflow-hidden bg-zinc-900">
                <img
                  src={project.coverImage}
                  alt={project.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                {/* Category label */}
                <div className="absolute top-3 left-3">
                  <span className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-semibold tracking-wider uppercase text-blue-400 border border-white/10">
                    {project.category}
                  </span>
                </div>

                {/* Subtle Play indicator on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center pl-0.5 shadow-xl glow-blue-sm">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Text Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-display font-bold text-white group-hover:text-blue-400 transition-colors mb-1.5">
                    {project.title}
                  </h3>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium">Inquire for this format</span>
                  <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
