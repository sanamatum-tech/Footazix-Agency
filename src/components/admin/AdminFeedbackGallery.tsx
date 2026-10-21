import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { feedbackGalleryService } from '../../services/feedbackGalleryService';
import { mediaService, verifyMediaUrl } from '../../services/mediaService';
import { FeedbackGalleryItem, FeedbackGallerySettings, AspectRatioType, MediaAsset } from '../../types';
import {
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Settings,
  Sparkles,
  Database,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  Maximize2,
  Sliders,
  Play,
  Pause,
} from 'lucide-react';

export const AdminFeedbackGallery: React.FC = () => {
  const {
    content,
    updateFeedbackGallerySettings,
    addFeedbackItem,
    updateFeedbackItem,
    deleteFeedbackItem,
    reorderFeedbackItems,
    media,
    saveStatus,
  } = useApp();

  const currentSettings: FeedbackGallerySettings = content.feedbackGallery || {
    enabled: true,
    aspectRatio: '1:1',
    autoScroll: true,
    scrollSpeed: 28,
    direction: 'left',
    pauseOnHover: true,
    cardGap: 20,
    cardRadius: 16,
    badge: 'CLIENT FEEDBACK',
    heading: 'CLIENT WORDS',
    subheading: 'Genuine feedback screenshots from creators and brands we edit for.',
    showSectionHeading: false,
    items: [],
  };

  const [activeTab, setActiveTab] = useState<'items' | 'settings' | 'migration'>('items');
  const [isUploading, setIsUploading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [pickerTargetIndex, setPickerTargetIndex] = useState<number | null>(null); // null = add new, number = replace
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);

  // New item draft state
  const [draftUrl, setDraftUrl] = useState('');
  const [draftStoragePath, setDraftStoragePath] = useState('');
  const [draftAltText, setDraftAltText] = useState('Client Feedback Screenshot');
  const [isVerifyingDraft, setIsVerifyingDraft] = useState(false);
  const [draftVerified, setDraftVerified] = useState<boolean | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggleGlobalVisibility = async () => {
    const next = !currentSettings.enabled;
    const ok = await updateFeedbackGallerySettings({ enabled: next });
    if (ok) {
      showToast('success', next ? 'Feedback Gallery is now LIVE on website.' : 'Feedback Gallery is now HIDDEN from website.');
    } else {
      showToast('error', 'Failed to update visibility.');
    }
  };

  const handleRatioChange = async (ratio: AspectRatioType) => {
    const ok = await updateFeedbackGallerySettings({ aspectRatio: ratio });
    if (ok) {
      showToast('success', `Global aspect ratio updated to ${ratio}.`);
    } else {
      showToast('error', 'Failed updating aspect ratio.');
    }
  };

  const handleSettingChange = async (key: keyof FeedbackGallerySettings, val: any) => {
    const ok = await updateFeedbackGallerySettings({ [key]: val });
    if (ok) {
      showToast('success', 'Setting updated & published to Supabase.');
    } else {
      showToast('error', 'Failed updating setting.');
    }
  };

  // Upload file from device
  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      showToast('success', `Uploading ${file.name} to Supabase Storage...`);
      const res = await feedbackGalleryService.uploadFeedbackImage(file);

      // Check duplicates
      const exists = (currentSettings.items || []).some((i) => i.imageUrl === res.url);
      if (exists) {
        showToast('error', 'This image URL is already in your Feedback Gallery.');
        setIsUploading(false);
        return;
      }

      const item = await addFeedbackItem({
        imageUrl: res.url,
        storagePath: res.path,
        aspectRatio: currentSettings.aspectRatio,
        published: true,
        visible: true,
        altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      });

      if (item) {
        showToast('success', `Added "${file.name}" to Feedback Gallery!`);
      } else {
        showToast('error', 'Failed adding item to database.');
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Replace item file upload
  const handleReplaceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replaceTargetId) return;

    try {
      setIsUploading(true);
      showToast('success', `Uploading replacement ${file.name}...`);
      const res = await feedbackGalleryService.uploadFeedbackImage(file);

      const ok = await updateFeedbackItem(replaceTargetId, {
        imageUrl: res.url,
        storagePath: res.path,
        altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      });

      if (ok) {
        showToast('success', 'Image replaced successfully.');
      } else {
        showToast('error', 'Failed replacing image.');
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Replacement upload failed.');
    } finally {
      setIsUploading(false);
      setReplaceTargetId(null);
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    }
  };

  // Add from URL or draft
  const handleAddDraft = async () => {
    if (!draftUrl.trim()) {
      showToast('error', 'Please enter an image URL or upload a file.');
      return;
    }

    const trimmed = draftUrl.trim();
    const exists = (currentSettings.items || []).some((i) => i.imageUrl === trimmed);
    if (exists) {
      showToast('error', 'This image is already in your Feedback Gallery.');
      return;
    }

    setIsVerifyingDraft(true);
    const check = await verifyMediaUrl(trimmed);
    setIsVerifyingDraft(false);

    if (!check.accessible) {
      showToast('error', `Cannot access image: ${check.error || 'Check the URL'}`);
      return;
    }

    const item = await addFeedbackItem({
      imageUrl: trimmed,
      storagePath: draftStoragePath || undefined,
      aspectRatio: currentSettings.aspectRatio,
      published: true,
      visible: true,
      altText: draftAltText || 'Client Feedback Screenshot',
    });

    if (item) {
      showToast('success', 'Feedback image added successfully!');
      setDraftUrl('');
      setDraftStoragePath('');
      setDraftAltText('Client Feedback Screenshot');
      setDraftVerified(null);
    } else {
      showToast('error', 'Failed to save item.');
    }
  };

  // Pick from Media Library
  const handleSelectFromMediaLibrary = async (asset: MediaAsset) => {
    setShowMediaPicker(false);

    if (pickerTargetIndex === null) {
      // Add new
      const exists = (currentSettings.items || []).some((i) => i.imageUrl === asset.url);
      if (exists) {
        showToast('error', 'This media asset is already in your Feedback Gallery.');
        return;
      }
      const item = await addFeedbackItem({
        imageUrl: asset.url,
        storagePath: asset.category ? `${asset.category}/${asset.name}` : undefined,
        aspectRatio: currentSettings.aspectRatio,
        published: true,
        visible: true,
        altText: asset.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      });
      if (item) {
        showToast('success', `Added "${asset.name}" from Media Library!`);
      }
    } else {
      // Replace existing
      const targetItem = currentSettings.items[pickerTargetIndex];
      if (targetItem) {
        await updateFeedbackItem(targetItem.id, {
          imageUrl: asset.url,
          storagePath: asset.category ? `${asset.category}/${asset.name}` : undefined,
          altText: asset.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        });
        showToast('success', `Replaced with "${asset.name}".`);
      }
      setPickerTargetIndex(null);
    }
  };

  // Reordering
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const items = [...currentSettings.items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    const orderedIds = items.map((i) => i.id);
    await reorderFeedbackItems(orderedIds);
  };

  const items = currentSettings.items || [];
  const publishedCount = items.filter((i) => i.published !== false && i.visible !== false).length;

  const ratioOptions: { id: AspectRatioType; label: string; desc: string; previewClass: string }[] = [
    { id: '1:1', label: '1:1 Square', desc: 'Default Instagram post / square chat box', previewClass: 'aspect-square' },
    { id: '4:5', label: '4:5 Portrait', desc: 'Instagram vertical feed screenshot', previewClass: 'aspect-[4/5]' },
    { id: '3:4', label: '3:4 Portrait', desc: 'Mobile message screenshot', previewClass: 'aspect-[3/4]' },
    { id: '9:16', label: '9:16 Vertical', desc: 'Full-screen mobile story / reel DM', previewClass: 'aspect-[9/16]' },
    { id: '4:3', label: '4:3 Landscape', desc: 'Tablet / desktop review preview', previewClass: 'aspect-[4/3]' },
    { id: '16:9', label: '16:9 Widescreen', desc: 'Horizontal desktop capture', previewClass: 'aspect-video' },
    { id: 'auto', label: 'Original / Auto', desc: 'Uncropped natural aspect ratio', previewClass: 'aspect-auto' },
  ];

  const sqlMigrationCode = `-- Run this in Supabase SQL Editor if you want dedicated PostgreSQL table storage:
CREATE TABLE IF NOT EXISTS public.feedback_gallery (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  aspect_ratio TEXT DEFAULT '1:1',
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  visible BOOLEAN DEFAULT true,
  alt_text TEXT DEFAULT 'Client Feedback Screenshot',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.feedback_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public visitors can view published feedback gallery"
  ON public.feedback_gallery FOR SELECT
  USING (published = true AND visible = true);

CREATE POLICY "Admins have full access to feedback gallery"
  ON public.feedback_gallery FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to feedback gallery"
  ON public.feedback_gallery FOR ALL TO anon
  USING (true) WITH CHECK (true);`;

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold backdrop-blur-md transition-all ${
            toast.type === 'success'
              ? 'bg-[#121A10] border-[#B1FF00]/40 text-[#B1FF00]'
              : 'bg-[#1C1212] border-red-500/40 text-red-400'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Banner / Master Controls */}
      <div className="p-6 rounded-2xl bg-[#0D0F10] border border-[#292E25] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#B1FF00]/10 border border-[#B1FF00]/20 text-[#B1FF00] text-[10px] font-mono uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Social Proof CMS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#F5F7F2] tracking-tight">
            TESTIMONIAL & FEEDBACK GALLERY
          </h2>
          <p className="text-xs sm:text-sm text-[#A7AEA0] max-w-2xl mt-1">
            Manage genuine client feedback screenshots (Instagram DMs, WhatsApp messages, client testimonials) displayed in an elegant, auto-scrolling marquee carousel on the public homepage.
          </p>
        </div>

        {/* Master ON/OFF Toggle Switch */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={handleToggleGlobalVisibility}
            className={`px-5 py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-lg cursor-pointer ${
              currentSettings.enabled
                ? 'bg-[#B1FF00] text-[#070809] shadow-[0_0_16px_rgba(177,255,0,0.3)] hover:bg-[#C4FF45]'
                : 'bg-[#181C16] text-[#737B6B] border border-[#292E25] hover:text-[#A7AEA0]'
            }`}
          >
            {currentSettings.enabled ? (
              <>
                <Eye className="w-4 h-4 text-[#070809]" />
                <span>GALLERY IS LIVE ON WEBSITE</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                <span>GALLERY IS HIDDEN (OFF)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-[#292E25] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'items'
              ? 'bg-[#B1FF00] text-[#070809] shadow-sm'
              : 'text-[#A7AEA0] hover:text-white bg-[#0D0F10] border border-[#292E25]'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Feedback Images ({items.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#B1FF00] text-[#070809] shadow-sm'
              : 'text-[#A7AEA0] hover:text-white bg-[#0D0F10] border border-[#292E25]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Carousel & Ratio Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('migration')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'migration'
              ? 'bg-[#B1FF00] text-[#070809] shadow-sm'
              : 'text-[#A7AEA0] hover:text-white bg-[#0D0F10] border border-[#292E25]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Supabase Schema</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: MANAGE FEEDBACK IMAGES                             */}
      {/* ========================================================= */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          {/* Add Feedback Image Panel */}
          <div className="p-6 rounded-2xl bg-[#0D0F10] border border-[#292E25] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#292E25] pb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#B1FF00]" />
                  <span>Add Feedback Screenshot</span>
                </h3>
                <p className="text-xs text-[#A7AEA0] mt-0.5">
                  Upload screenshot files (PNG, JPG, WEBP) directly to Supabase Storage or select from Media Library.
                </p>
              </div>

              {/* Upload Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={handleDeviceUpload}
                />

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#070809] bg-[#B1FF00] hover:bg-[#C4FF45] transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_12px_rgba(177,255,0,0.2)] disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload from Device</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPickerTargetIndex(null);
                    setShowMediaPicker(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#F5F7F2] bg-[#161B14] hover:bg-[#20271D] border border-[#292E25] transition-colors cursor-pointer flex items-center gap-2"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-[#B1FF00]" />
                  <span>Choose from Media Library</span>
                </button>
              </div>
            </div>

            {/* Direct URL input fallback */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-8">
                <label className="block text-[10px] font-mono uppercase text-[#A7AEA0] mb-1">
                  Or paste direct public HTTPS image URL:
                </label>
                <input
                  type="url"
                  value={draftUrl}
                  onChange={(e) => setDraftUrl(e.target.value)}
                  placeholder="https://gdwlkqrzcixjajzvcwvg.supabase.co/storage/v1/object/public/footazix-media/feedback/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#292E25] text-white text-xs font-mono focus:border-[#B1FF00] outline-none"
                />
              </div>

              <div className="md:col-span-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddDraft}
                  disabled={!draftUrl.trim() || isVerifyingDraft}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#181C16] text-[#F5F7F2] hover:bg-[#20271D] border border-[#292E25] hover:border-[#B1FF00]/50 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVerifyingDraft ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B1FF00]" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-[#B1FF00]" />
                      <span>Add to Gallery</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Gallery Items Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Current Gallery Images ({items.length})
                </h4>
                <span className="text-xs text-[#A7AEA0]">
                  {publishedCount} visible on public website • Previewing in {currentSettings.aspectRatio} ratio
                </span>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#0D0F10] border border-dashed border-[#292E25] space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#181C16] border border-[#292E25] flex items-center justify-center mx-auto text-[#737B6B]">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h5 className="text-sm font-bold text-[#F5F7F2]">No Feedback Images Uploaded Yet</h5>
                <p className="text-xs text-[#A7AEA0] max-w-sm mx-auto">
                  Upload client conversation screenshots (Instagram, WhatsApp, reviews) using the buttons above to showcase authentic social proof.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-[#0D0F10] border border-[#292E25] hover:border-[#B1FF00]/40 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    {/* Card Preview with Selected Global Ratio */}
                    <div className="relative w-full rounded-xl overflow-hidden bg-black border border-white/5 flex items-center justify-center">
                      <div className={`w-full ${currentSettings.aspectRatio === '1:1' ? 'aspect-square' : currentSettings.aspectRatio === '4:5' ? 'aspect-[4/5]' : currentSettings.aspectRatio === '9:16' ? 'aspect-[9/16]' : currentSettings.aspectRatio === '16:9' ? 'aspect-video' : 'aspect-square'}`}>
                        <img
                          src={item.imageUrl}
                          alt={item.altText || 'Client Feedback'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/branding/footazix-og-preview-v2.png';
                          }}
                        />
                      </div>

                      {/* Position Badge */}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur border border-white/10 text-[10px] font-mono text-[#B1FF00]">
                        #{idx + 1}
                      </span>

                      {/* Visibility Indicator */}
                      <button
                        type="button"
                        onClick={() => updateFeedbackItem(item.id, { visible: !item.visible })}
                        className={`absolute top-2 right-2 p-1.5 rounded-md backdrop-blur border transition-colors cursor-pointer ${
                          item.visible !== false
                            ? 'bg-black/70 text-[#B1FF00] border-[#B1FF00]/40'
                            : 'bg-black/70 text-zinc-500 border-white/10'
                        }`}
                        title={item.visible !== false ? 'Visible on website' : 'Hidden from website'}
                      >
                        {item.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-[#A7AEA0]">
                        <span className="truncate max-w-[150px] font-mono text-[10px]" title={item.imageUrl}>
                          {item.imageUrl.split('/').pop()}
                        </span>
                        <a
                          href={item.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#A7AEA0] hover:text-[#B1FF00] transition-colors p-1"
                          title="Open full image"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* Controls Toolbar */}
                      <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-[#292E25]">
                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, 'up')}
                          className="p-1.5 rounded-lg bg-[#181C16] hover:bg-[#20271D] text-[#A7AEA0] hover:text-white border border-[#292E25] flex items-center justify-center disabled:opacity-30 cursor-pointer"
                          title="Move Left / Earlier"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={idx === items.length - 1}
                          onClick={() => handleMove(idx, 'down')}
                          className="p-1.5 rounded-lg bg-[#181C16] hover:bg-[#20271D] text-[#A7AEA0] hover:text-white border border-[#292E25] flex items-center justify-center disabled:opacity-30 cursor-pointer"
                          title="Move Right / Later"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Replace Image */}
                        <button
                          type="button"
                          onClick={() => {
                            setPickerTargetIndex(idx);
                            setShowMediaPicker(true);
                          }}
                          className="p-1.5 rounded-lg bg-[#181C16] hover:bg-[#20271D] text-[#A7AEA0] hover:text-[#B1FF00] border border-[#292E25] flex items-center justify-center cursor-pointer"
                          title="Replace Image"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 rounded-lg bg-[#1C1212] hover:bg-red-950 text-red-400 border border-red-500/20 flex items-center justify-center cursor-pointer"
                          title="Delete screenshot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CAROUSEL & RATIO SETTINGS                          */}
      {/* ========================================================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Global Aspect Ratio Selector */}
          <div className="p-6 rounded-2xl bg-[#0D0F10] border border-[#292E25] space-y-4">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Global Aspect Ratio
              </h4>
              <p className="text-xs text-[#A7AEA0] mt-0.5">
                Sets the consistent dimension for all feedback cards in the carousel. Original files remain untouched.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {ratioOptions.map((opt) => {
                const isSelected = currentSettings.aspectRatio === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleRatioChange(opt.id)}
                    className={`p-4 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'bg-[#182214] border-[#B1FF00] shadow-[0_0_12px_rgba(177,255,0,0.15)]'
                        : 'bg-[#121613] border-[#292E25] hover:border-[#B1FF00]/40 text-[#A7AEA0]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-[#B1FF00]' : 'text-white'}`}>
                        {opt.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#B1FF00]" />}
                    </div>
                    <span className="text-[11px] text-[#737B6B] block leading-tight">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Motion & Carousel Speed Settings */}
          <div className="p-6 rounded-2xl bg-[#0D0F10] border border-[#292E25] space-y-6">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Carousel Motion & Animation
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Auto Scroll Toggle */}
              <div className="p-4 rounded-xl bg-[#121613] border border-[#292E25] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Automatic Continuous Scrolling</span>
                  <span className="text-[11px] text-[#A7AEA0]">Smooth marquee effect moving images continuously</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSettingChange('autoScroll', !currentSettings.autoScroll)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                    currentSettings.autoScroll !== false
                      ? 'bg-[#B1FF00] text-[#070809]'
                      : 'bg-[#1C201A] text-zinc-500 border border-white/10'
                  }`}
                >
                  {currentSettings.autoScroll !== false ? 'ENABLED' : 'PAUSED'}
                </button>
              </div>

              {/* Pause on Hover */}
              <div className="p-4 rounded-xl bg-[#121613] border border-[#292E25] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Pause / Slow on Hover</span>
                  <span className="text-[11px] text-[#A7AEA0]">Halts the marquee when cursor hovers over cards</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSettingChange('pauseOnHover', !currentSettings.pauseOnHover)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                    currentSettings.pauseOnHover !== false
                      ? 'bg-[#B1FF00] text-[#070809]'
                      : 'bg-[#1C201A] text-zinc-500 border border-white/10'
                  }`}
                >
                  {currentSettings.pauseOnHover !== false ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Direction */}
              <div className="p-4 rounded-xl bg-[#121613] border border-[#292E25] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Animation Direction</span>
                  <span className="text-[11px] text-[#A7AEA0]">Default is right-to-left</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSettingChange('direction', 'left')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      currentSettings.direction !== 'right'
                        ? 'bg-[#B1FF00] text-[#070809]'
                        : 'bg-black text-[#A7AEA0] border border-[#292E25]'
                    }`}
                  >
                    Right → Left
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSettingChange('direction', 'right')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      currentSettings.direction === 'right'
                        ? 'bg-[#B1FF00] text-[#070809]'
                        : 'bg-black text-[#A7AEA0] border border-[#292E25]'
                    }`}
                  >
                    Left → Right
                  </button>
                </div>
              </div>

              {/* Scroll Speed Slider */}
              <div className="p-4 rounded-xl bg-[#121613] border border-[#292E25] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Scroll Duration (Speed)</span>
                  <span className="text-xs font-mono text-[#B1FF00]">{currentSettings.scrollSpeed || 28}s</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="60"
                  step="2"
                  value={currentSettings.scrollSpeed || 28}
                  onChange={(e) => handleSettingChange('scrollSpeed', parseInt(e.target.value, 10))}
                  className="w-full accent-[#B1FF00] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#737B6B] font-mono">
                  <span>Fast (12s)</span>
                  <span>Balanced (28s)</span>
                  <span>Slow & Elegant (60s)</span>
                </div>
              </div>

              {/* Card Gap */}
              <div className="p-4 rounded-xl bg-[#121613] border border-[#292E25] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Card Spacing (Gap)</span>
                  <span className="text-xs font-mono text-[#B1FF00]">{currentSettings.cardGap ?? 20}px</span>
                </div>
                <div className="flex items-center gap-2">
                  {[12, 16, 20, 24, 32].map((gap) => (
                    <button
                      key={gap}
                      type="button"
                      onClick={() => handleSettingChange('cardGap', gap)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                        currentSettings.cardGap === gap
                          ? 'bg-[#B1FF00] text-[#070809]'
                          : 'bg-black text-[#A7AEA0] border border-[#292E25]'
                      }`}
                    >
                      {gap}px
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Corner Radius */}
              <div className="p-4 rounded-xl bg-[#121613] border border-[#292E25] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Card Corner Radius</span>
                  <span className="text-xs font-mono text-[#B1FF00]">{currentSettings.cardRadius ?? 16}px</span>
                </div>
                <div className="flex items-center gap-2">
                  {[8, 12, 16, 20, 24].map((rad) => (
                    <button
                      key={rad}
                      type="button"
                      onClick={() => handleSettingChange('cardRadius', rad)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                        currentSettings.cardRadius === rad
                          ? 'bg-[#B1FF00] text-[#070809]'
                          : 'bg-black text-[#A7AEA0] border border-[#292E25]'
                      }`}
                    >
                      {rad}px
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SUPABASE DATABASE SCHEMA MIGRATION                 */}
      {/* ========================================================= */}
      {activeTab === 'migration' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0D0F10] border border-[#292E25] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#B1FF00]" />
                  <span>Supabase Table Schema (`feedback_gallery`)</span>
                </h4>
                <p className="text-xs text-[#A7AEA0] mt-0.5">
                  The gallery is automatically active and backed up to Supabase Storage (`footazix-media/config/extended_cms_content.json`). For dedicated PostgreSQL table storage, execute this SQL in your Supabase SQL Editor.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(sqlMigrationCode);
                  setSqlCopied(true);
                  showToast('success', 'Copied SQL migration to clipboard.');
                  setTimeout(() => setSqlCopied(false), 2000);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#070809] bg-[#B1FF00] hover:bg-[#C4FF45] transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {sqlCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{sqlCopied ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-black border border-white/10 text-xs font-mono text-[#A7AEA0] overflow-x-auto leading-relaxed">
              {sqlMigrationCode}
            </pre>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: MEDIA LIBRARY PICKER                               */}
      {/* ========================================================= */}
      {showMediaPicker && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl bg-[#0D0F10] border border-[#292E25] shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-[#292E25] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Select Screenshot from Media Library
                </h4>
                <span className="text-xs text-[#A7AEA0]">Choose an image from existing Supabase Storage assets</span>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {media.filter((m) => m.type !== 'video' && !m.url.endsWith('.mp4')).map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => handleSelectFromMediaLibrary(asset)}
                  className="group/item relative rounded-xl overflow-hidden bg-black border border-[#292E25] hover:border-[#B1FF00] cursor-pointer aspect-square flex flex-col justify-between p-1.5 transition-all"
                >
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                    <span className="text-[10px] font-bold text-[#B1FF00] bg-black/80 px-2 py-1 rounded">
                      Select Image
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Safe Delete Modal */}
      {deleteConfirmId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        >
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0D0F10] border border-red-500/30 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-white">Delete Feedback Screenshot?</h4>
            <p className="text-xs text-[#A7AEA0] leading-relaxed">
              Are you sure you want to remove this feedback screenshot from the gallery? This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-[#181C16] border border-[#292E25]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteFeedbackItem(deleteConfirmId);
                  setDeleteConfirmId(null);
                  showToast('success', 'Item deleted safely.');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
