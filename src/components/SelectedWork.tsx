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
  const portfolio = content.portfolio;

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeLightboxProject, setActiveLightboxProject] = useState<Project | null>(null);

  const publishedProjects = projects.filter((p) => p.status === 'published');

  const categories: string[] = portfolio?.categories && portfolio.categories.length > 0
    ? portfolio.categories
    : ['All', 'Reels', 'Shorts', 'YouTube', 'Brand'];

  const filteredProjects =
    activeCategory === 'All'
      ? publishedProjects
      : publishedProjects.filter((p) => p.category === activeCategory);

  const handleCardClick = (project: Project) => {
    setActiveLightboxProject(project);
  };

  const showBadge = portfolio?.showBadge !== false;
  const showSubheading = portfolio?.showSubheading !== false;
  const showFilters = portfolio?.showFilters !== false;

  const sectionBadge = portfolio?.badge || 'PORTFOLIO';
  const sectionHeading =
    portfolio?.heading || content.sectionHeadings?.portfolioHeading || 'SELECTED WORK';
  const sectionSubheading =
    portfolio?.subheading ||
    content.sectionHeadings?.portfolioSubheading ||
    'Recent video edits engineered for audience retention and growth.';

  const cardCta = portfolio?.cardCtaText || 'INQUIRE ABOUT THIS STYLE';
  const emptyTitle = portfolio?.emptyTitle || 'No projects in this category';
  const emptyDesc =
    portfolio?.emptyDesc || 'Check other categories or explore all published work.';

  return (
    <section id="work" className="py-20 sm:py-28 bg-[#050508] border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            {showBadge && (
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                <span className="font-mono text-[11px]">{sectionBadge}</span>
              </div>
            )}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight mb-2">
              {sectionHeading}
            </h2>
            {showSubheading && (
              <p className="text-sm sm:text-base text-zinc-400 font-normal">
                {sectionSubheading}
              </p>
            )}
          </div>

          {/* Segmented Filter Controls */}
          {showFilters && categories.length > 1 && (
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
          )}
        </div>

        {/* Projects Grid or Empty State */}
        {filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#090910] p-12 text-center max-w-lg mx-auto my-8">
            <h3 className="text-base font-bold text-white mb-1">{emptyTitle}</h3>
            <p className="text-xs text-zinc-400">{emptyDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => handleCardClick(project)}
                className="group relative rounded-2xl bg-[#090910] border border-white/10 hover:border-blue-500/50 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between shadow-lg"
              >
                {/* Media Thumbnail Container */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-zinc-950 overflow-hidden">
                  <img
                    src={project.coverImage || '/assets/portfolio/project-01/cover.jpg'}
                    alt={project.title}
                    loading="lazy"
                    className="w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-500"
                  />

                  {/* Dark gradient vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090910] via-black/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Category Chip */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 rounded-lg text-[11px] font-mono font-bold tracking-wider uppercase bg-[#050508]/85 backdrop-blur-md text-white border border-white/15">
                      {project.category}
                    </span>
                  </div>

                  {/* Hover Action Badge */}
                  <div className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl bg-blue-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-100 scale-90 duration-200">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    {project.client && (
                      <p className="text-[11px] font-mono uppercase tracking-wider text-blue-400 mb-1">
                        {project.client}
                      </p>
                    )}
                    <h3 className="text-lg sm:text-xl font-display font-extrabold text-white tracking-tight group-hover:text-blue-400 transition-colors mb-2">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  {/* Quick Card Action */}
                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-mono text-[11px]">PROJECT EDIT</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProjectForInquiry(project.title);
                      }}
                      className="text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>{cardCta}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox / Video Modal */}
      <AnimatePresence>
        {activeLightboxProject && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setActiveLightboxProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-[#090910] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div>
                  <span className="text-[11px] font-mono uppercase text-blue-400 block">
                    {activeLightboxProject.category}
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {activeLightboxProject.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveLightboxProject(null)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white bg-[#12121c] border border-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative aspect-video rounded-xl overflow-hidden bg-black mb-4">
                {activeLightboxProject.videoUrl ? (
                  <iframe
                    src={activeLightboxProject.videoUrl}
                    title={activeLightboxProject.title}
                    className="w-full h-full border-0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={activeLightboxProject.coverImage || '/assets/portfolio/project-01/cover.jpg'}
                    alt={activeLightboxProject.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6 font-normal">
                {activeLightboxProject.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs text-zinc-400 font-mono">
                  {activeLightboxProject.client || 'Creative Showcase'}
                </span>
                <button
                  onClick={() => {
                    const title = activeLightboxProject.title;
                    setActiveLightboxProject(null);
                    onSelectProjectForInquiry(title);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {cardCta}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
