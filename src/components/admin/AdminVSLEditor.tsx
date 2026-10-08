import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VSLSettings, VideoSourceType } from '../../types';
import {
  PlaySquare,
  Upload,
  Link,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  FileText,
  Loader2,
  AlertCircle,
  Video,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminVSLEditor: React.FC = () => {
  const { content, updateWebsiteContent, saveStatus } = useApp();
  const [vslData, setVslData] = useState<VSLSettings>(content.vsl);
  const [statusMessage, setStatusMessage] = useState('');
  const [localVideoName, setLocalVideoName] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleSourceChange = (source: VideoSourceType) => {
    setVslData((prev) => ({
      ...prev,
      videoSource: source,
    }));
  };

  const handleLocalVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalVideoName(file.name);
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (!p || p >= 100) {
          clearInterval(interval);
          const objectUrl = URL.createObjectURL(file);
          setVslData((prev) => ({
            ...prev,
            videoUrl: objectUrl,
          }));
          return 100;
        }
        return p + 25;
      });
    }, 150);
  };

  const handleVTTUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setVslData((prev) => ({
      ...prev,
      captionUrl: objectUrl,
    }));
    setStatusMessage(`Uploaded captions: ${file.name}`);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleRemoveCaptions = () => {
    setVslData((prev) => ({
      ...prev,
      captionUrl: '',
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateWebsiteContent({ vsl: vslData });
    if (ok) {
      setStatusMessage('VSL settings saved to Supabase successfully.');
    } else {
      setStatusMessage('Error saving VSL settings.');
    }
    setTimeout(() => setStatusMessage(''), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto pb-16">
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
            disabled={saveStatus === 'saving'}
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
              { id: 'direct', label: 'Direct MP4 / CDN', icon: Video },
              { id: 'youtube', label: 'YouTube Video', icon: PlaySquare },
              { id: 'drive', label: 'Google Drive', icon: Link },
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

        {/* Video URL or Uploader depending on source */}
        {vslData.videoSource !== 'local' ? (
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              {vslData.videoSource === 'youtube'
                ? 'YouTube Video URL or Embed ID'
                : vslData.videoSource === 'drive'
                ? 'Google Drive Shareable / Preview Link'
                : 'Direct MP4 Video Stream URL'}
            </label>
            <input
              type="text"
              value={vslData.videoUrl}
              onChange={(e) => setVslData({ ...vslData, videoUrl: e.target.value })}
              placeholder={
                vslData.videoSource === 'youtube'
                  ? 'https://www.youtube.com/watch?v=...'
                  : vslData.videoSource === 'drive'
                  ? 'https://drive.google.com/file/d/.../preview'
                  : 'https://assets.mixkit.co/...mp4'
              }
              className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono outline-none focus:border-blue-500"
            />
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#12121c] border border-dashed border-white/15 space-y-3">
            <span className="text-xs font-bold text-white block">Upload Video File</span>
            <input
              type="file"
              accept="video/*"
              onChange={handleLocalVideoUpload}
              className="text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
            />
            {uploadProgress !== null && (
              <div className="space-y-1">
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {uploadProgress < 100 ? `Uploading: ${uploadProgress}%` : `Ready: ${localVideoName}`}
                </span>
              </div>
            )}
          </div>
        )}

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
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  Boolean(vslData.posterMonochrome || vslData.monochrome)
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {Boolean(vslData.posterMonochrome || vslData.monochrome) ? 'Monochrome (ON)' : 'Full Color (OFF)'}
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
                {Boolean(vslData.posterMonochrome || vslData.monochrome) ? 'Preview: Monochrome' : 'Preview: Full Color'}
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
    </form>
  );
};
