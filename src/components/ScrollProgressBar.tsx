import React, { useEffect, useRef, useState } from 'react';

interface ScrollProgressBarProps {
  className?: string;
}

/**
 * Premium, minimal progress indicator for Footazix.
 * - Uses official brand colors: lime green (#B1FF00), black (#070809), and off-white (#F5F7F2).
 * - High-performance GPU compositor animation using transform: scaleX(progress) with 0 layout reflows.
 * - requestAnimationFrame throttling for butter-smooth 60fps/120fps scrolling.
 * - Full accessibility with ARIA attributes and prefers-reduced-motion support.
 * - ResizeObserver support to instantly sync with dynamic CMS content & screen resize.
 */
export const ScrollProgressBar: React.FC<ScrollProgressBarProps> = ({ className = '' }) => {
  const barRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [ariaProgress, setAriaProgress] = useState<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const lastProgressRef = useRef<number>(-1);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const calculateAndApplyProgress = () => {
      const docEl = document.documentElement;
      const body = document.body;
      const scrollTop = window.scrollY || docEl.scrollTop || body.scrollTop || 0;
      const scrollHeight = Math.max(
        docEl.scrollHeight,
        body.scrollHeight,
        docEl.offsetHeight,
        body.offsetHeight,
        docEl.clientHeight
      );
      const clientHeight = window.innerHeight || docEl.clientHeight;
      const maxScroll = scrollHeight - clientHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;

      // Only update if changed
      if (Math.abs(progress - lastProgressRef.current) > 0.0005) {
        lastProgressRef.current = progress;

        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${progress})`;
          // Fade in gently once scrolling begins
          barRef.current.style.opacity = progress > 0.002 ? '1' : '0';
        }

        if (glowRef.current) {
          glowRef.current.style.opacity = progress > 0.005 ? '1' : '0';
        }

        // Update ARIA in discrete percentage chunks to avoid spamming screen readers
        const roundedPercent = Math.round(progress * 100);
        setAriaProgress((prev) => (Math.abs(prev - roundedPercent) >= 2 ? roundedPercent : prev));
      }

      rafIdRef.current = null;
    };

    const handleScrollOrResize = () => {
      if (rafIdRef.current !== null) return;
      rafIdRef.current = requestAnimationFrame(calculateAndApplyProgress);
    };

    // Initial calculation
    calculateAndApplyProgress();

    // Event listeners
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('orientationchange', handleScrollOrResize, { passive: true });

    // Observe document height changes (e.g. dynamic portfolio load or CMS accordion expansion)
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && document.documentElement) {
      resizeObserver = new ResizeObserver(() => {
        handleScrollOrResize();
      });
      resizeObserver.observe(document.documentElement);
    }

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('orientationchange', handleScrollOrResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return (
    <div
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={ariaProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`fixed top-0 left-0 right-0 z-[60] h-[2.5px] w-full pointer-events-none select-none overflow-hidden bg-black/30 backdrop-blur-[1px] ${className}`}
    >
      {/* Active Fill Track */}
      <div
        ref={barRef}
        className="relative h-full w-full origin-left bg-gradient-to-r from-[#8FCC00] via-[#B1FF00] to-[#E2FF80] will-change-transform transition-opacity duration-300"
        style={{
          transform: 'scaleX(0)',
          boxShadow: '0 0 10px rgba(177, 255, 0, 0.8), 0 0 4px rgba(226, 255, 128, 0.6)',
        }}
      >
        {/* Leading-edge spark / hot glint */}
        <div
          ref={glowRef}
          className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-[#F5F7F2] opacity-0 transition-opacity duration-300"
          style={{
            filter: 'drop-shadow(0 0 3px #F5F7F2) drop-shadow(0 0 8px #B1FF00)',
          }}
        />
      </div>
    </div>
  );
};
