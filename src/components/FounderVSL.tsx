import React, { useState, useRef, useEffect } from 'react';
import { SITE_CONFIG } from '../config/siteContent';

export const FounderVSL: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(72);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasActualVideo, setHasActualVideo] = useState(false);
  const [activeCaption, setActiveCaption] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const simulationTimerRef = useRef<number | null>(null);

  // Check if real video file is accessible
  useEffect(() => {
    fetch(SITE_CONFIG.vsl.videoSrc, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          setHasActualVideo(true);
        } else {
          setHasActualVideo(false);
        }
      })
      .catch(() => setHasActualVideo(false));
  }, []);

  // Update caption text based on current time
  useEffect(() => {
    const matched = SITE_CONFIG.vsl.captions.find(
      (c) => currentTime >= c.start && currentTime <= c.end
    );
    setActiveCaption(matched ? matched.text : '');
  }, [currentTime]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (hasActualVideo && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    } else {
      if (isPlaying) {
        if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        const startTime = Date.now() - currentTime * 1000;
        simulationTimerRef.current = window.setInterval(() => {
          const elapsed = (Date.now() - startTime) / 1000;
          if (elapsed >= duration) {
            setCurrentTime(0);
            setIsPlaying(false);
            if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
          } else {
            setCurrentTime(elapsed);
          }
        }, 100);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (hasActualVideo && videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    return () => {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    };
  }, []);

  return (
    <section id="vsl" className="relative py-20 bg-[#08080d] border-t border-b border-white/5">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>{SITE_CONFIG.vsl.label}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight mb-3">
            {SITE_CONFIG.vsl.heading}
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            "{SITE_CONFIG.vsl.description}"
          </p>
        </div>

        {/* Video Player Frame */}
        <div
          ref={containerRef}
          className={`relative rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl transition-all duration-300 group ${
            isFullscreen ? 'w-full h-full rounded-none' : 'aspect-video w-full'
          }`}
        >
          {/* HTML5 Video */}
          {hasActualVideo ? (
            <video
              ref={videoRef}
              src={SITE_CONFIG.vsl.videoSrc}
              poster={SITE_CONFIG.vsl.posterSrc}
              playsInline
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                  setDuration(videoRef.current.duration || 72);
                }
              }}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-full object-cover"
            />
          ) : (
            /* Cinematic Poster */
            <div className="relative w-full h-full bg-zinc-950 flex items-center justify-center">
              <img
                src={SITE_CONFIG.vsl.posterSrc}
                alt="Footazix Founder Presentation"
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  isPlaying ? 'opacity-35 brightness-75' : 'opacity-85'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              {/* In-Video Audio Visualizer when playing in preview */}
              {isPlaying && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
                  <div className="flex items-center gap-1.5 mb-4">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-xs font-medium tracking-wider text-zinc-300 uppercase">
                      FOOTAZIX FOUNDER OVERVIEW
                    </span>
                  </div>

                  <div className="flex items-end justify-center gap-1.5 h-10 w-44">
                    {[40, 65, 85, 30, 95, 75, 45, 90, 60, 80, 50, 70, 95, 40].map((h, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-blue-500 rounded-full transition-all duration-150"
                        style={{
                          height: `${Math.max(15, (h * (1 + Math.sin(currentTime * 5 + i))) / 2)}%`,
                          opacity: 0.85,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subtitles Overlay */}
          {showCaptions && activeCaption && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 max-w-xl w-[90%] px-4 py-2 bg-black/85 backdrop-blur-md rounded-lg border border-white/10 text-center pointer-events-none z-20">
              <p className="text-xs sm:text-sm font-medium text-white tracking-wide">
                {activeCaption}
              </p>
            </div>
          )}

          {/* Center Play Button */}
          {!isPlaying && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <button
                onClick={togglePlay}
                aria-label="Play Founder Video"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center pl-1 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 glow-blue-lg cursor-pointer"
              >
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          )}

          {/* Controls Bar */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent z-30 transition-opacity duration-200 ${
              isPlaying ? 'opacity-90 hover:opacity-100 group-hover:opacity-100' : 'opacity-100'
            }`}
          >
            {/* Scrubber */}
            <div className="flex items-center gap-3 mb-2">
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                aria-label="Video scrubber"
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between text-xs text-zinc-300 font-medium">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="hover:text-white transition-colors cursor-pointer"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                <span>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* CC Toggle */}
                <button
                  onClick={() => setShowCaptions(!showCaptions)}
                  className={`px-1.5 py-0.5 rounded border text-[11px] font-bold transition-colors cursor-pointer ${
                    showCaptions ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-zinc-700 text-zinc-500'
                  }`}
                  aria-label="Toggle Captions"
                >
                  CC
                </button>

                {/* Mute */}
                <button
                  onClick={toggleMute}
                  className="hover:text-white transition-colors cursor-pointer"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="hover:text-white transition-colors cursor-pointer"
                  aria-label="Toggle Fullscreen"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
