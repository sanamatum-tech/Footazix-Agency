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
      const updatedVsl: VSLSettings = {
        ...vslData,
        videoSource: 'direct',
        videoUrl: uploaded.url,
      };
      setVslData(updatedVsl);

      // 3. Automatically synchronize to Supabase database & storage snapshot
      try {
        await updateWebsiteContent({ vsl: updatedVsl });
      } catch (saveErr) {
        console.warn('Auto-save notice:', saveErr);
      }

      // 4. Immediately verify the uploaded file is accessible publicly
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
        setStatusMessage(`Video uploaded, saved to Supabase, & live on public website!`);
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
      setTimeout(() => setStatusMessage(''), 4500);
    }
  };

  const handleSelectFromMedia = async (asset: MediaAsset) => {
    const updatedVsl: VSLSettings = {
      ...vslData,
      videoSource: 'direct',
      videoUrl: asset.url,
    };
    setVslData(updatedVsl);
    setShowMediaPicker(false);
    try {
      await updateWebsiteContent({ vsl: updatedVsl });
      setStatusMessage(`Assigned & saved "${asset.name}" to Founder VSL!`);
    } catch {
      setStatusMessage(`Selected video: ${asset.name}`);
    }
    setTimeout(() => setStatusMessage(''), 3500);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#0D0F10] border border-[#292E25]">
        <div>
          <h2 className="text-base sm:text-lg font-display font-extrabold text-[#F5F7F2] tracking-tight flex items-center gap-2">
            <span>Founder VSL Settings</span>
          </h2>
          <p className="text-xs text-[#A7AEA0] mt-0.5">
            Configure the 90-second video framework, video player source, poster frame, and VTT captions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {statusMessage && (
            <span className="text-xs text-[#B1FF00] font-medium animate-in fade-in flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{statusMessage}</span>
            </span>
          )}

          <button
            type="submit"
            disabled={saveStatus === 'saving' || isUploadingVideo}
            className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#070809] bg-[#B1FF00] hover:bg-[#C4FF45] active:bg-[#96DB00] active:scale-95 disabled:opacity-50 transition-all shadow-[0_0_16px_rgba(177,255,0,0.3)] cursor-pointer flex items-center gap-2"
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
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0D0F10] border border-[#292E25] space-y-6">
        {/* Source Selector */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#A7AEA0] mb-2">
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
                      ? 'bg-[#B1FF00]/15 border-[#B1FF00]/40 text-[#F5F7F2] shadow-[0_0_12px_rgba(177,255,0,0.15)]'
                      : 'bg-[#121512] border-[#292E25] text-[#A7AEA0] hover:text-[#F5F7F2] hover:border-[#B1FF00]/30'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#B1FF00]' : 'text-[#737B6B]'}`} />
                  <span className="text-xs font-semibold">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Aspect Ratio Selector */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#A7AEA0] mb-2">
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
                      ? 'bg-[#B1FF00]/15 border-[#B1FF00]/40 text-[#F5F7F2] shadow-[0_0_12px_rgba(177,255,0,0.2)]'
                      : 'bg-[#121512] border-[#292E25] text-[#A7AEA0] hover:text-[#F5F7F2] hover:border-[#B1FF00]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#F5F7F2]">{ratio.label}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#B1FF00] shadow-[0_0_6px_rgba(177,255,0,0.8)]" />
                    )}
                  </div>
                  <span className="text-[10px] text-[#A7AEA0] leading-tight">{ratio.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Video Source Controls & Supabase Storage Flow */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#A7AEA0]">
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
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#B1FF00] hover:text-[#C4FF45] bg-[#B1FF00]/10 border border-[#B1FF00]/30 flex items-center gap-1.5 cursor-pointer"
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
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#121512] border border-[#292E25] text-[#F5F7F2] text-xs font-mono outline-none focus:border-[#B1FF00]"
            />

            {vslData.videoUrl && (
              <>
                <button
                  type="button"
                  onClick={() => handleCopyUrl(vslData.videoUrl)}
                  className="p-2.5 rounded-xl bg-[#121512] border border-[#292E25] text-[#A7AEA0] hover:text-[#F5F7F2] cursor-pointer"
                  title="Copy Video URL"
                >
                  {copiedUrl ? <Check className="w-4 h-4 text-[#B1FF00]" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={vslData.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#121512] border border-[#292E25] text-[#A7AEA0] hover:text-[#B1FF00] cursor-pointer"
                  title="Open in new tab to test public accessibility"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </>
            )}
          </div>

          {/* Direct Supabase Storage Upload Box */}
          {(vslData.videoSource === 'direct' || vslData.videoSource === 'local') && (
            <div className="p-4 rounded-xl bg-[#121512] border border-dashed border-[#292E25] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-[#F5F7F2] block">Upload MP4 to Supabase Storage</span>
                  <span className="text-[11px] text-[#A7AEA0]">
                    Directly uploads the MP4 file to Supabase Storage bucket (`footazix-media/videos/`), generates a verified public URL, and links it to VSL.
                  </span>
                </div>

                <label className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#070809] bg-[#B1FF00] hover:bg-[#C4FF45] active:bg-[#96DB00] active:scale-95 disabled:opacity-50 transition-all cursor-pointer inline-flex items-center justify-center gap-2 shrink-0">
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
            <div className="p-4 rounded-xl bg-[#121512] border border-[#292E25] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#292E25]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F5F7F2]">
                    Storage URL Verification & Preview
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1 ${
                      verificationState.status === 'verified'
                        ? 'bg-[#B1FF00]/15 text-[#B1FF00] border border-[#B1FF00]/30'
                        : verificationState.status === 'testing'
                        ? 'bg-[#B1FF00]/15 text-[#B1FF00] border border-[#B1FF00]/30'
                        : verificationState.status === 'error'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {verificationState.status === 'testing' && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                    {verificationState.status === 'verified' && <Check className="w-2.5 h-2.5 text-[#B1FF00]" />}
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
                    className="text-[11px] font-mono text-[#A7AEA0] hover:text-[#F5F7F2] flex items-center gap-1 cursor-pointer"
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
                      ? 'text-[#B1FF00]'
                      : verificationState.status === 'error'
                      ? 'text-red-400'
                      : 'text-[#A7AEA0]'
                  }`}
                >
                  {verificationState.message}
                  {verificationState.details?.size && ` · Size: ${verificationState.details.size}`}
                  {verificationState.details?.contentType && ` · Format: ${verificationState.details.contentType}`}
                </p>
              )}

              {/* Playable Video Frame inside CMS */}
              <div className="relative w-full max-w-lg aspect-video rounded-xl overflow-hidden bg-black border border-[#292E25] mx-auto">
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
                      className="p-1.5 rounded-lg bg-[#B1FF00] hover:bg-[#C4FF45] text-[#070809] cursor-pointer"
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
                      className="p-1 text-[#A7AEA0] hover:text-[#F5F7F2] cursor-pointer"
                    >
                      {previewMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>

                    <span className="text-[10px] font-mono text-zinc-300">
                      {Math.floor(previewCurrentTime)}s / {Math.floor(previewDuration)}s
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-[#B1FF00]">
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
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#A7AEA0] mb-1.5">
              Poster Frame Image URL
            </label>
            <input
              type="text"
              value={vslData.posterUrl}
              onChange={(e) => setVslData({ ...vslData, posterUrl: e.target.value })}
              placeholder="/assets/vsl/vsl-poster.jpg"
              className="w-full px-4 py-2.5 rounded-xl bg-[#121512] border border-[#292E25] text-[#F5F7F2] text-xs font-mono outline-none focus:border-[#B1FF00]"
            />
          </div>

          {/* Monochrome Control Toggle */}
          <div className="p-4 rounded-xl bg-[#121512] border border-[#292E25] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F5F7F2]">
                  Poster Image Color Mode
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    Boolean(vslData.posterMonochrome || vslData.monochrome)
                      ? 'bg-zinc-800 text-zinc-300 border border-white/10'
                      : 'bg-[#B1FF00]/15 text-[#B1FF00] border border-[#B1FF00]/30'
                  }`}
                >
                  {Boolean(vslData.posterMonochrome || vslData.monochrome)
                    ? 'Monochrome (ON)'
                    : 'Full Color (OFF)'}
                </span>
              </div>
              <p className="text-[11px] text-[#A7AEA0] mt-0.5">
                OFF = original full-color image (default) · ON = professional monochrome/grayscale effect
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setVslData({ ...vslData, posterMonochrome: false, monochrome: false })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                  !Boolean(vslData.posterMonochrome || vslData.monochrome)
                    ? 'bg-[#B1FF00] text-[#070809] shadow-[0_0_12px_rgba(177,255,0,0.4)]'
                    : 'bg-[#181C16] text-[#A7AEA0] hover:text-[#F5F7F2]'
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
                    : 'bg-[#181C16] text-[#A7AEA0] hover:text-[#F5F7F2]'
                }`}
              >
                Monochrome (ON)
              </button>
            </div>
          </div>

          {/* Visual Poster Preview with Live Color Mode */}
          {vslData.posterUrl && (
            <div className="relative w-full max-w-xs h-32 rounded-xl overflow-hidden border border-[#292E25] bg-black">
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
        <div className="p-4 rounded-xl bg-[#121512] border border-[#292E25] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#B1FF00]" />
              <span className="text-xs font-bold text-[#F5F7F2]">Closed Captions (.vtt)</span>
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

          <p className="text-[11px] text-[#A7AEA0]">
            Real WebVTT subtitle track. CC controls are only enabled on the public player when a valid caption track is attached.
          </p>

          <input
            type="file"
            accept=".vtt"
            onChange={handleVTTUpload}
            className="text-xs text-[#A7AEA0] file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#181C16] file:text-[#F5F7F2] hover:file:bg-zinc-700 cursor-pointer"
          />
        </div>

        {/* Published Toggle */}
        <div className="pt-2 border-t border-[#292E25] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#F5F7F2] block">Publish VSL Section</span>
            <span className="text-[11px] text-[#A7AEA0]">
              When published, the Founder VSL section is displayed in the main public website stream.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setVslData({ ...vslData, published: !vslData.published })}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              vslData.published
                ? 'bg-[#B1FF00]/10 text-[#B1FF00] border border-[#B1FF00]/30'
                : 'bg-[#121512] text-[#737B6B] border border-[#292E25]'
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
            className="w-full max-w-2xl bg-[#0D0F10] border border-[#292E25] rounded-2xl p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#292E25] shrink-0">
              <div>
                <h3 className="text-sm font-bold text-[#F5F7F2]">Select Video from Supabase Storage</h3>
                <p className="text-[11px] text-[#A7AEA0] mt-0.5">
                  Choose any uploaded video asset to use as the Founder VSL source
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="p-1.5 rounded-lg text-[#A7AEA0] hover:text-[#F5F7F2] bg-[#121512] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {availableVideoAssets.length === 0 ? (
                <div className="py-12 text-center text-[#737B6B] text-xs">
                  No video assets found in Media Library. Upload an MP4 above or in the Media tab first.
                </div>
              ) : (
                availableVideoAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-3 rounded-xl bg-[#121512] border border-[#292E25] hover:border-[#B1FF00]/40 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-[#B1FF00]/10 border border-[#B1FF00]/20 text-[#B1FF00] flex items-center justify-center shrink-0">
                        <Video className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#F5F7F2] block truncate">{asset.name}</span>
                        <span className="text-[10px] text-[#A7AEA0] font-mono">
                          {asset.size} {asset.duration ? `· ${asset.duration}` : ''} · {asset.uploadedAt}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectFromMedia(asset)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#070809] bg-[#B1FF00] hover:bg-[#C4FF45] shrink-0 cursor-pointer"
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
