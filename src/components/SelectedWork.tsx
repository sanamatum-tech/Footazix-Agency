import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Project, AspectRatioType } from '../types';
import {
  ArrowUpRight,
  Play,
  X,
  ExternalLink,
  Film,
  ChevronLeft,
  ChevronRight,
  GripHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SelectedWorkProps {
  onSelectProjectForInquiry: (projectTitle: string) => void;
}

function parseVideoUrl(url?: string): { type: 'youtube' | 'vimeo' | 'direct' | 'none'; embedUrl?: string } {
  if (!url || !url.trim()) return { type: 'none' };
  const clean = url.trim();

  // YouTube Shorts
  const shortsMatch = clean.match(/(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch && shortsMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${shortsMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
    };
  }

  // YouTube Standard
  const ytMatch = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
    };
  }

  // Vimeo
  const vimeoMatch = clean.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&title=0&byline=0&portrait=0`,
    };
  }

  // Direct MP4 / WebM / storage stream
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
    case 'original':
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
    case 'original':
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

  // Slider track state
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Mouse drag & momentum variables
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const [isPointerDown, setIsPointerDown] = useState(false);

  // Filter ONLY published and visible projects for public showcase
  const publishedProjects = projects.filter(
    (p) => p.status === 'published' && p.visible !== false
  );

  const categories: string[] =
    portfolio?.categories && portfolio.categories.length > 0
      ? portfolio.categories
      : ['All', 'Reels', 'Shorts', 'YouTube', 'Brand'];

  const filteredProjects =
    activeCategory === 'All'
      ? publishedProjects
      : publishedProjects.filter((p) => p.category === activeCategory);

  // Update slider scroll position states
  const updateScrollMetrics = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const current = el.scrollLeft;

    setCanScrollPrev(current > 10);
    setCanScrollNext(current < maxScroll - 10);
    setScrollProgress(maxScroll > 0 ? (current / maxScroll) * 100 : 0);

    const cards = el.querySelectorAll<HTMLElement>('[data-slider-card]');
    if (cards.length > 0) {
      let closestIdx = 0;
      let minDiff = Infinity;
      cards.forEach((card, idx) => {
        const diff = Math.abs(card.offsetLeft - el.scrollLeft);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      setActiveSlideIndex(closestIdx);
    }
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateScrollMetrics();
    el.addEventListener('scroll', updateScrollMetrics, { passive: true });
    window.addEventListener('resize', updateScrollMetrics);
    return () => {
      el.removeEventListener('scroll', updateScrollMetrics);
      window.removeEventListener('resize', updateScrollMetrics);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [updateScrollMetrics, filteredProjects.length]);

  // Reset scroll to start when category filter changes
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [activeCategory]);

  const scrollPrev = () => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-slider-card]');
    const shift = card ? card.offsetWidth + 24 : 400;
    el.scrollBy({ left: -shift, behavior: 'smooth' });
  };

  const scrollNext = () => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-slider-card]');
    const shift = card ? card.offsetWidth + 24 : 400;
    el.scrollBy({ left: shift, behavior: 'smooth' });
  };

  const scrollToIndex = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>('[data-slider-card]');
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  };

  // Mouse drag implementation with momentum physics
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = trackRef.current;
    if (!el) return;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX;
    startScrollLeftRef.current = el.scrollLeft;
    lastXRef.current = e.pageX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    setIsPointerDown(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const el = trackRef.current;
    if (!el) return;
    const dx = e.pageX - startXRef.current;
    if (Math.abs(dx) > 6) {
      hasMovedRef.current = true;
    }
    el.scrollLeft = startScrollLeftRef.current - dx;

    const now = performance.now();
    const dt = now - lastTimeRef.current;
    if (dt > 12) {
      velocityRef.current = (lastXRef.current - e.pageX) / dt;
      lastXRef.current = e.pageX;
      lastTimeRef.current = now;
    }
  };

  const handleMouseUpOrLeave = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsPointerDown(false);

    const el = trackRef.current;
    if (!el || Math.abs(velocityRef.current) < 0.2) {
      setTimeout(() => {
        hasMovedRef.current = false;
      }, 60);
      return;
    }

    // Inertial glide decay
    let currentVel = velocityRef.current * 16;
    const applyInertia = () => {
      if (!el || Math.abs(currentVel) < 0.4) {
        setTimeout(() => {
          hasMovedRef.current = false;
        }, 60);
        return;
      }
      el.scrollLeft += currentVel;
      currentVel *= 0.91;
      animationFrameRef.current = requestAnimationFrame(applyInertia);
    };
    animationFrameRef.current = requestAnimationFrame(applyInertia);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollNext();
    }
  };

  const handleCardClick = (project: Project) => {
    if (hasMovedRef.current) return; // Ignore card click if mouse drag was performed
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

  const lightboxVideoInfo = activeLightboxProject
    ? parseVideoUrl(activeLightboxProject.videoUrl)
    : { type: 'none' as const };
  const lightboxPlayerStyle = activeLightboxProject
    ? getVideoPlayerStyle(activeLightboxProject.videoAspectRatio)
    : { modalMaxWidth: 'max-w-3xl', aspectClass: 'aspect-[16/9]' };

  return (
    <section
      id="work"
      className="py-20 sm:py-28 bg-[#050508] border-t border-white/5 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header with Category Filters & Slider Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
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
              <p className="text-sm sm:text-base text-zinc-400 font-normal max-w-xl">
                {sectionSubheading}
              </p>
            )}
          </div>

          {/* Action Row: Filters + Prev/Next Controls */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-end">
            {/* Category Filter Buttons */}
            {showFilters && categories.length > 1 && (
              <div className="flex items-center gap-1 p-1 bg-[#0c0c14] border border-white/10 rounded-xl overflow-x-auto max-w-full">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
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

            {/* Previous & Next Slider Controls */}
            {filteredProjects.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={scrollPrev}
                  disabled={!canScrollPrev}
                  aria-label="Previous project"
                  className="w-10 h-10 rounded-xl bg-[#0e0e18] border border-white/10 hover:border-blue-500/40 text-zinc-300 hover:text-white disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-zinc-300 transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={scrollNext}
                  disabled={!canScrollNext}
                  aria-label="Next project"
                  className="w-10 h-10 rounded-xl bg-[#0e0e18] border border-white/10 hover:border-blue-500/40 text-zinc-300 hover:text-white disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-zinc-300 transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Viewport Container (Zero page overflow, edge-peeking layout) */}
      {filteredProjects.length === 0 ? (
        <div className="max-w-md mx-auto px-6 py-12">
          <div className="rounded-2xl border border-white/10 bg-[#090910] p-8 text-center">
            <h3 className="text-base font-bold text-white mb-1">{emptyTitle}</h3>
            <p className="text-xs text-zinc-400">{emptyDesc}</p>
          </div>
        </div>
      ) : (
        <div className="relative w-full">
          {/* Scrollable Track */}
          <div
            ref={trackRef}
            tabIndex={0}
            role="region"
            aria-label="Portfolio works horizontal slider"
            onKeyDown={handleKeyDown}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={`flex items-stretch gap-5 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 px-6 sm:px-10 lg:px-16 scrollbar-none outline-none select-none ${
              isPointerDown ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {filteredProjects.map((project, idx) => {
              const thumbnailRatioClass = getThumbnailAspectClass(project.thumbnailAspectRatio);
              const videoRatio = project.videoAspectRatio || '16:9';
              const hasVideo = Boolean(project.videoUrl && project.videoUrl.trim());

              // Default is FULL COLOR everywhere! Monochrome only if specifically toggled ON
              const isProjectMonochrome = Boolean(project.monochrome ?? portfolio?.monochrome ?? false);

              return (
                <div
                  key={project.id}
                  data-slider-card
                  onClick={() => handleCardClick(project)}
                  className="snap-start shrink-0 w-[84vw] sm:w-[380px] md:w-[420px] lg:w-[460px] rounded-2xl bg-[#090910] border border-white/10 hover:border-blue-500/50 hover:shadow-[0_8px_30px_rgba(37,99,235,0.15)] transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
                >
                  {/* Media Thumbnail Container — Strictly respects selected aspect ratio */}
                  <div
                    className={`relative w-full ${thumbnailRatioClass} bg-zinc-950 overflow-hidden flex items-center justify-center`}
                  >
                    <img
                      src={project.coverImage || '/assets/portfolio/project-01/cover.jpg'}
                      alt={project.title}
                      loading="lazy"
                      draggable={false}
                      className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                        isProjectMonochrome
                          ? 'grayscale contrast-110 group-hover:grayscale-0'
                          : ''
                      }`}
                    />

                    {/* Dark gradient vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090910] via-black/25 to-transparent opacity-85 group-hover:opacity-60 transition-opacity" />

                    {/* Category & Aspect Ratio Badges */}
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 flex-wrap pointer-events-none">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase bg-[#050508]/85 backdrop-blur-md text-white border border-white/15">
                        {project.category}
                      </span>
                      {project.videoAspectRatio && project.videoAspectRatio !== '16:9' && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold uppercase bg-blue-950/85 text-blue-300 border border-blue-500/30">
                          {project.videoAspectRatio}
                        </span>
                      )}
                    </div>

                    {/* Play Video Trigger Overlay */}
                    {hasVideo && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200 backdrop-blur-sm">
                          <Play className="w-5 h-5 fill-white translate-x-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Desktop Hover Action Badge */}
                    <div className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl bg-blue-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-100 scale-90 duration-200 pointer-events-none shadow-md">
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
                      <h3 className="text-base sm:text-lg font-display font-extrabold text-white tracking-tight group-hover:text-blue-400 transition-colors mb-2 line-clamp-1">
                        {project.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal line-clamp-2">
                        {project.description}
                      </p>
                    </div>

                    {/* Card Footer Action */}
                    <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-mono text-[11px] flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-blue-400" />
                        <span>{videoRatio.toUpperCase()} FORMAT</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProjectForInquiry(project.title);
                        }}
                        className="text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors text-[11px] active:scale-95"
                      >
                        <span>{cardCta}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Interaction Bar (Progress Bar, Dot Nav, Drag/Swipe Cue) */}
          <div className="max-w-7xl mx-auto px-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Slide Dots / Counter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400">
                <span className="text-white font-bold">
                  {String(activeSlideIndex + 1).padStart(2, '0')}
                </span>{' '}
                /{' '}
                <span>{String(filteredProjects.length).padStart(2, '0')}</span>
              </span>

              <div className="hidden sm:flex items-center gap-1.5 ml-3">
                {filteredProjects.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToIndex(i)}
                    aria-label={`Jump to slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      activeSlideIndex === i
                        ? 'w-6 bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]'
                        : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Tactile Progress Indicator Bar */}
            <div className="w-full sm:w-64 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-150 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]"
                style={{
                  width: `${Math.max(15, scrollProgress)}%`,
                }}
              />
            </div>

            {/* Interactive hint */}
            <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
              <GripHorizontal className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Drag or use arrow keys to navigate</span>
              <span className="sm:hidden">Swipe to explore</span>
            </div>
          </div>
        </div>
      )}

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

              {/* Video Player Container */}
              <div
                className={`relative ${lightboxPlayerStyle.aspectClass} w-full rounded-xl overflow-hidden bg-black mb-4 border border-white/10 flex items-center justify-center shadow-inner`}
              >
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
                  <span className="text-white font-semibold">
                    {activeLightboxProject.client || 'Creative Showcase'}
                  </span>
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
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
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
