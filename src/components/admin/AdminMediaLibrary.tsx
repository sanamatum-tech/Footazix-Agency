import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MediaAsset, MediaCategory } from '../../types';
import { mediaService } from '../../services/mediaService';

const CATEGORIES: Array<'all' | MediaCategory> = ['all', 'images', 'videos', 'posters', 'logos'];

export const AdminMediaLibrary: React.FC = () => {
  const { media } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<'all' | MediaCategory>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<MediaCategory>('images');
  const [statusMessage, setStatusMessage] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const filteredMedia =
    selectedCategory === 'all'
      ? media
      : media.filter((m) => m.category === selectedCategory);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await mediaService.uploadMedia(file, uploadCategory);
      setStatusMessage(`Uploaded "${uploaded.name}" locally.`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch {
      setStatusMessage('Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this media asset from local library?')) {
      await mediaService.deleteMedia(id);
      setStatusMessage('Asset removed.');
      setTimeout(() => setStatusMessage(''), 2500);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header & Local Upload Area */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-white tracking-tight">
              Media Asset Library
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Upload and manage video thumbnails, brand stills, and poster graphics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {statusMessage && (
              <span className="text-xs font-medium text-blue-400 animate-in fade-in">
                {statusMessage}
              </span>
            )}
          </div>
        </div>

        {/* Supabase Storage banner */}
        <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-blue-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>
              Connected to Supabase Storage bucket (<code className="text-blue-400">footazix-media</code>). Assets generate public cloud CDN URLs for portfolio and posters.
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-600/30 text-blue-300">
            Storage RLS
          </span>
        </div>

        {/* Upload Zone */}
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-dashed border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Upload Asset to Storage</span>
              <span className="text-[11px] text-zinc-400">JPG, PNG, WebP, MP4, VTT (uploaded to Supabase Storage)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value as MediaCategory)}
              className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none"
            >
              <option value="images">Category: Images</option>
              <option value="posters">Category: Posters</option>
              <option value="videos">Category: Videos</option>
              <option value="logos">Category: Logos</option>
            </select>

            <label className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all glow-blue-sm cursor-pointer whitespace-nowrap">
              <span>{isUploading ? 'UPLOADING...' : 'SELECT FILE'}</span>
              <input
                type="file"
                disabled={isUploading}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,video/*"
              />
            </label>
          </div>
        </div>

        {/* Filter Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid or Empty State */}
      {filteredMedia.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-12 text-center">
          <h3 className="text-base font-bold text-white mb-1">No media in this category.</h3>
          <p className="text-xs text-zinc-400">
            Upload files using the selector above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedia.map((asset) => (
            <div
              key={asset.id}
              className="rounded-xl overflow-hidden bg-zinc-950 border border-white/10 group flex flex-col justify-between"
            >
              {/* Asset Preview */}
              <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden">
                {asset.category === 'videos' ? (
                  <video
                    src={asset.url}
                    className="w-full h-full object-cover"
                    controls={false}
                  />
                ) : (
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                )}

                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-black/70 text-blue-400 border border-blue-500/30 backdrop-blur-sm">
                    {asset.category}
                  </span>
                </div>
              </div>

              {/* Asset Details */}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-white truncate" title={asset.name}>
                    {asset.name}
                  </h4>
                  <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                    {asset.size}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-white/5">
                  <span className="font-mono">{asset.uploadedAt}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyUrl(asset.url)}
                      className="text-blue-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedUrl === asset.url ? 'Copied!' : 'Copy Path'}
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
