import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VSLSettings, VideoSourceType } from '../../types';

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
    setUploadProgress(10);

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
        return p + 30;
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
      setStatusMessage('VSL settings saved to live session!');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleReset = () => {
    setVslData(content.vsl);
    setLocalVideoName('');
    setUploadProgress(null);
    setStatusMessage('Reverted to current published VSL settings.');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl pb-16">
      {/* Header & Sticky Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-950 border border-white/10 sticky top-4 z-20 backdrop-blur-md bg-zinc-950/95 shadow-xl">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight">
            Founder VSL Video Settings
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure video provider source, caption files, and player attributes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {statusMessage && (
            <span className="text-xs font-medium text-blue-400 animate-in fade-in duration-150">
              {statusMessage}
            </span>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 border border-white/10 transition-colors cursor-pointer"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className="px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 transition-all glow-blue-sm cursor-pointer flex items-center gap-2"
          >
            {saveStatus === 'saving' ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>SAVING...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <span>✓ SAVED</span>
            ) : (
              <span>SAVE VSL SETTINGS</span>
            )}
          </button>
        </div>
      </div>

      {/* Video Source Selection Tabs */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-white/10 space-y-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
            Video Source Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(
              [
                { id: 'youtube', label: 'YouTube' },
                { id: 'drive', label: 'Google Drive' },
                { id: 'direct', label: 'Direct Video URL' },
                { id: 'local', label: 'Local Upload' },
              ] as const
            ).map((src) => (
              <button
                key={src.id}
                type="button"
                onClick={() => handleSourceChange(src.id)}
                className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer text-center ${
                  vslData.videoSource === src.id
                    ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850 border border-white/10'
                }`}
              >
                [ {src.label} ]
              </button>
            ))}
          </div>
        </div>

        {/* Source-specific input UI */}
        {vslData.videoSource === 'youtube' && (
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              YouTube Video URL
            </label>
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              value={vslData.videoUrl}
              onChange={(e) => setVslData({ ...vslData, videoUrl: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 font-mono"
            />
            <p className="text-[11px] text-zinc-500">
              Supports standard YouTube URLs and shortlinks. Automatically converted to privacy-enhanced embed.
            </p>
          </div>
        )}

        {vslData.videoSource === 'drive' && (
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Google Drive Shareable Link
            </label>
            <input
              type="text"
              placeholder="https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
              value={vslData.videoUrl}
              onChange={(e) => setVslData({ ...vslData, videoUrl: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 font-mono"
            />
            <p className="text-[11px] text-zinc-500">
              Ensure Google Drive sharing permissions are set to "Anyone with the link can view".
            </p>
          </div>
        )}

        {vslData.videoSource === 'direct' && (
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Direct Video File Path or CDN URL (MP4 / WebM)
            </label>
            <input
              type="text"
              placeholder="/assets/vsl/footazix-vsl.mp4 or https://cdn.../video.mp4"
              value={vslData.videoUrl}
              onChange={(e) => setVslData({ ...vslData, videoUrl: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 font-mono"
            />
            <p className="text-[11px] text-zinc-500">
              Direct HTML5 video link. Supports custom scrub timeline and track captions.
            </p>
          </div>
        )}

        {vslData.videoSource === 'local' && (
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Local Video Browser Upload (Mock / Session State)
            </label>
            <div className="flex items-center gap-3">
              <label className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer">
                <span>Select Local Video File</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={handleLocalVideoUpload}
                  className="hidden"
                />
              </label>

              {localVideoName && (
                <span className="text-xs text-zinc-300 font-mono">
                  {localVideoName}
                </span>
              )}
            </div>

            {uploadProgress !== null && uploadProgress < 100 && (
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            <p className="text-[11px] text-zinc-500">
              Stored in browser object memory for instant local preview. Ready for Supabase Storage bucket in Phase 2.
            </p>
          </div>
        )}

        {/* Poster Image */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Poster / Thumbnail Image URL
          </label>
          <input
            type="text"
            value={vslData.posterUrl}
            onChange={(e) => setVslData({ ...vslData, posterUrl: e.target.value })}
            placeholder="/assets/vsl/vsl-poster.jpg"
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {/* Captions / CC Configuration */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Closed Captions (.VTT file)</span>
              <span className="text-[11px] text-zinc-400">
                Rule: If captions file is configured, CC button is active. If not configured, CC button is hidden.
              </span>
            </div>
            {vslData.captionUrl ? (
              <button
                type="button"
                onClick={handleRemoveCaptions}
                className="px-2.5 py-1 rounded text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/40 border border-red-500/30 cursor-pointer"
              >
                Remove CC
              </button>
            ) : (
              <label className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-750 border border-white/10 cursor-pointer">
                <span>Upload .vtt file</span>
                <input
                  type="file"
                  accept=".vtt"
                  onChange={handleVTTUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {vslData.captionUrl ? (
            <div className="flex items-center gap-2 text-xs text-blue-400 font-mono">
              <span>✓ Captions configured:</span>
              <span className="truncate max-w-sm text-zinc-400">{vslData.captionUrl}</span>
            </div>
          ) : (
            <div className="text-xs text-zinc-500">
              No caption file configured. CC button will remain hidden on public player (no fake captions).
            </div>
          )}
        </div>

        {/* Published Toggle */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-xs font-bold text-white block">VSL Section Status</span>
            <span className="text-[11px] text-zinc-400">Show or hide the Founder VSL section on the public website.</span>
          </div>
          <button
            type="button"
            onClick={() => setVslData({ ...vslData, published: !vslData.published })}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
              vslData.published
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-900 text-zinc-500 border border-white/10'
            }`}
          >
            {vslData.published ? 'Published' : 'Hidden'}
          </button>
        </div>
      </div>
    </form>
  );
};
