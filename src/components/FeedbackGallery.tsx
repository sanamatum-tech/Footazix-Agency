import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { FeedbackGalleryItem, AspectRatioType } from '../types';
import { X, ZoomIn } from 'lucide-react';

interface FeedbackGalleryProps {
  className?: string;
}

export const FeedbackGallery: React.FC<FeedbackGalleryProps> = ({ className = '' }) => {
  const { content } = useApp();
  const feedbackSettings = content.feedbackGallery;
  const isEnabled = feedbackSettings?.enabled !== false && content.sectionVisibility?.feedbackGallery !== false;

  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastOffsetRef = useRef<number>(0);
  const isPointerDownRef = useRef<boolean>(false);
  const hasMovedSignificantlyRef = useRef<boolean>(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  // Filter visible items
  const visibleItems = useMemo(() => {
    if (!feedbackSettings?.items || !Array.isArray(feedbackSettings.items)) return [];
    return feedbackSettings.items.filter((item) => item.published !== false && item.visible !== false);
  }, [feedbackSettings?.items]);

  // If section is disabled or has no visible items, render nothing
  if (!isEnabled || visibleItems.length === 0) {
    return null;
  }

  const globalRatio: AspectRatioType = feedbackSettings?.aspectRatio || '1:1';
  const autoScroll = feedbackSettings?.autoScroll !== false;
  const scrollSpeed = feedbackSettings?.scrollSpeed || 28; // seconds
  const direction = feedbackSettings?.direction || 'left';
  const pauseOnHover = feedbackSettings?.pauseOnHover !== false;
  const cardGap = feedbackSettings?.cardGap ?? 20;
  const cardRadius = feedbackSettings?.cardRadius ?? 16;

  // Clone items so marquee is continuous and seamless
  const repeatedItems = useMemo(() => {
    if (visibleItems.length === 0) return [];
    // Ensure at least 8-12 cards so it fills any large ultrawide screen
    const repeatCount = Math.max(2, Math.ceil(12 / visibleItems.length));
    const list: (FeedbackGalleryItem & { uniqueKey: string })[] = [];
    for (let r = 0; r < repeatCount; r++) {
      visibleItems.forEach((item, idx) => {
        list.push({
          ...item,
          uniqueKey: `${item.id}-rep-${r}-${idx}`,
        });
      });
    }
    return list;
  }, [visibleItems]);

  const getRatioConfig = (ratio: AspectRatioType) => {
    switch (ratio) {
      case '1:1':
        return {
          wrapper: 'w-[260px] sm:w-[320px] md:w-[360px] aspect-square',
          imgClass: 'object-cover w-full h-full',
        };
      case '4:5':
        return {
          wrapper: 'w-[240px] sm:w-[280px] md:w-[320px] aspect-[4/5]',
          imgClass: 'object-cover w-full h-full',
        };
      case '3:4':
        return {
          wrapper: 'w-[250px] sm:w-[290px] md:w-[330px] aspect-[3/4]',
          imgClass: 'object-cover w-full h-full',
        };
      case '9:16':
        return {
          wrapper: 'w-[190px] sm:w-[230px] md:w-[260px] aspect-[9/16]',
          imgClass: 'object-cover w-full h-full',
        };
      case '4:3':
        return {
          wrapper: 'w-[300px] sm:w-[360px] md:w-[420px] aspect-[4/3]',
          imgClass: 'object-cover w-full h-full',
        };
      case '16:9':
        return {
          wrapper: 'w-[320px] sm:w-[420px] md:w-[480px] aspect-video',
          imgClass: 'object-cover w-full h-full',
        };
      case 'auto':
      case 'original':
      default:
        return {
          wrapper: 'h-[280px] sm:h-[340px] md:h-[380px] w-auto max-w-[460px] aspect-auto shrink-0',
          imgClass: 'object-contain h-full w-auto',
        };
    }
  };

  const ratioConfig = getRatioConfig(globalRatio);

  // Manual horizontal drag handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary mouse button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    isPointerDownRef.current = true;
    hasMovedSignificantlyRef.current = false;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    lastOffsetRef.current = dragOffset;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Non-blocking
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;

    const deltaX = e.clientX - pointerStartRef.current.x;
    const deltaY = e.clientY - pointerStartRef.current.y;

    // Distinguish intentional horizontal drag from vertical page scroll
    if (!hasMovedSignificantlyRef.current) {
      if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
        hasMovedSignificantlyRef.current = true;
        setIsDragging(true);
      } else if (Math.abs(deltaY) > 10) {
        // Vertical gesture wins - cancel drag so page scrolls smoothly
        isPointerDownRef.current = false;
        setIsDragging(false);
        return;
      }
    }

    if (hasMovedSignificantlyRef.current) {
      setDragOffset(lastOffsetRef.current + deltaX);
    }
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPointerDownRef.current) {
      isPointerDownRef.current = false;
      setTimeout(() => {
        setIsDragging(false);
      }, 50);

      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Non-blocking
      }
    }
  };

  const handleCardClick = (imageUrl: string) => {
    // Prevent opening modal if user was dragging
    if (hasMovedSignificantlyRef.current) return;
    setActiveModalImage(imageUrl);
  };

  // Determine animation style
  const animationDuration = `${scrollSpeed}s`;
  const animationDirection = direction === 'right' ? 'marquee-scroll-right' : 'marquee-scroll-left';

  return (
    <section
      id="feedback"
      aria-label="Client Feedback & Testimonials"
      className={`relative py-16 sm:py-24 bg-[#070809] overflow-hidden select-none ${className}`}
    >
      {/* Subtle background ambient glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
        <div className="w-[600px] h-[300px] bg-[#B1FF00]/5 blur-[120px] rounded-full" />
      </div>

      {/* Edge gradient fades for seamless appearance */}
      <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#070809] via-[#070809]/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#070809] via-[#070809]/80 to-transparent z-10 pointer-events-none" />

      {/* Carousel Track Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrCancel}
        onPointerCancel={handlePointerUpOrCancel}
        className={`relative w-full overflow-hidden cursor-grab active:cursor-grabbing ${
          pauseOnHover ? 'group/carousel' : ''
        }`}
        style={{ touchAction: 'pan-y' }}
      >
        <div
          ref={trackRef}
          className={`flex items-center w-max ${
            autoScroll && !isReducedMotion && !isDragging
              ? 'animate-marquee'
              : ''
          } ${pauseOnHover ? 'group-hover/carousel:[animation-play-state:paused]' : ''}`}
          style={{
            gap: `${cardGap}px`,
            animationName: animationDirection,
            animationDuration: animationDuration,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            transform: isDragging || dragOffset !== 0 ? `translate3d(${dragOffset}px, 0, 0)` : undefined,
          }}
        >
          {repeatedItems.map((item) => (
            <div
              key={item.uniqueKey}
              onClick={() => handleCardClick(item.imageUrl)}
              className={`relative shrink-0 overflow-hidden bg-[#0D0F10] border border-[#292E25] hover:border-[#B1FF00]/70 transition-all duration-300 shadow-xl group/card cursor-pointer ${ratioConfig.wrapper}`}
              style={{ borderRadius: `${cardRadius}px` }}
            >
              {/* Image only - strictly NO captions, names, descriptions or text overlays */}
              <img
                src={item.imageUrl}
                alt={item.altText || 'Client Feedback Screenshot'}
                loading="lazy"
                decoding="async"
                className={`${ratioConfig.imgClass} transition-transform duration-500 group-hover/card:scale-[1.02]`}
              />

              {/* Subtle hover zoom icon indicator (non-intrusive) */}
              <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 border border-white/10 text-white/70 opacity-0 group-hover/card:opacity-100 transition-opacity backdrop-blur-sm pointer-events-none">
                <ZoomIn className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal for Inspection */}
      {activeModalImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveModalImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center rounded-2xl overflow-hidden bg-[#070809] border border-white/10 shadow-2xl"
          >
            <button
              onClick={() => setActiveModalImage(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/80 hover:bg-black text-[#A7AEA0] hover:text-[#B1FF00] border border-white/10 transition-colors cursor-pointer"
              aria-label="Close feedback preview"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeModalImage}
              alt="Client Feedback High Resolution"
              className="max-h-[85vh] w-auto max-w-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Inline styles for keyframe marquee animations to guarantee 0 layout shifts and no external CSS dependency */}
      <style>{`
        @keyframes marquee-scroll-left {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        @keyframes marquee-scroll-right {
          0% {
            transform: translate3d(-50%, 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
        .animate-marquee {
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </section>
  );
};
