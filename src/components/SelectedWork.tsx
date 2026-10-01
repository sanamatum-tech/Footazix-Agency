import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Project, ProjectCategory } from '../types';
import { ArrowUpRight, Play, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SelectedWorkProps {
  onSelectProjectForInquiry: (projectTitle: string) => void;
}

export const SelectedWork: React.FC<SelectedWorkProps> = ({
  onSelectProjectForInquiry,
}) => {
  const { content, projects } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeLightboxProject, setActiveLightboxProject] = useState<Project | null>(null);

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

  const handleCardClick = (project: Project) => {
    setActiveLightboxProject(project);
  };

  return (
    <section id="work" className="py-20 sm:py-28 bg-[#050508] border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
              <span className="font-mono text-[11px]">PORTFOLIO</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight mb-2">
              {content.sectionHeadings.portfolioHeading || 'SELECTED WORK'}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-normal">
              {content.sectionHeadings.portfolioSubheading ||
                'Recent video edits engineered for audience retention and growth.'}
            </p>
          </div>

          {/* Segmented Filter Controls */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0c0c14] border border-white/10 rounded-xl self-start md:self-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.35)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid or Empty State */}
        {filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#090910] p-12 text-center max-w-lg mx-auto my-8">
            <h3 className="text-base font-bold text-white mb-1">No projects in this category</h3>
            <p className="text-xs text-zinc-400">
              Check other categories or explore all published work.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {filteredProjects.map((project, idx) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => handleCardClick(project)}
                className="group relative rounded-2xl overflow-hidden bg-[#0a0a12] border border-white/10 hover:border-blue-500/50 transition-all duration-300 flex flex-col cursor-pointer shadow-lg hover:shadow-blue-500/10"
              >
                {/* Visual Thumbnail with cinematic zoom */}
                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                  <img
                    src={project.coverImage || '/assets/vsl/vsl-poster.jpg'}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  {/* Contrast Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity" />

                  {/* Play icon badge if video */}
                  {project.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-black/60 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Category Pill */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-black/70 text-blue-400 border border-blue-500/30 backdrop-blur-sm">
                      {project.category}
                    </span>
                  </div>

                  {/* Top Right Action Arrow */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200">
                    <ArrowUpRight className="w-4 h-4 text-blue-400" />
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {project.client && (
                      <span className="text-xs font-mono text-zinc-400 tracking-wider uppercase block mb-1">
                        Client: {project.client}
                      </span>
                    )}
                    <h3 className="text-lg sm:text-xl font-display font-extrabold text-white group-hover:text-blue-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-blue-400 font-semibold group-hover:underline flex items-center gap-1">
                      <span>View Project Details</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProjectForInquiry(project.title);
                      }}
                      className="text-zinc-400 hover:text-white hover:underline"
                    >
                      Request Similar Edit
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* Project Lightbox / Detail Modal */}
      <AnimatePresence>
        {activeLightboxProject && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setActiveLightboxProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl bg-[#0b0b14] border border-white/15 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-500/30">
                    {activeLightboxProject.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white mt-2">
                    {activeLightboxProject.title}
                  </h3>
                  {activeLightboxProject.client && (
                    <p className="text-xs text-zinc-400 font-mono">
                      Client: {activeLightboxProject.client}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setActiveLightboxProject(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-[#12121c]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Media Container */}
              <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-white/10">
                {activeLightboxProject.videoUrl ? (
                  <video
                    src={activeLightboxProject.videoUrl}
                    poster={activeLightboxProject.coverImage}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={activeLightboxProject.coverImage}
                    alt={activeLightboxProject.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block mb-1">
                  Creative & Editorial Approach
                </span>
                <p className="text-sm text-zinc-300 leading-relaxed font-normal">
                  {activeLightboxProject.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
                {activeLightboxProject.projectUrl ? (
                  <a
                    href={activeLightboxProject.projectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1.5"
                  >
                    <span>View original link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <div />
                )}

                <button
                  onClick={() => {
                    const title = activeLightboxProject.title;
                    setActiveLightboxProject(null);
                    onSelectProjectForInquiry(title);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_16px_rgba(37,99,235,0.35)] transition-all cursor-pointer"
                >
                  Request Similar Project →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
