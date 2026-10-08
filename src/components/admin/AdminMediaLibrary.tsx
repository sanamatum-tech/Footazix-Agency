import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MediaAsset, MediaCategory } from '../../types';
import { mediaService } from '../../services/mediaService';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES: Array<'all' | MediaCategory> = ['all', 'images', 'videos', 'posters', 'logos'];

export const AdminMediaLibrary: React.FC = () => {
  const { media } = useApp();
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

  const filteredMedia = media.filter((m) => {
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMessage('Uploading asset to storage...');
    try {
      const uploaded = await mediaService.uploadMedia(file, uploadCategory);
      setStatusMessage(`Asset "${uploaded.name}" saved successfully.`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch {
      setStatusMessage('Upload failed. Please try again.');
      setTimeout(() => setStatusMessage(''), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDelete = async (id: string) => {
    await mediaService.deleteMedia(id);
    setIsDeletingId(null);
    setStatusMessage('Asset removed.');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#090910] border border-white/10">
        <div>
          <h2 className="text-base sm:text-lg font-display font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Media Library</span>
            <span className="text-xs font-mono font-normal text-zinc-400">
              ({media.length} items)
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage video stills, posters, audio clips, and production media assets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {statusMessage && (
            <span className="text-xs text-blue-400 font-medium animate-in fade-in">
              {statusMessage}
            </span>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#12121c] border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
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
              <span className="text-sm font-bold text-white block">Upload Creative Assets</span>
              <span className="text-xs text-zinc-400">PNG, JPG, WebP, MP4 video, VTT captions</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value as MediaCategory)}
              className="px-3 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs outline-none focus:border-blue-500"
            >
              <option value="images">Category: Images</option>
              <option value="videos">Category: Videos</option>
              <option value="posters">Category: Posters</option>
              <option value="logos">Category: Logos</option>
            </select>

            <label className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-[0_0_16px_rgba(37,99,235,0.3)] cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap">
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>UPLOADING...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>CHOOSE FILE</span>
                </>
              )}
              <input
                type="file"
                disabled={isUploading}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,video/*,.vtt"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#090910] border border-white/10">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search media by filename, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#12121c] border border-white/10 text-white text-xs placeholder-zinc-500 outline-none focus:border-blue-500"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap capitalize transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-white bg-[#12121c] border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Media Content */}
      {filteredMedia.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#090910] border border-white/10 space-y-2">
          <Images className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No media files found</h3>
          <p className="text-xs text-zinc-400">
            Upload files above to store them in your storage library.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredMedia.map((asset) => (
            <div
              key={asset.id}
              className="rounded-xl bg-[#090910] border border-white/10 hover:border-white/20 overflow-hidden transition-all flex flex-col justify-between group"
            >
              <div
                className="relative aspect-square w-full overflow-hidden bg-zinc-900 cursor-pointer"
                onClick={() => setPreviewAsset(asset)}
              >
                {asset.type === 'video' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-400">
                    <Video className="w-8 h-8 text-blue-400 mb-1" />
                    <span className="text-[10px] font-mono">MP4 Video</span>
                  </div>
                ) : (
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewAsset(asset);
                    }}
                    className="p-1.5 rounded-lg bg-black/70 text-white hover:bg-black"
                    title="Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyUrl(asset.url);
                    }}
                    className="p-1.5 rounded-lg bg-black/70 text-white hover:bg-black"
                    title="Copy URL"
                  >
                    {copiedUrl === asset.url ? (
                      <Check className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-2.5 space-y-1">
                <span className="text-[11px] font-semibold text-white truncate block">
                  {asset.name}
                </span>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span>{asset.size}</span>
                  <button
                    onClick={() => setIsDeletingId(asset.id)}
                    className="text-zinc-500 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl bg-[#090910] border border-white/10 overflow-hidden divide-y divide-white/5">
          {filteredMedia.map((asset) => (
            <div
              key={asset.id}
              className="p-3.5 hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-10 rounded-lg overflow-hidden bg-zinc-900 shrink-0 border border-white/10">
                  {asset.type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center text-blue-400">
                      <Video className="w-4 h-4" />
                    </div>
                  ) : (
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">{asset.name}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {asset.category} · {asset.size} · {asset.createdAt}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopyUrl(asset.url)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 bg-[#12121c] hover:text-white border border-white/10 flex items-center gap-1.5"
                >
                  {copiedUrl === asset.url ? (
                    <>
                      <Check className="w-3 h-3 text-blue-400" />
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
                  onClick={() => setIsDeletingId(asset.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 bg-[#12121c] border border-white/10"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Lightbox */}
      {previewAsset && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setPreviewAsset(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#0b0b14] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white">{previewAsset.name}</h3>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {previewAsset.category} · {previewAsset.size}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {previewAsset.type !== 'video' && (
                  <button
                    type="button"
                    onClick={() => setPreviewMonochrome(!previewMonochrome)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase cursor-pointer transition-colors ${
                      previewMonochrome
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-zinc-850 text-zinc-300 hover:text-white border border-white/10'
                    }`}
                  >
                    {previewMonochrome ? 'Mono: ON' : 'Mono: OFF (Full Color)'}
                  </button>
                )}
                <button
                  onClick={() => {
                    setPreviewAsset(null);
                    setPreviewMonochrome(false);
                  }}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-[#12121c] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[60vh]">
              {previewAsset.type === 'video' ? (
                <video src={previewAsset.url} controls className="max-w-full max-h-[50vh]" />
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

            <div className="flex items-center justify-between pt-2">
              <input
                type="text"
                readOnly
                value={previewAsset.url}
                className="flex-1 mr-3 px-3 py-1.5 rounded-lg bg-[#12121c] border border-white/10 text-xs font-mono text-zinc-400 outline-none"
              />
              <button
                onClick={() => handleCopyUrl(previewAsset.url)}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-1.5 shrink-0"
              >
                {copiedUrl === previewAsset.url ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl === previewAsset.url ? 'Copied' : 'Copy URL'}</span>
              </button>
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
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#12121c] border border-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(isDeletingId)}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-500"
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
