import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProjectCategory } from '../types';

interface SelectedWorkProps {
  onSelectProjectForInquiry: (projectTitle: string) => void;
}

export const SelectedWork: React.FC<SelectedWorkProps> = ({
  onSelectProjectForInquiry,
}) => {
  const { content, projects } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const publishedProjects = projects.filter((p) => p.status === 'published');

  const categories: Array<'All' | ProjectCategory> = [
    'All',
    'Reels',
    'Shorts',
    'YouTube',
    'Brand',
  ];

  const filteredProjects =
    activeCategory === 'All'
      ? publishedProjects
      : publishedProjects.filter((p) => p.category === activeCategory);

  return (
    <section id="work" className="py-20 sm:py-28 bg-[#050508] border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
              <span>PORTFOLIO</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight mb-2">
              {content.sectionHeadings.portfolioHeading || 'SELECTED WORK'}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-normal">
              {content.sectionHeadings.portfolioSubheading || 'Raw footage in. Content worth watching out.'}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid or Empty State */}
        {filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-12 text-center max-w-lg mx-auto my-8">
            <div className="w-12 h-12 rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-1">No projects yet.</h3>
            <p className="text-xs text-zinc-400">
              Add your first project from the Portfolio CMS in the admin dashboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProjectForInquiry(project.title)}
                className="group relative rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-blue-500/50 transition-all duration-300 flex flex-col cursor-pointer shadow-lg hover:shadow-blue-500/10"
              >
                {/* Visual Thumbnail */}
                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                  <img
                    src={project.coverImage || '/assets/vsl/vsl-poster.jpg'}
                    alt={project.title}
                    className="w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Category Pill */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/70 text-blue-400 border border-blue-500/30 backdrop-blur-sm">
                      {project.category}
                    </span>
                  </div>

                  {/* Hover indicator */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 shadow-md">
                      <span>Request Similar Cut</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Content details */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors mb-2">
                    {project.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
