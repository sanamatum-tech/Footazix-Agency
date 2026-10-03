import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle, ArrowRight } from 'lucide-react';

export const FounderVSL: React.FC = () => {
  const { content } = useApp();
  const vsl = content.vsl;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const showBadge = vsl.showBadge !== false && Boolean(vsl.label);
  const showHeading = vsl.showHeading !== false && Boolean(vsl.heading);
  const showDescription = vsl.showDescription !== false && Boolean(vsl.description);

  // Helper to parse YouTube embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      if (!url) return '';
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      const videoId = match && match[2].length === 11 ? match[2] : null;
      if (videoId) {
        return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
      }
      return url;
    } catch {
      return url;
    }
  };

  // Helper to parse Google Drive preview URL
  const getGoogleDriveEmbedUrl = (url: string) => {
    try {
      if (!url) return '';
      if (url.includes('/preview')) return url;
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const hasCaptionsConfigured = Boolean(vsl.captionUrl && vsl.captionUrl.trim().length > 0);

  const handlePlayToggle = () => {
    if (!videoRef.current) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setVideoError(true);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && !isNaN(videoRef.current.duration)) {
      setDuration(videoRef.current.duration);
      setVideoError(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
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
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <section id="system" className="py-20 sm:py-28 bg-[#050508] relative font-sans">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          {showBadge && (
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
              <span className="font-mono text-[11px]">{vsl.label || 'THE FOOTAZIX SYSTEM'}</span>
            </div>
          )}

          {showHeading && (
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight mb-3">
              {vsl.heading || 'SEE HOW FOOTAZIX TRANSFORMS CONTENT.'}
            </h2>
          )}

          {showDescription && (
            <p className="text-sm sm:text-base text-zinc-400 font-normal max-w-xl mx-auto leading-relaxed">
              {vsl.description || 'See how we transform raw footage into content built for attention.'}
            </p>
          )}
        </div>

        {/* Video Player Container */}
        <div
          ref={containerRef}
          className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl group"
        >
          {/* 1. YouTube Source */}
          {vsl.videoSource === 'youtube' && vsl.videoUrl ? (
            isPlaying ? (
              <iframe
                src={getYouTubeEmbedUrl(vsl.videoUrl)}
                title={vsl.heading}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div
                onClick={() => setIsPlaying(true)}
                className="relative w-full h-full cursor-pointer group"
              >
                <img
                  src={vsl.posterUrl || '/assets/vsl/vsl-poster.jpg'}
                  alt={vsl.heading}
                  className="w-full h-full object-cover grayscale contrast-110 group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600/90 text-white flex items-center justify-center pl-1 glow-blue-sm group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
                  </div>
                </div>
              </div>
            )
          ) : null}

          {/* 2. Google Drive Source */}
          {vsl.videoSource === 'drive' && vsl.videoUrl ? (
            isPlaying ? (
              <iframe
                src={getGoogleDriveEmbedUrl(vsl.videoUrl)}
                title={vsl.heading}
                className="w-full h-full border-0"
                allow="autoplay"
                allowFullScreen
              />
            ) : (
              <div
                onClick={() => setIsPlaying(true)}
                className="relative w-full h-full cursor-pointer group"
              >
                <img
                  src={vsl.posterUrl || '/assets/vsl/vsl-poster.jpg'}
                  alt={vsl.heading}
                  className="w-full h-full object-cover grayscale contrast-110 group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600/90 text-white flex items-center justify-center pl-1 glow-blue-sm group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
                  </div>
                </div>
              </div>
            )
          ) : null}

          {/* 3. Direct Upload or Local Video Source */}
          {(vsl.videoSource === 'direct' || vsl.videoSource === 'local') && (
            <>
              <video
                ref={videoRef}
                src={vsl.videoUrl || '/assets/vsl/footazix-vsl.mp4'}
                poster={vsl.posterUrl || '/assets/vsl/vsl-poster.jpg'}
                className="w-full h-full object-cover"
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onError={() => setVideoError(true)}
                onClick={handlePlayToggle}
              >
                {hasCaptionsConfigured && showCaptions && (
                  <track
                    kind="subtitles"
                    src={vsl.captionUrl}
                    srcLang="en"
                    label="English"
                    default
                  />
                )}
              </video>

              {/* Poster Play Overlay if not playing */}
              {!isPlaying && (
                <div
                  onClick={handlePlayToggle}
                  className="absolute inset-0 bg-black/45 hover:bg-black/30 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600 text-white flex items-center justify-center pl-1 glow-blue-sm hover:scale-110 active:scale-95 transition-transform duration-200">
                    <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
                  </div>
                </div>
              )}

              {/* Custom Dark Glass Controls Bar */}
              <div
                className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 ${
                  isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                }`}
              >
                {/* Timeline Scrubber */}
                <div className="relative mb-3">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.1"
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:h-1.5 transition-all"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePlayToggle}
                      className="p-1 hover:text-white transition-colors cursor-pointer"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white fill-white" />
                      )}
                    </button>

                    <button
                      onClick={toggleMute}
                      className="p-1 hover:text-white transition-colors cursor-pointer"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5 text-zinc-400 hover:text-white" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-zinc-300 hover:text-white" />
                      )}
                    </button>

                    <span className="font-mono text-[11px] text-zinc-400">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {hasCaptionsConfigured && (
                      <button
                        onClick={() => setShowCaptions(!showCaptions)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer border ${
                          showCaptions
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-zinc-900 text-zinc-400 border-white/10 hover:text-white'
                        }`}
                        title="Toggle Captions"
                      >
                        CC
                      </button>
                    )}

                    <button
                      onClick={toggleFullscreen}
                      className="p-1 hover:text-white transition-colors cursor-pointer"
                      aria-label="Toggle Fullscreen"
                    >
                      <Maximize className="w-4 h-4 text-zinc-300 hover:text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Missing/Failed Video Notice */}
          {videoError && (
            <div className="absolute inset-0 bg-[#07070d] flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
              <p className="text-xs sm:text-sm font-display font-bold text-white tracking-widest uppercase mb-1">
                {vsl.fallbackMessage || 'VIDEO UNAVAILABLE'}
              </p>
              <p className="text-xs text-zinc-400 max-w-sm">
                The Footazix system reel is currently being updated.
              </p>
            </div>
          )}
        </div>

        {/* Optional Section CTA */}
        {vsl.showCta && vsl.ctaText && (
          <div className="text-center mt-8">
            <button
              onClick={() => {
                const el = document.getElementById('work');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <span>{vsl.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
