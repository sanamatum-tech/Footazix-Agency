import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MediaAsset, MediaCategory } from '../../types';
import { mediaService, verifyMediaUrl } from '../../services/mediaService';
import {
  Images,
  Upload,
  Copy,
  Check,
  Trash2,
  Eye,
  LayoutGrid,
  List,
  Search,
  FileText,
  Video,
  Loader2,
  X,
  ExternalLink,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  PlaySquare,
  Sparkles,
} from 'lucide-react';

const CATEGORIES: Array<'all' | MediaCategory> = ['all', 'images', 'videos', 'posters', 'logos'];

export const AdminMediaLibrary: React.FC = () => {
  const { media, content, updateWebsiteContent } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<'all' | MediaCategory>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<MediaCategory>('images');
  const [statusMessage, setStatusMessage] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [previewMonochrome, setPreviewMonochrome] = useState<boolean>(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Video preview player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoPlaybackError, setVideoPlaybackError] = useState<string | null>(null);
  const [isVerifyingUrl, setIsVerifyingUrl] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    accessible: boolean;
    status: number;
    contentType?: string;
    contentLength?: string;
    error?: string;
  } | null>(null);

  const previewVideoRef = useRef<HTMLVideoElement>(null);

  const isAssetVideo = (asset: MediaAsset) => {
    return (
      asset.category === 'videos' ||
      asset.type === 'video' ||
      Boolean(asset.name?.match(/\.(mp4|webm|ogg|mov|m4v)$/i)) ||
      Boolean(asset.url?.match(/\.(mp4|webm|ogg|mov|m4v)/i))
    );
  };

  const filteredMedia = media.filter((m) => {
    const isVid = isAssetVideo(m);
    const matchesCat =
      selectedCategory === 'all' ||
      (selectedCategory === 'videos' && isVid) ||
      m.category === selectedCategory;

    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMessage('Uploading asset to Supabase Storage...');
    try {
      const isVideoFile =
        uploadCategory === 'videos' ||
        file.type.startsWith('video/') ||
        Boolean(file.name.match(/\.(mp4|webm|ogg|mov|m4v)$/i));

      const uploaded = await mediaService.uploadMedia(
        file,
        isVideoFile ? 'videos' : uploadCategory
      );

      setStatusMessage(`Asset "${uploaded.name}" uploaded to Supabase Storage.`);
      // Open preview right away so user can test and verify it
      handleOpenPreview(uploaded);
    } catch (err: any) {
      setStatusMessage(`Upload failed: ${err?.message || 'Please check file and try again.'}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
      setTimeout(() => setStatusMessage(''), 4500);
    }
  };

  const handleOpenPreview = async (asset: MediaAsset) => {
    setPreviewAsset(asset);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setVideoPlaybackError(null);
    setVerificationResult(null);

    // If it's a video, test accessibility
    if (isAssetVideo(asset)) {
      setIsVerifyingUrl(true);
      try {
        const res = await verifyMediaUrl(asset.url);
        setVerificationResult(res);
      } catch (err: any) {
        setVerificationResult({
          accessible: false,
          status: 0,
          error: err?.message || 'Verification failed',
        });
      } finally {
        setIsVerifyingUrl(false);
      }
    }
  };

  const handleClosePreview = () => {
    if (previewVideoRef.current) {
      previewVideoRef.current.pause();
    }
    setPreviewAsset(null);
    setIsPlaying(false);
    setVideoPlaybackError(null);
    setVerificationResult(null);
  };

  const handlePlayToggle = () => {
    if (!previewVideoRef.current) return;
    if (isPlaying) {
      previewVideoRef.current.pause();
      setIsPlaying(false);
    } else {
      previewVideoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          setVideoPlaybackError(err?.message || 'Video playback failed');
          setIsPlaying(false);
        });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (previewVideoRef.current) {
      previewVideoRef.current.currentTime = time;
    }
  };

  const confirmDelete = async (id: string) => {
    await mediaService.deleteMedia(id);
    setIsDeletingId(null);
    if (previewAsset?.id === id) {
      handleClosePreview();
    }
    setStatusMessage('Asset removed.');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  };

  const handleAssignToVSL = async (asset: MediaAsset) => {
    try {
      setStatusMessage('Assigning video to Founder VSL...');
      await updateWebsiteContent({
        vsl: {
          ...content.vsl,
          videoSource: 'direct',
          videoUrl: asset.url,
        },
      });
      setStatusMessage(`Assigned "${asset.name}" as Founder VSL video!`);
      setTimeout(() => setStatusMessage(''), 3500);
    } catch (err: any) {
      setStatusMessage(`Failed to update VSL: ${err?.message || 'Error'}`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#090910] border border-white/10">
        <div>
          <h2 className="text-base sm:text-lg font-display font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Media Library & Verification</span>
            <span className="text-xs font-mono font-normal text-zinc-400">
              ({filteredMedia.length} items)
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real Supabase Storage assets with live playable video preview, duration verification, and instant VSL assignment.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {statusMessage && (
            <span className="text-xs text-blue-400 font-medium animate-in fade-in flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{statusMessage}</span>
            </span>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#12121c] border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Upload Drop Area */}
      <div className="p-6 rounded-2xl bg-[#090910] border border-dashed border-white/15 hover:border-blue-500/40 transition-colors">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Upload Creative Assets to Supabase Storage</span>
              <span className="text-xs text-zinc-400">MP4, WebM, QuickTime video · PNG, JPG, WebP image · WebVTT captions</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value as MediaCategory)}
              className="px-3 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="videos">Upload to: Videos (MP4)</option>
              <option value="images">Upload to: Images</option>
              <option value="posters">Upload to: Posters</option>
              <option value="logos">Upload to: Logos</option>
            </select>

            <label className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-[0_0_16px_rgba(37,99,235,0.3)] cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap">
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>UPLOADING TO STORAGE...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>CHOOSE FILE</span>
                </>
              )}
              <input
                type="file"
                accept={
                  uploadCategory === 'videos'
                    ? 'video/mp4,video/webm,video/quicktime,video/*'
                    : 'image/*,video/*,.vtt'
                }
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-[#12121c] text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                {cat === 'videos' ? 'Videos (Playable)' : cat}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search filenames..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Media Grid or List */}
      {filteredMedia.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#090910] border border-white/10">
          <p className="text-xs text-zinc-400">No media assets found matching the selected filter.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredMedia.map((asset) => {
            const isVid = isAssetVideo(asset);
            return (
              <div
                key={asset.id}
                onClick={() => handleOpenPreview(asset)}
                className="group relative rounded-xl overflow-hidden bg-[#090910] border border-white/10 hover:border-blue-500/50 transition-all flex flex-col justify-between cursor-pointer hover:shadow-lg hover:shadow-blue-500/5"
              >
                {/* Media Preview Box */}
                <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden flex items-center justify-center">
                  {isVid ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-950/30 to-black text-blue-400 p-2 relative">
                      <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 mt-1 uppercase font-bold tracking-wider">
                        Playable Video
                      </span>

                      {/* Video duration badge */}
                      {asset.duration && (
                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/80 text-white border border-white/10">
                          {asset.duration}
                        </span>
                      )}
                    </div>
                  ) : (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {/* Hover Overlay with Preview Video button */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPreview(asset);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md cursor-pointer"
                    >
                      {isVid ? <Play className="w-3 h-3 fill-current" /> : <Eye className="w-3 h-3" />}
                      <span>{isVid ? 'Preview Video' : 'View'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUrl(asset.url);
                      }}
                      className="p-1.5 rounded-lg bg-black/80 text-white hover:bg-black cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedUrl === asset.url ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Info Card Bar */}
                <div className="p-2.5 space-y-1">
                  <span className="text-[11px] font-semibold text-white truncate block" title={asset.name}>
                    {asset.name}
                  </span>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                    <span>{asset.size}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDeletingId(asset.id);
                      }}
                      className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl bg-[#090910] border border-white/10 overflow-hidden divide-y divide-white/5">
          {filteredMedia.map((asset) => {
            const isVid = isAssetVideo(asset);
            return (
              <div
                key={asset.id}
                className="p-3.5 hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    onClick={() => handleOpenPreview(asset)}
                    className="w-14 h-11 rounded-lg overflow-hidden bg-zinc-900 shrink-0 border border-white/10 flex items-center justify-center cursor-pointer hover:border-blue-500"
                  >
                    {isVid ? (
                      <div className="w-full h-full flex items-center justify-center text-blue-400 bg-blue-950/20">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    ) : (
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">{asset.name}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {asset.category} · {asset.size} {asset.duration ? `· ${asset.duration}` : ''} · {asset.uploadedAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenPreview(asset)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isVid ? <Play className="w-3 h-3 fill-current" /> : <Eye className="w-3 h-3" />}
                    <span>{isVid ? 'Preview Video' : 'Preview'}</span>
                  </button>

                  {isVid && (
                    <button
                      type="button"
                      onClick={() => handleAssignToVSL(asset)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-400 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 cursor-pointer hidden md:inline-flex items-center gap-1"
                      title="Set as Founder VSL Video"
                    >
                      <PlaySquare className="w-3 h-3" />
                      <span>Set as VSL</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCopyUrl(asset.url)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 bg-[#12121c] hover:text-white border border-white/10 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedUrl === asset.url ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDeletingId(asset.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 bg-[#12121c] border border-white/10 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Working Video / Media Preview Modal */}
      {previewAsset && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={handleClosePreview}
        >
          <div
            className="w-full max-w-3xl bg-[#0b0b14] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="min-w-0 pr-4">
                <h3 className="text-sm font-bold text-white truncate flex items-center gap-2">
                  <span>{previewAsset.name}</span>
                  {isAssetVideo(previewAsset) && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-600/20 text-blue-300 border border-blue-500/30">
                      PLAYABLE MP4
                    </span>
                  )}
                </h3>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {previewAsset.category} · {previewAsset.size}
                  {duration > 0 && ` · Duration: ${Math.round(duration)}s`}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isAssetVideo(previewAsset) && (
                  <button
                    type="button"
                    onClick={() => setPreviewMonochrome(!previewMonochrome)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase cursor-pointer transition-colors ${
                      previewMonochrome
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-zinc-800 text-zinc-300 hover:text-white border border-white/10'
                    }`}
                  >
                    {previewMonochrome ? 'Mono: ON' : 'Mono: OFF (Full Color)'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleClosePreview}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-[#12121c] cursor-pointer"
                  title="Close Preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Player or Image Viewer */}
            <div className="rounded-xl overflow-hidden bg-black flex flex-col items-center justify-center max-h-[60vh] relative border border-white/10">
              {isAssetVideo(previewAsset) ? (
                <div className="w-full relative aspect-video flex items-center justify-center bg-black">
                  <video
                    ref={previewVideoRef}
                    src={previewAsset.url}
                    preload="metadata"
                    playsInline
                    muted={isMuted}
                    onLoadedMetadata={(e) => {
                      setDuration(e.currentTarget.duration || 0);
                      setVideoPlaybackError(null);
                    }}
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    onEnded={() => setIsPlaying(false)}
                    onError={() => {
                      setVideoPlaybackError(
                        'Failed to load or decode video from Supabase Storage URL. Please verify CORS and format.'
                      );
                      setIsPlaying(false);
                    }}
                    className="w-full h-full object-contain"
                  />

                  {videoPlaybackError && (
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-10">
                      <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                      <span className="text-sm font-bold text-red-300">Video Playback Failed</span>
                      <p className="text-xs text-zinc-400 max-w-md mt-1">{videoPlaybackError}</p>
                    </div>
                  )}

                  {/* Playable Video Controls Overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2 z-20">
                    {/* Scrubber */}
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      step="0.1"
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:h-1.5 transition-all"
                    />

                    <div className="flex items-center justify-between text-xs text-zinc-300">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handlePlayToggle}
                          className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (previewVideoRef.current) {
                              previewVideoRef.current.muted = !isMuted;
                            }
                            setIsMuted(!isMuted);
                          }}
                          className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>

                        <span className="font-mono text-[11px] text-zinc-400">
                          {Math.floor(currentTime)}s / {Math.floor(duration)}s
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isVerifyingUrl ? (
                          <span className="text-[10px] font-mono text-blue-400 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Checking URL...</span>
                          </span>
                        ) : verificationResult?.accessible ? (
                          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Storage Object Verified (200 OK)</span>
                          </span>
                        ) : verificationResult ? (
                          <span className="text-[10px] font-mono text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{verificationResult.error || 'Unavailable'}</span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={previewAsset.url}
                  alt={previewAsset.name}
                  className={`max-w-full max-h-[50vh] object-contain transition-all duration-300 ${
                    previewMonochrome ? 'grayscale contrast-110' : ''
                  }`}
                />
              )}
            </div>

            {/* Storage URL, Verification & Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  readOnly
                  value={previewAsset.url}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#12121c] border border-white/10 text-xs font-mono text-zinc-300 outline-none"
                />

                <a
                  href={previewAsset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 bg-[#12121c] hover:text-white border border-white/10 flex items-center gap-1.5 cursor-pointer shrink-0"
                  title="Test in a new tab / other device"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <span>Test URL</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopyUrl(previewAsset.url)}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedUrl === previewAsset.url ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl === previewAsset.url ? 'Copied' : 'Copy URL'}</span>
                </button>
              </div>

              {/* Quick Actions for Videos */}
              {isAssetVideo(previewAsset) && (
                <div className="p-3 rounded-xl bg-[#12121c] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-white block">Use in Founder VSL</span>
                    <span className="text-[11px] text-zinc-400">
                      Assigns this video directly to the Founder VSL system on the public website.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAssignToVSL(previewAsset)}
                    className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-lg shadow-emerald-600/20"
                  >
                    <PlaySquare className="w-3.5 h-3.5" />
                    <span>Set as Founder VSL Video</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeletingId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="w-full max-w-md bg-[#0b0b14] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Delete Media Asset?</h3>
            <p className="text-xs text-zinc-400">
              Are you sure you want to remove this asset? Any portfolio project or VSL using this URL will need updating.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeletingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#12121c] border border-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(isDeletingId)}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-500 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
