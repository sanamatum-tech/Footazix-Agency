import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { VSLSettings, VideoSourceType, MediaAsset } from '../../types';
import { mediaService, verifyMediaUrl } from '../../services/mediaService';
import {
  PlaySquare,
  Upload,
  Link as LinkIcon,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  FileText,
  Loader2,
  AlertCircle,
  Video,
  Play,
  Pause,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  FolderOpen,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const AdminVSLEditor: React.FC = () => {
  const { content, updateWebsiteContent, saveStatus, media } = useApp();
  const [vslData, setVslData] = useState<VSLSettings>(content.vsl);
  const [statusMessage, setStatusMessage] = useState('');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Video verification & playback state inside editor
  const [verificationState, setVerificationState] = useState<{
    status: 'idle' | 'testing' | 'verified' | 'error';
    message?: string;
    details?: { status?: number; contentType?: string; size?: string };
  }>({ status: 'idle' });
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewMuted, setPreviewMuted] = useState(true);
  const [previewDuration, setPreviewDuration] = useState(0);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const [previewPlaybackError, setPreviewPlaybackError] = useState<string | null>(null);

  const videoElementRef = useRef<HTMLVideoElement>(null);

  // Keep in sync with app content
  useEffect(() => {
    setVslData(content.vsl);
  }, [content.vsl]);

  // Test URL accessibility whenever videoUrl changes or on mount
  useEffect(() => {
    if (!vslData.videoUrl || vslData.videoSource === 'youtube' || vslData.videoSource === 'drive') {
      setVerificationState({ status: 'idle' });
      return;
    }

    let isMounted = true;
    const testUrl = async () => {
      setVerificationState({ status: 'testing', message: 'Verifying Storage URL accessibility...' });
      setPreviewPlaybackError(null);
      const res = await verifyMediaUrl(vslData.videoUrl);
      if (!isMounted) return;

      if (res.accessible) {
        setVerificationState({
          status: 'verified',
          message: 'Storage video is publicly accessible & verified.',
          details: { status: res.status, contentType: res.contentType, size: res.contentLength },
        });
      } else {
        setVerificationState({
          status: 'error',
          message: res.error || 'Failed to verify public URL',
          details: { status: res.status },
        });
      }
    };

    testUrl();
    return () => {
      isMounted = false;
    };
  }, [vslData.videoUrl, vslData.videoSource]);

  const handleSourceChange = (source: VideoSourceType) => {
    setVslData((prev) => ({
      ...prev,
      videoSource: source,
    }));
    setPreviewPlaying(false);
    setPreviewPlaybackError(null);
  };

  // Direct MP4 Upload to Supabase Storage
  const handleDirectVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingVideo(true);
      setUploadError(null);
      setPreviewPlaybackError(null);
      setStatusMessage(`Uploading "${file.name}" to Supabase Storage...`);

      // 1. Upload to Supabase Storage bucket
      const uploaded = await mediaService.uploadMedia(file, 'videos');

      if (!uploaded.url || uploaded.url.startsWith('blob:')) {
        throw new Error('Supabase Storage upload failed to return a permanent public URL.');
      }

      // 2. Set permanent Supabase URL and direct source
      setVslData((prev) => ({
        ...prev,
        videoSource: 'direct',
        videoUrl: uploaded.url,
      }));

      // 3. Immediately verify the uploaded file is accessible publicly
      setVerificationState({ status: 'testing', message: 'Testing public URL accessibility...' });
      const verifyRes = await verifyMediaUrl(uploaded.url);

      if (verifyRes.accessible) {
        setVerificationState({
          status: 'verified',
          message: `Uploaded & verified: ${file.name} (${uploaded.size})`,
          details: {
            status: verifyRes.status,
            contentType: verifyRes.contentType,
            size: uploaded.size,
          },
        });
        setStatusMessage(`Video uploaded & verified in Supabase Storage!`);
      } else {
        setVerificationState({
          status: 'error',
          message: verifyRes.error || 'Video uploaded, but public verification failed.',
        });
        setStatusMessage(`Warning: URL returned verification error.`);
      }
    } catch (err: any) {
      console.error('Video upload error:', err);
      setUploadError(err?.message || 'Upload failed');
      setStatusMessage(`Upload failed: ${err?.message || 'Error'}`);
    } finally {
      setIsUploadingVideo(false);
      e.target.value = '';
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  const handleSelectFromMedia = async (asset: MediaAsset) => {
    setVslData((prev) => ({
      ...prev,
      videoSource: 'direct',
      videoUrl: asset.url,
    }));
    setShowMediaPicker(false);
    setStatusMessage(`Selected video: ${asset.name}`);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleVTTUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setStatusMessage(`Uploading caption track ${file.name}...`);
      const asset = await mediaService.uploadMedia(file, 'posters');
      setVslData((prev) => ({
        ...prev,
        captionUrl: asset.url,
      }));
      setStatusMessage(`Captions uploaded & linked: ${file.name}`);
    } catch (err: any) {
      setStatusMessage(`Captions upload failed: ${err?.message || 'Error'}`);
    } finally {
      e.target.value = '';
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleRemoveCaptions = () => {
    setVslData((prev) => ({
      ...prev,
      captionUrl: '',
    }));
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ok = await updateWebsiteContent({ vsl: vslData });
      if (ok) {
        setStatusMessage('VSL settings and video URL saved to Supabase successfully.');
      } else {
        setStatusMessage('Error saving VSL settings.');
      }
    } catch (err: any) {
      setStatusMessage(`Save failed: ${err?.message || 'Error'}`);
    } finally {
      setTimeout(() => setStatusMessage(''), 3500);
    }
  };

  const availableVideoAssets = media.filter(
    (m) =>
      m.category === 'videos' ||
      m.type === 'video' ||
      Boolean(m.name.match(/\.(mp4|webm|ogg|mov|m4v)$/i)) ||
      Boolean(m.url.match(/\.(mp4|webm|ogg|mov|m4v)/i))
  );

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#090910] border border-white/10">
        <div>
          <h2 className="text-base sm:text-lg font-display font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Founder VSL Settings</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure the 90-second video framework, video player source, poster frame, and VTT captions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {statusMessage && (
            <span className="text-xs text-blue-400 font-medium animate-in fade-in flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{statusMessage}</span>
            </span>
          )}

          <button
            type="submit"
            disabled={saveStatus === 'saving' || isUploadingVideo}
            className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 transition-all shadow-[0_0_16px_rgba(37,99,235,0.3)] cursor-pointer flex items-center gap-2"
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>SAVING...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>SAVE VSL SETTINGS</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#090910] border border-white/10 space-y-6">
        {/* Source Selector */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Video Source Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'direct', label: 'Direct MP4 / Storage', icon: Video },
              { id: 'youtube', label: 'YouTube Video', icon: PlaySquare },
              { id: 'drive', label: 'Google Drive', icon: LinkIcon },
              { id: 'local', label: 'Storage / Local', icon: Upload },
            ].map((s) => {
              const Icon = s.icon;
              const isSelected = vslData.videoSource === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSourceChange(s.id as VideoSourceType)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500/40 text-white shadow-[0_0_12px_rgba(37,99,235,0.15)]'
                      : 'bg-[#12121c] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-zinc-400'}`} />
                  <span className="text-xs font-semibold">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Aspect Ratio Selector */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Player Aspect Ratio
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {[
              { id: '16:9', label: '16:9', desc: 'Landscape' },
              { id: '9:16', label: '9:16', desc: 'Vertical' },
              { id: '1:1', label: '1:1', desc: 'Square' },
              { id: '4:5', label: '4:5', desc: 'Portrait' },
              { id: '4:3', label: '4:3', desc: 'Classic' },
              { id: 'auto', label: 'Auto', desc: 'Original' },
            ].map((ratio) => {
              const isSelected = (vslData.aspectRatio || '16:9') === ratio.id;
              return (
                <button
                  key={ratio.id}
                  type="button"
                  onClick={() => setVslData((prev) => ({ ...prev, aspectRatio: ratio.id as any }))}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.25)]'
                      : 'bg-[#12121c] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">{ratio.label}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(37,99,235,0.8)]" />
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 leading-tight">{ratio.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Video Source Controls & Supabase Storage Flow */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              {vslData.videoSource === 'youtube'
                ? 'YouTube Video URL or Embed ID'
                : vslData.videoSource === 'drive'
                ? 'Google Drive Shareable / Preview Link'
                : 'Direct MP4 Video Stream URL (Supabase Storage / CDN)'}
            </label>

            {(vslData.videoSource === 'direct' || vslData.videoSource === 'local') && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-600/10 border border-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderOpen className="w-3 h-3" />
                  <span>Choose from Media Library</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={vslData.videoUrl}
              onChange={(e) => setVslData({ ...vslData, videoUrl: e.target.value })}
              placeholder={
                vslData.videoSource === 'youtube'
                  ? 'https://www.youtube.com/watch?v=...'
                  : vslData.videoSource === 'drive'
                  ? 'https://drive.google.com/file/d/.../preview'
                  : 'https://[supabase-project].supabase.co/storage/v1/object/public/footazix-media/videos/...'
              }
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono outline-none focus:border-blue-500"
            />

            {vslData.videoUrl && (
              <>
                <button
                  type="button"
                  onClick={() => handleCopyUrl(vslData.videoUrl)}
                  className="p-2.5 rounded-xl bg-[#12121c] border border-white/10 text-zinc-400 hover:text-white cursor-pointer"
                  title="Copy Video URL"
                >
                  {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={vslData.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#12121c] border border-white/10 text-zinc-400 hover:text-white cursor-pointer"
                  title="Open in new tab to test public accessibility"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </>
            )}
          </div>

          {/* Direct Supabase Storage Upload Box */}
          {(vslData.videoSource === 'direct' || vslData.videoSource === 'local') && (
            <div className="p-4 rounded-xl bg-[#12121c] border border-dashed border-white/15 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-white block">Upload MP4 to Supabase Storage</span>
                  <span className="text-[11px] text-zinc-400">
                    Directly uploads the MP4 file to Supabase Storage bucket (`footazix-media/videos/`), generates a verified public URL, and links it to VSL.
                  </span>
                </div>

                <label className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 transition-all cursor-pointer inline-flex items-center justify-center gap-2 shrink-0">
                  {isUploadingVideo ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>UPLOADING TO STORAGE...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>SELECT MP4 FILE</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    onChange={handleDirectVideoUpload}
                    disabled={isUploadingVideo}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}

          {/* Video Verification & Live Test Player */}
          {vslData.videoUrl && (vslData.videoSource === 'direct' || vslData.videoSource === 'local') && (
            <div className="p-4 rounded-xl bg-[#0c0c16] border border-white/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Storage URL Verification & Preview
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1 ${
                      verificationState.status === 'verified'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : verificationState.status === 'testing'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : verificationState.status === 'error'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {verificationState.status === 'testing' && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                    {verificationState.status === 'verified' && <Check className="w-2.5 h-2.5" />}
                    {verificationState.status === 'error' && <AlertCircle className="w-2.5 h-2.5" />}
                    <span>{verificationState.status.toUpperCase()}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      setVerificationState({ status: 'testing', message: 'Testing public URL...' });
                      const res = await verifyMediaUrl(vslData.videoUrl);
                      if (res.accessible) {
                        setVerificationState({
                          status: 'verified',
                          message: 'Storage video is publicly accessible & verified.',
                          details: { status: res.status, contentType: res.contentType, size: res.contentLength },
                        });
                      } else {
                        setVerificationState({
                          status: 'error',
                          message: res.error || 'Failed to verify public URL',
                        });
                      }
                    }}
                    className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Re-check URL</span>
                  </button>
                </div>
              </div>

              {verificationState.message && (
                <p
                  className={`text-[11px] font-mono ${
                    verificationState.status === 'verified'
                      ? 'text-emerald-400'
                      : verificationState.status === 'error'
                      ? 'text-red-400'
                      : 'text-zinc-400'
                  }`}
                >
                  {verificationState.message}
                  {verificationState.details?.size && ` · Size: ${verificationState.details.size}`}
                  {verificationState.details?.contentType && ` · Format: ${verificationState.details.contentType}`}
                </p>
              )}

              {/* Playable Video Frame inside CMS */}
              <div className="relative w-full max-w-lg aspect-video rounded-xl overflow-hidden bg-black border border-white/15 mx-auto">
                <video
                  ref={videoElementRef}
                  src={vslData.videoUrl}
                  poster={vslData.posterUrl}
                  preload="metadata"
                  playsInline
                  muted={previewMuted}
                  onLoadedMetadata={(e) => {
                    const el = e.currentTarget;
                    setPreviewDuration(el.duration || 0);
                    setPreviewPlaybackError(null);
                  }}
                  onTimeUpdate={(e) => setPreviewCurrentTime(e.currentTarget.currentTime)}
                  onEnded={() => setPreviewPlaying(false)}
                  onError={() => {
                    setPreviewPlaybackError('HTML5 Video player failed to decode/load video file from this URL.');
                    setPreviewPlaying(false);
                  }}
                  className={`w-full h-full object-contain ${
                    Boolean(vslData.posterMonochrome || vslData.monochrome) && !previewPlaying
                      ? 'grayscale contrast-110'
                      : ''
                  }`}
                />

                {previewPlaybackError && (
                  <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 text-center">
                    <AlertCircle className="w-6 h-6 text-red-400 mb-1" />
                    <span className="text-xs font-bold text-red-300">Playback Failed</span>
                    <span className="text-[10px] text-zinc-400 mt-1">{previewPlaybackError}</span>
                  </div>
                )}

                {/* Player Overlay Controls */}
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (!videoElementRef.current) return;
                        if (previewPlaying) {
                          videoElementRef.current.pause();
                          setPreviewPlaying(false);
                        } else {
                          videoElementRef.current
                            .play()
                            .then(() => setPreviewPlaying(true))
                            .catch((err) => {
                              setPreviewPlaybackError(err.message || 'Play failed');
                            });
                        }
                      }}
                      className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                    >
                      {previewPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (videoElementRef.current) {
                          videoElementRef.current.muted = !previewMuted;
                        }
                        setPreviewMuted(!previewMuted);
                      }}
                      className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {previewMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>

                    <span className="text-[10px] font-mono text-zinc-300">
                      {Math.floor(previewCurrentTime)}s / {Math.floor(previewDuration)}s
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-emerald-400">
                    {previewPlaying ? 'Playing' : 'Ready'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Poster Frame Image & Monochrome Toggle */}
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Poster Frame Image URL
            </label>
            <input
              type="text"
              value={vslData.posterUrl}
              onChange={(e) => setVslData({ ...vslData, posterUrl: e.target.value })}
              placeholder="/assets/vsl/vsl-poster.jpg"
              className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono outline-none focus:border-blue-500"
            />
          </div>

          {/* Monochrome Control Toggle */}
          <div className="p-4 rounded-xl bg-[#12121c] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Poster Image Color Mode
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    Boolean(vslData.posterMonochrome || vslData.monochrome)
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {Boolean(vslData.posterMonochrome || vslData.monochrome)
                    ? 'Monochrome (ON)'
                    : 'Full Color (OFF)'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                OFF = original full-color image (default) · ON = professional monochrome/grayscale effect
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setVslData({ ...vslData, posterMonochrome: false, monochrome: false })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                  !Boolean(vslData.posterMonochrome || vslData.monochrome)
                    ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Full Color (OFF)
              </button>
              <button
                type="button"
                onClick={() => setVslData({ ...vslData, posterMonochrome: true, monochrome: true })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                  Boolean(vslData.posterMonochrome || vslData.monochrome)
                    ? 'bg-zinc-200 text-zinc-950 font-extrabold shadow-sm'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Monochrome (ON)
              </button>
            </div>
          </div>

          {/* Visual Poster Preview with Live Color Mode */}
          {vslData.posterUrl && (
            <div className="relative w-full max-w-xs h-32 rounded-xl overflow-hidden border border-white/10 bg-black">
              <img
                src={vslData.posterUrl}
                alt="Poster preview"
                className={`w-full h-full object-cover transition-all duration-300 ${
                  Boolean(vslData.posterMonochrome || vslData.monochrome) ? 'grayscale contrast-110' : ''
                }`}
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-white backdrop-blur-sm border border-white/10">
                {Boolean(vslData.posterMonochrome || vslData.monochrome)
                  ? 'Preview: Monochrome'
                  : 'Preview: Full Color'}
              </span>
            </div>
          )}
        </div>

        {/* VTT Captions */}
        <div className="p-4 rounded-xl bg-[#12121c] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-white">Closed Captions (.vtt)</span>
            </div>
            {vslData.captionUrl && (
              <button
                type="button"
                onClick={handleRemoveCaptions}
                className="text-[11px] text-red-400 hover:text-red-300 cursor-pointer"
              >
                Remove
              </button>
            )}
          </div>

          <p className="text-[11px] text-zinc-400">
            Real WebVTT subtitle track. CC controls are only enabled on the public player when a valid caption track is attached.
          </p>

          <input
            type="file"
            accept=".vtt"
            onChange={handleVTTUpload}
            className="text-xs text-zinc-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
          />
        </div>

        {/* Published Toggle */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">Publish VSL Section</span>
            <span className="text-[11px] text-zinc-400">
              When published, the Founder VSL section is displayed in the main public website stream.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setVslData({ ...vslData, published: !vslData.published })}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              vslData.published
                ? 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                : 'bg-zinc-900 text-zinc-400 border border-white/10'
            }`}
          >
            {vslData.published ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Published</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hidden</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setShowMediaPicker(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#0b0b14] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white">Select Video from Supabase Storage</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Choose any uploaded video asset to use as the Founder VSL source
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-[#12121c] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {availableVideoAssets.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  No video assets found in Media Library. Upload an MP4 above or in the Media tab first.
                </div>
              ) : (
                availableVideoAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-3 rounded-xl bg-[#12121c] border border-white/10 hover:border-blue-500/40 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Video className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">{asset.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {asset.size} {asset.duration ? `· ${asset.duration}` : ''} · {asset.uploadedAt}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectFromMedia(asset)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 shrink-0 cursor-pointer"
                    >
                      Use as VSL Video
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
