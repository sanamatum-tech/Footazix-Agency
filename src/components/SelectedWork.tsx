import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Project, AspectRatioType } from '../types';
import { ArrowUpRight, Play, X, ExternalLink, Film, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SelectedWorkProps {
  onSelectProjectForInquiry: (projectTitle: string) => void;
}

function parseVideoUrl(url?: string): { type: 'youtube' | 'vimeo' | 'direct' | 'none'; embedUrl?: string } {
  if (!url || !url.trim()) return { type: 'none' };
  const clean = url.trim();

  // YouTube Shorts: https://youtube.com/shorts/VIDEO_ID or https://www.youtube.com/shorts/VIDEO_ID
  const shortsMatch = clean.match(/(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch && shortsMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${shortsMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
    };
  }

  // YouTube Standard: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
  const ytMatch = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
    };
  }

  // Vimeo: https://vimeo.com/VIDEO_ID
  const vimeoMatch = clean.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&title=0&byline=0&portrait=0`,
    };
  }

  // Direct MP4 / WebM / video stream / Supabase storage
  if (clean.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i) || clean.includes('/footazix-media/videos/') || clean.includes('mixkit.co')) {
    return {
      type: 'direct',
      embedUrl: clean,
    };
  }

  // If already an embed or google drive link
  if (clean.includes('/embed/') || clean.includes('/preview')) {
    return {
      type: 'direct',
      embedUrl: clean,
    };
  }

  return {
    type: 'direct',
    embedUrl: clean,
  };
}

function getThumbnailAspectClass(ratio?: AspectRatioType): string {
  switch (ratio) {
    case '9:16':
      return 'aspect-[9/16]';
    case '1:1':
      return 'aspect-square';
    case '4:5':
      return 'aspect-[4/5]';
    case '4:3':
      return 'aspect-[4/3]';
    case 'auto':
      return 'aspect-[16/10]';
    case '16:9':
    default:
      return 'aspect-[16/9]';
  }
}

function getVideoPlayerStyle(ratio?: AspectRatioType): { modalMaxWidth: string; aspectClass: string } {
  switch (ratio) {
    case '9:16':
      return { modalMaxWidth: 'max-w-[420px]', aspectClass: 'aspect-[9/16] max-h-[72vh]' };
    case '4:5':
      return { modalMaxWidth: 'max-w-[480px]', aspectClass: 'aspect-[4/5] max-h-[72vh]' };
    case '1:1':
      return { modalMaxWidth: 'max-w-[540px]', aspectClass: 'aspect-square max-h-[70vh]' };
    case '4:3':
      return { modalMaxWidth: 'max-w-2xl', aspectClass: 'aspect-[4/3] max-h-[75vh]' };
    case 'auto':
      return { modalMaxWidth: 'max-w-3xl', aspectClass: 'aspect-auto max-h-[75vh]' };
    case '16:9':
    default:
      return { modalMaxWidth: 'max-w-3xl', aspectClass: 'aspect-[16/9] max-h-[75vh]' };
  }
}

export const SelectedWork: React.FC<SelectedWorkProps> = ({
  onSelectProjectForInquiry,
}) => {
  const { content, projects } = useApp();
  const portfolio = content.portfolio;

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeLightboxProject, setActiveLightboxProject] = useState<Project | null>(null);

  // Filter ONLY published and visible projects for the public showcase
  const publishedProjects = projects.filter(
    (p) => p.status === 'published' && p.visible !== false
  );

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

  const lightboxVideoInfo = activeLightboxProject ? parseVideoUrl(activeLightboxProject.videoUrl) : { type: 'none' as const };
  const lightboxPlayerStyle = activeLightboxProject ? getVideoPlayerStyle(activeLightboxProject.videoAspectRatio) : { modalMaxWidth: 'max-w-3xl', aspectClass: 'aspect-video' };

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
            {filteredProjects.map((project, idx) => {
              const thumbnailRatioClass = getThumbnailAspectClass(project.thumbnailAspectRatio);
              const videoRatio = project.videoAspectRatio || '16:9';
              const hasVideo = Boolean(project.videoUrl && project.videoUrl.trim());

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => handleCardClick(project)}
                  className="group relative rounded-2xl bg-[#090910] border border-white/10 hover:border-blue-500/50 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between shadow-lg"
                >
                  {/* Media Thumbnail Container — Uses Project Selected Thumbnail Aspect Ratio */}
                  <div className={`relative w-full ${thumbnailRatioClass} bg-zinc-950 overflow-hidden`}>
                    <img
                      src={project.coverImage || '/assets/portfolio/project-01/cover.jpg'}
                      alt={project.title}
                      loading="lazy"
                      className="w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-500"
                    />

                    {/* Dark gradient vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090910] via-black/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                    {/* Category Chip & Ratio Badges */}
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase bg-[#050508]/85 backdrop-blur-md text-white border border-white/15">
                        {project.category}
                      </span>
                      {project.videoAspectRatio && project.videoAspectRatio !== '16:9' && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold uppercase bg-blue-950/80 text-blue-300 border border-blue-500/30">
                          {project.videoAspectRatio}
                        </span>
                      )}
                    </div>

                    {/* Play Video Trigger Badge */}
                    {hasVideo && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200 backdrop-blur-sm">
                          <Play className="w-5 h-5 fill-white translate-x-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Hover Action Badge */}
                    <div className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl bg-blue-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-100 scale-90 duration-200">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-5 sm:p-6 flex flex-col justify-between flex-grow">
                    <div>
                      {project.client && (
                        <p className="text-[11px] font-mono uppercase tracking-wider text-blue-400 mb-1">
                          {project.client}
                        </p>
                      )}
                      <h3 className="text-base sm:text-lg font-display font-extrabold text-white tracking-tight group-hover:text-blue-400 transition-colors mb-2">
                        {project.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal line-clamp-2">
                        {project.description}
                      </p>
                    </div>

                    {/* Quick Card Action */}
                    <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-mono text-[11px] flex items-center gap-1">
                        <Film className="w-3 h-3 text-blue-400" />
                        <span>{videoRatio.toUpperCase()} EDIT</span>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProjectForInquiry(project.title);
                        }}
                        className="text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors text-[11px]"
                      >
                        <span>{cardCta}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox / Video Modal with Automatic Selected Video Aspect Ratio */}
      <AnimatePresence>
        {activeLightboxProject && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
            onClick={() => setActiveLightboxProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full ${lightboxPlayerStyle.modalMaxWidth} bg-[#090910] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-5 sm:p-6 my-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Topbar */}
              <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono uppercase text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30">
                      {activeLightboxProject.category}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Ratio: {activeLightboxProject.videoAspectRatio || '16:9'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                    {activeLightboxProject.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveLightboxProject(null)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white bg-[#12121c] border border-white/10 cursor-pointer shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Video Player Container — Strictly formatted according to selected Video Aspect Ratio */}
              <div className={`relative ${lightboxPlayerStyle.aspectClass} w-full rounded-xl overflow-hidden bg-black mb-4 border border-white/10 flex items-center justify-center shadow-inner`}>
                {lightboxVideoInfo.type === 'youtube' && lightboxVideoInfo.embedUrl ? (
                  <iframe
                    src={lightboxVideoInfo.embedUrl}
                    title={activeLightboxProject.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : lightboxVideoInfo.type === 'vimeo' && lightboxVideoInfo.embedUrl ? (
                  <iframe
                    src={lightboxVideoInfo.embedUrl}
                    title={activeLightboxProject.title}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : lightboxVideoInfo.type === 'direct' && lightboxVideoInfo.embedUrl ? (
                  <video
                    src={lightboxVideoInfo.embedUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  /* Fallback to high-res thumbnail with play overlay */
                  <div className="relative w-full h-full">
                    <img
                      src={activeLightboxProject.coverImage || '/assets/portfolio/project-01/cover.jpg'}
                      alt={activeLightboxProject.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 text-center">
                      <span className="text-xs font-mono text-zinc-300 mb-1">PREVIEW THUMBNAIL</span>
                      <p className="text-[11px] text-zinc-400 max-w-xs">
                        Video edit showcase. Direct video URL can be added in the Portfolio CMS.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Project Meta and Description */}
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-5 font-normal">
                {activeLightboxProject.description}
              </p>

              {/* Modal Bottom Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                  <span>Client:</span>
                  <span className="text-white font-semibold">{activeLightboxProject.client || 'Creative Showcase'}</span>
                  {activeLightboxProject.projectUrl && (
                    <a
                      href={activeLightboxProject.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 ml-2 inline-flex items-center gap-1"
                    >
                      <span>Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <button
                  onClick={() => {
                    const title = activeLightboxProject.title;
                    setActiveLightboxProject(null);
                    onSelectProjectForInquiry(title);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{cardCta}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
