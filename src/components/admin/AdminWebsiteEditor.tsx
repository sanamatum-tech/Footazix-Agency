import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { WebsiteContent, NavItemConfig, RawToReadyStep } from '../../types';
import { mediaService } from '../../services/mediaService';
import {
  Globe2,
  Sparkles,
  Layers,
  BriefcaseBusiness,
  UsersRound,
  FolderKanban,
  PlaySquare,
  Flame,
  PanelBottom,
  ShieldCheck,
  PanelTop,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  Check,
  RefreshCw,
  HelpCircle,
  Copy,
  Share2,
  MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type EditorTab =
  | 'overview'
  | 'branding'
  | 'visibility'
  | 'header'
  | 'hero'
  | 'vsl'
  | 'portfolio'
  | 'about'
  | 'services'
  | 'team'
  | 'cta'
  | 'footer'
  | 'legal'
  | 'seo';

export const AdminWebsiteEditor: React.FC = () => {
  const { content, updateWebsiteContent, resetWebsiteContent, saveStatus, navigateToPublic } = useApp();
  const [formData, setFormData] = useState<WebsiteContent>(content);
  const [activeTab, setActiveTab] = useState<EditorTab>('overview');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState<string | null>(null);
  const [ogPreviewPlatform, setOgPreviewPlatform] = useState<'twitter' | 'whatsapp' | 'discord' | 'meta'>('twitter');
  const [copiedOgUrl, setCopiedOgUrl] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const appleTouchInputRef = useRef<HTMLInputElement>(null);
  const footerLogoInputRef = useRef<HTMLInputElement>(null);
  const ogImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(content);
  }, [content]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(content);

  const handleChange = (path: string, value: any) => {
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let current = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        if (current[parts[i]] === undefined || current[parts[i]] === null) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return copy;
    });
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetPath: string,
    folder: 'logos' | 'favicons' | 'branding'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAsset(targetPath);
      const res = await mediaService.uploadBrandAsset(file, folder);

      if (targetPath === 'brandingAssets.ogImage.url') {
        setFormData((prev) => {
          const next = JSON.parse(JSON.stringify(prev));
          if (!next.brandingAssets) next.brandingAssets = {};
          if (!next.brandingAssets.ogImage) next.brandingAssets.ogImage = {};
          next.brandingAssets.ogImage.url = res.url;
          next.brandingAssets.ogImage.width = res.width;
          next.brandingAssets.ogImage.height = res.height;
          next.brandingAssets.ogImage.type = res.type;

          if (!next.seo) next.seo = {};
          next.seo.ogImage = res.url;
          next.seo.ogImageWidth = res.width;
          next.seo.ogImageHeight = res.height;
          next.seo.ogImageType = res.type;
          return next;
        });
      } else {
        handleChange(targetPath, res.url);
      }
      setToastMessage({ type: 'success', text: `Uploaded ${file.name} to Supabase Storage.` });
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err?.message || 'Upload failed.' });
    } finally {
      setUploadingAsset(null);
      e.target.value = '';
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ok = await updateWebsiteContent(formData);
      if (ok) {
        setToastMessage({ type: 'success', text: 'All changes saved and synchronized to Supabase.' });
      } else {
        setToastMessage({ type: 'error', text: 'Unable to save changes to Supabase.' });
      }
    } catch {
      setToastMessage({ type: 'error', text: 'Unable to save changes.' });
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCancel = () => {
    setFormData(content);
    setToastMessage({ type: 'success', text: 'Changes discarded.' });
    setTimeout(() => setToastMessage(null), 2500);
  };

  const confirmReset = async () => {
    setIsResetConfirmOpen(false);
    try {
      await resetWebsiteContent();
      setToastMessage({ type: 'success', text: 'Reset to default website content successfully.' });
    } catch {
      setToastMessage({ type: 'error', text: 'Failed to reset content.' });
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reorder sections helper
  const moveSectionOrder = (index: number, direction: 'up' | 'down') => {
    const rawOrder = formData.sectionOrder || ['hero', 'system', 'portfolio', 'process', 'services', 'faq', 'about', 'finalCta'];
    const currentOrder = Array.from(new Set(rawOrder.map((s) => (s === 'team' ? 'about' : s))));
    if (!currentOrder.includes('faq')) {
      const sIdx = currentOrder.indexOf('services');
      if (sIdx !== -1) currentOrder.splice(sIdx + 1, 0, 'faq');
      else currentOrder.push('faq');
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;
    const temp = currentOrder[index];
    currentOrder[index] = currentOrder[targetIndex];
    currentOrder[targetIndex] = temp;
    handleChange('sectionOrder', currentOrder);
  };

  // Nav item management helpers
  const handleAddNavItem = () => {
    const currentItems = formData.header?.navItems || [];
    const newItem: NavItemConfig = {
      id: `nav-${Date.now()}`,
      label: 'New Link',
      href: '#',
      visible: true,
      order: currentItems.length + 1,
    };
    handleChange('header.navItems', [...currentItems, newItem]);
  };

  const handleRemoveNavItem = (id: string) => {
    const currentItems = formData.header?.navItems || [];
    handleChange('header.navItems', currentItems.filter((i) => i.id !== id));
  };

  const handleUpdateNavItem = (id: string, field: keyof NavItemConfig, val: any) => {
    const currentItems = formData.header?.navItems || [];
    const updated = currentItems.map((item) => (item.id === id ? { ...item, [field]: val } : item));
    handleChange('header.navItems', updated);
  };

  const tabs: { id: EditorTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: Globe2 },
    { id: 'branding', label: 'Branding & Assets', icon: ImageIcon },
    { id: 'visibility', label: 'Visibility & Order', icon: Eye },
    { id: 'header', label: 'Header & Nav', icon: PanelTop },
    { id: 'hero', label: 'Hero', icon: Sparkles },
    { id: 'vsl', label: 'System (VSL)', icon: PlaySquare },
    { id: 'portfolio', label: 'Portfolio', icon: FolderKanban },
    { id: 'about', label: 'Process', icon: Layers },
    { id: 'services', label: 'Services', icon: BriefcaseBusiness },
    { id: 'team', label: 'About & Team', icon: UsersRound },
    { id: 'cta', label: 'Final CTA', icon: Flame },
    { id: 'footer', label: 'Footer', icon: PanelBottom },
    { id: 'legal', label: 'Legal Pages', icon: ShieldCheck },
    { id: 'seo', label: 'SEO & Metadata', icon: Search },
  ];

  const sectionLabels: Record<string, string> = {
    hero: 'Hero Section',
    system: 'The Footazix System (VSL)',
    portfolio: 'Selected Work / Portfolio',
    process: 'Raw → Edit → Ready (Process)',
    services: 'Services Grid',
    faq: 'Frequently Asked Questions (FAQ)',
    about: 'About & Team Section',
    finalCta: 'Final Call To Action',
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl mx-auto pb-16 font-sans">
      {/* Sticky Header with Save, Unsaved Indicator, and View Live Website */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#090910] border border-white/10 sticky top-20 z-20 backdrop-blur-md bg-[#090910]/95 shadow-xl">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-display font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Full Website CMS Control System</span>
              {hasUnsavedChanges && (
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" title="Unsaved changes pending" />
              )}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {hasUnsavedChanges ? (
                <span className="text-blue-400 font-medium">Unsaved changes pending — Click Save Changes below</span>
              ) : (
                <span>All website modules synchronized with Supabase</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={navigateToPublic}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#12121c] border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Open Live Public Website"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
          </button>

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-[#12121c] border border-white/10 transition-colors"
            title="Reset to defaults"
            aria-label="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#12121c] border border-white/10 transition-colors cursor-pointer"
            >
              Discard
            </button>
          )}

          <button
            type="submit"
            disabled={saveStatus === 'saving' || !hasUnsavedChanges}
            className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_16px_rgba(37,99,235,0.3)] cursor-pointer flex items-center gap-2"
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>SAVING...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>SAVE CHANGES</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600/15 text-white border border-blue-500/40 shadow-[0_0_12px_rgba(37,99,235,0.15)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-zinc-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
              toastMessage.type === 'success'
                ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                : 'bg-red-950/40 border-red-500/40 text-red-200'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Content Body */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#090910] border border-white/10 space-y-8">
        {/* ========================================================================= */}
        {/* TAB 0: OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-5">
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1">
                CMS System Overview
              </h3>
              <p className="text-xs text-zinc-400">
                Welcome to the Footazix Full Website Content Management System. You have complete control over all branding assets, texts, navigation, visibility, and section order without editing code.
              </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => setActiveTab('branding')}
                className="p-5 rounded-xl bg-[#12121c] border border-white/5 hover:border-blue-500/40 transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Branding & Logo</h4>
                <p className="text-xs text-zinc-400">
                  Upload & replace your Header Logo, Favicon, and OG Image stored in Supabase.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('visibility')}
                className="p-5 rounded-xl bg-[#12121c] border border-white/5 hover:border-blue-500/40 transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Eye className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Section Visibility</h4>
                <p className="text-xs text-zinc-400">
                  Toggle any public website section on/off with zero leftover empty vertical space.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('header')}
                className="p-5 rounded-xl bg-[#12121c] border border-white/5 hover:border-blue-500/40 transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <PanelTop className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Header & Navigation</h4>
                <p className="text-xs text-zinc-400">
                  Customize public navigation labels, buttons, links, and social integrations.
                </p>
              </div>
            </div>

            {/* Quick Section Switch Board */}
            <div className="p-5 rounded-xl bg-[#12121c] border border-white/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Quick Public Website Visibility Switches
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries({
                  header: 'Header',
                  hero: 'Hero',
                  system: 'System (VSL)',
                  portfolio: 'Portfolio',
                  process: 'Process',
                  services: 'Services',
                  about: 'About / Team',
                  finalCta: 'Final CTA',
                  footer: 'Footer',
                  instagram: 'Instagram',
                }).map(([key, label]) => {
                  const isVisible = (formData.sectionVisibility as any)?.[key] !== false;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleChange(`sectionVisibility.${key}`, !isVisible)}
                      className={`p-2.5 rounded-lg border text-left flex items-center justify-between text-xs font-medium cursor-pointer transition-all ${
                        isVisible
                          ? 'bg-blue-600/10 border-blue-500/40 text-blue-200'
                          : 'bg-zinc-900/60 border-white/5 text-zinc-500 line-through'
                      }`}
                    >
                      <span>{label}</span>
                      {isVisible ? (
                        <Check className="w-3.5 h-3.5 text-blue-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: BRANDING & ASSETS */}
        {/* ========================================================================= */}
        {activeTab === 'branding' && (
          <div className="space-y-8">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1">
                Brand Asset Management
              </h3>
              <p className="text-xs text-zinc-400">
                Upload and replace official brand assets. All assets are uploaded directly to Supabase Storage (<span className="text-blue-400 font-mono">footazix-media</span>) and load dynamically on the public site.
              </p>
            </div>

            {/* 1. HEADER LOGO */}
            <div className="p-6 rounded-2xl bg-[#0e0e18] border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>HEADER LOGO</span>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      Supabase Storage
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Controls the primary brand logo displayed in the website navigation bar.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-zinc-400 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.brandingAssets?.headerLogo?.visible !== false}
                      onChange={(e) => handleChange('brandingAssets.headerLogo.visible', e.target.checked)}
                      className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Visible in Header</span>
                  </label>
                </div>
              </div>

              {/* Logo Preview Stage with Dark & Checkerboard Contrast */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 p-6 rounded-xl bg-[#050508] border border-white/10 flex flex-col items-center justify-center min-h-[160px] text-center relative overflow-hidden">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest absolute top-2.5 left-3">
                    LIVE PREVIEW
                  </span>

                  {formData.brandingAssets?.headerLogo?.visible === false ? (
                    <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <EyeOff className="w-4 h-4" />
                      <span>Logo is currently hidden</span>
                    </div>
                  ) : !formData.brandingAssets?.headerLogo?.url ? (
                    <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <span>No logo uploaded yet</span>
                    </div>
                  ) : (
                    <img
                      src={formData.brandingAssets.headerLogo.url}
                      alt={formData.brandingAssets?.headerLogo?.alt || 'Footazix Logo'}
                      className="max-h-14 object-contain transition-all"
                      style={{
                        width: `${formData.brandingAssets?.headerLogo?.desktopWidth || 130}px`,
                      }}
                    />
                  )}
                </div>

                <div className="md:col-span-7 space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Logo Storage URL / Path
                    </label>
                    <input
                      type="text"
                      value={formData.brandingAssets?.headerLogo?.url || ''}
                      onChange={(e) => handleChange('brandingAssets.headerLogo.url', e.target.value)}
                      placeholder="https://gdwlkqrzcixjajzvcwvg.supabase.co/storage/v1/object/public/footazix-media/logos/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <input
                      type="file"
                      ref={logoInputRef}
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'brandingAssets.headerLogo.url', 'logos')}
                    />

                    <button
                      type="button"
                      disabled={uploadingAsset === 'brandingAssets.headerLogo.url'}
                      onClick={() => logoInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {uploadingAsset === 'brandingAssets.headerLogo.url' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>UPLOADING TO SUPABASE...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>{formData.brandingAssets?.headerLogo?.url ? 'REPLACE LOGO' : 'UPLOAD NEW LOGO'}</span>
                        </>
                      )}
                    </button>

                    {formData.brandingAssets?.headerLogo?.url && (
                      <button
                        type="button"
                        onClick={() => {
                          handleChange('brandingAssets.headerLogo.url', '');
                          setToastMessage({ type: 'success', text: 'Logo URL cleared.' });
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-red-400 bg-[#12121c] border border-white/10 transition-colors cursor-pointer"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Logo Dimensions & Sizing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={formData.brandingAssets?.headerLogo?.alt || ''}
                    onChange={(e) => handleChange('brandingAssets.headerLogo.alt', e.target.value)}
                    placeholder="Footazix Creative Agency"
                    className="w-full px-4 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Desktop Width (px): {formData.brandingAssets?.headerLogo?.desktopWidth || 155}px
                  </label>
                  <input
                    type="range"
                    min="80"
                    max="260"
                    step="5"
                    value={formData.brandingAssets?.headerLogo?.desktopWidth || 155}
                    onChange={(e) => handleChange('brandingAssets.headerLogo.desktopWidth', parseInt(e.target.value, 10))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Mobile Width (px): {formData.brandingAssets?.headerLogo?.mobileWidth || 125}px
                  </label>
                  <input
                    type="range"
                    min="70"
                    max="180"
                    step="5"
                    value={formData.brandingAssets?.headerLogo?.mobileWidth || 125}
                    onChange={(e) => handleChange('brandingAssets.headerLogo.mobileWidth', parseInt(e.target.value, 10))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 2. FAVICON MANAGEMENT */}
            <div className="p-6 rounded-2xl bg-[#0e0e18] border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>FAVICON & APP ICONS</span>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      Dynamic &lt;head&gt;
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Controls the browser tab icon and iOS bookmark icon. Loads dynamically with zero hardcoded fallbacks.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-zinc-400 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.brandingAssets?.favicon?.visible !== false}
                      onChange={(e) => handleChange('brandingAssets.favicon.visible', e.target.checked)}
                      className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Favicon Active</span>
                  </label>
                </div>
              </div>

              {/* Simulated Browser Tab Live Preview */}
              <div className="p-4 rounded-xl bg-[#050508] border border-white/10 space-y-3">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                  BROWSER TAB PREVIEW
                </span>
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-t-xl bg-[#1a1a26] border-t border-x border-white/10 shadow-lg text-xs max-w-xs truncate">
                    {formData.brandingAssets?.favicon?.visible === false ? (
                      <span className="w-4 h-4 rounded-full border border-dashed border-zinc-600 flex items-center justify-center text-[8px] text-zinc-600">
                        ∅
                      </span>
                    ) : !formData.brandingAssets?.favicon?.url ? (
                      <Globe2 className="w-4 h-4 text-zinc-500 shrink-0" />
                    ) : (
                      <img
                        src={formData.brandingAssets.favicon.url}
                        alt="Tab Favicon"
                        className="w-4 h-4 object-contain shrink-0"
                      />
                    )}
                    <span className="text-zinc-200 font-medium truncate">
                      {formData.seo?.siteTitle || formData.brand?.name || 'Footazix — Content Growth Agency'}
                    </span>
                    <span className="text-zinc-500 hover:text-zinc-300 ml-auto pl-1 cursor-default text-[10px]">
                      ✕
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Standard Browser Favicon */}
                <div className="p-5 rounded-xl bg-[#12121c] border border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-black border border-white/10 flex items-center justify-center p-2.5 shrink-0 overflow-hidden">
                      {formData.brandingAssets?.favicon?.visible === false ? (
                        <div className="text-[10px] text-zinc-600 font-mono text-center">OFF</div>
                      ) : !formData.brandingAssets?.favicon?.url ? (
                        <div className="text-[10px] text-zinc-500 font-mono text-center">NONE</div>
                      ) : (
                        <img
                          src={formData.brandingAssets.favicon.url}
                          alt="Favicon preview"
                          className="w-8 h-8 object-contain"
                        />
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">Browser Favicon</h5>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">
                        Supports .ico, .png, .svg, .webp (uploads to Supabase Storage)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                      Favicon Storage URL
                    </label>
                    <input
                      type="text"
                      value={formData.brandingAssets?.favicon?.url || ''}
                      onChange={(e) => handleChange('brandingAssets.favicon.url', e.target.value)}
                      placeholder="https://gdwlkqrzcixjajzvcwvg.supabase.co/storage/v1/object/public/footazix-media/favicons/..."
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-white text-xs font-mono focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={faviconInputRef}
                      accept="image/png,image/svg+xml,image/x-icon,image/webp,image/vnd.microsoft.icon"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'brandingAssets.favicon.url', 'favicons')}
                    />

                    <button
                      type="button"
                      disabled={uploadingAsset === 'brandingAssets.favicon.url'}
                      onClick={() => faviconInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {uploadingAsset === 'brandingAssets.favicon.url' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>{formData.brandingAssets?.favicon?.url ? 'Replace Favicon' : 'Upload Favicon'}</span>
                        </>
                      )}
                    </button>

                    {formData.brandingAssets?.favicon?.url && (
                      <button
                        type="button"
                        onClick={() => {
                          handleChange('brandingAssets.favicon.url', '');
                          setToastMessage({ type: 'success', text: 'Favicon removed.' });
                        }}
                        className="px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        handleChange('brandingAssets.favicon.url', '/favicon.png');
                        setToastMessage({ type: 'success', text: 'Reset favicon to official asset.' });
                      }}
                      className="px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-black border border-white/10 transition-colors cursor-pointer"
                    >
                      Reset Default
                    </button>
                  </div>
                </div>

                {/* Apple Touch Icon */}
                <div className="p-5 rounded-xl bg-[#12121c] border border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center p-2.5 shrink-0 overflow-hidden shadow-inner">
                      {!formData.brandingAssets?.favicon?.appleTouchIconUrl ? (
                        <div className="text-[10px] text-zinc-500 font-mono text-center">AUTO</div>
                      ) : (
                        <img
                          src={formData.brandingAssets.favicon.appleTouchIconUrl}
                          alt="Apple Touch Icon"
                          className="w-9 h-9 object-contain rounded-lg"
                        />
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">Apple / Touch Icon</h5>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">
                        iOS home screen and bookmark icon (180x180 PNG)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                      Touch Icon Storage URL
                    </label>
                    <input
                      type="text"
                      value={formData.brandingAssets?.favicon?.appleTouchIconUrl || ''}
                      onChange={(e) => handleChange('brandingAssets.favicon.appleTouchIconUrl', e.target.value)}
                      placeholder="https://...supabase.co/.../favicons/..."
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-white text-xs font-mono focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={appleTouchInputRef}
                      accept="image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'brandingAssets.favicon.appleTouchIconUrl', 'favicons')}
                    />

                    <button
                      type="button"
                      disabled={uploadingAsset === 'brandingAssets.favicon.appleTouchIconUrl'}
                      onClick={() => appleTouchInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {uploadingAsset === 'brandingAssets.favicon.appleTouchIconUrl' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>{formData.brandingAssets?.favicon?.appleTouchIconUrl ? 'Replace Icon' : 'Upload Touch Icon'}</span>
                        </>
                      )}
                    </button>

                    {formData.brandingAssets?.favicon?.appleTouchIconUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          handleChange('brandingAssets.favicon.appleTouchIconUrl', '');
                          setToastMessage({ type: 'success', text: 'Touch icon cleared.' });
                        }}
                        className="px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        handleChange('brandingAssets.favicon.appleTouchIconUrl', '/apple-touch-icon.png');
                        setToastMessage({ type: 'success', text: 'Reset apple touch icon to default.' });
                      }}
                      className="px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-black border border-white/10 transition-colors cursor-pointer"
                    >
                      Reset Default
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. FOOTER LOGO */}
            <div className="p-6 rounded-2xl bg-[#0e0e18] border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">FOOTER LOGO</h4>
                  <p className="text-[11px] text-zinc-400">Controls the branding mark displayed in the website footer</p>
                </div>
                <label className="text-xs text-zinc-400 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.brandingAssets?.footerLogo?.visible !== false}
                    onChange={(e) => handleChange('brandingAssets.footerLogo.visible', e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-blue-600 cursor-pointer"
                  />
                  <span>Visible</span>
                </label>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#12121c] border border-white/5">
                <div>
                  <span className="text-xs font-semibold text-white block">Mirror Header Logo Automatically</span>
                  <span className="text-[11px] text-zinc-400">Keeps the footer logo in perfect sync with the header brand asset</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.brandingAssets?.footerLogo?.useHeaderLogo !== false}
                  onChange={(e) => handleChange('brandingAssets.footerLogo.useHeaderLogo', e.target.checked)}
                  className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-blue-600 cursor-pointer"
                />
              </div>

              {formData.brandingAssets?.footerLogo?.useHeaderLogo === false && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Custom Footer Logo Storage URL</label>
                    <input
                      type="text"
                      value={formData.brandingAssets?.footerLogo?.url || ''}
                      onChange={(e) => handleChange('brandingAssets.footerLogo.url', e.target.value)}
                      placeholder="https://...supabase.co/.../logos/custom-footer-logo.png"
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-white text-xs font-mono outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={footerLogoInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'brandingAssets.footerLogo.url', 'logos')}
                    />

                    <button
                      type="button"
                      disabled={uploadingAsset === 'brandingAssets.footerLogo.url'}
                      onClick={() => footerLogoInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Custom Footer Logo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. UNIVERSAL SOCIAL SHARING / OPEN GRAPH (OG) IMAGE */}
            <div className="p-6 rounded-2xl bg-[#0e0e18] border border-blue-500/20 shadow-xl space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
                      SINGLE SOURCE OF TRUTH
                    </span>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      UNIVERSAL SOCIAL SHARING / OG IMAGE
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                    This single image serves as the universal preview card whenever <span className="text-blue-400 font-mono">https://footazix.site/</span> is shared on <strong className="text-zinc-200">WhatsApp, X / Twitter, Discord, Slack, iMessage, LinkedIn, Telegram, and Facebook</strong>. It generates full OpenGraph and Twitter Card metadata.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Supabase Storage Active
                  </span>
                </div>
              </div>

              {/* Main 2-Column Section: Left Mockup Preview, Right Image Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Live Platform Social Card Preview Mockup (7 cols) */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Share2 className="w-3.5 h-3.5 text-blue-400" />
                      Live Social Card Preview
                    </label>

                    {/* Platform Selector Tabs */}
                    <div className="flex items-center gap-1 bg-[#12121c] p-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => setOgPreviewPlatform('twitter')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          ogPreviewPlatform === 'twitter'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        𝕏 / Twitter
                      </button>
                      <button
                        type="button"
                        onClick={() => setOgPreviewPlatform('whatsapp')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          ogPreviewPlatform === 'whatsapp'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => setOgPreviewPlatform('discord')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          ogPreviewPlatform === 'discord'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Discord
                      </button>
                      <button
                        type="button"
                        onClick={() => setOgPreviewPlatform('meta')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          ogPreviewPlatform === 'meta'
                            ? 'bg-zinc-700 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Raw Meta
                      </button>
                    </div>
                  </div>

                  {/* Mockup Card Container */}
                  <div className="p-4 rounded-2xl bg-black border border-white/10 relative overflow-hidden">
                    {/* Twitter Card Mockup */}
                    {ogPreviewPlatform === 'twitter' && (
                      <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-white/15 bg-[#0b0e14] shadow-2xl">
                        <div className="relative aspect-[1.91/1] w-full bg-zinc-950 overflow-hidden">
                          <img
                            src={formData.brandingAssets?.ogImage?.url || 'https://gdwlkqrzcixjajzvcwvg.supabase.co/storage/v1/object/public/footazix-media/branding/1790997433105_1001608268.png'}
                            alt={formData.brandingAssets?.ogImage?.alt || 'OG Preview'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/branding/footazix-og-default.png';
                            }}
                          />
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur text-[10px] font-mono text-zinc-300">
                            footazix.site
                          </span>
                        </div>
                        <div className="p-3.5 space-y-1">
                          <span className="text-[11px] text-zinc-500 font-mono block">footazix.site</span>
                          <h5 className="text-sm font-bold text-white line-clamp-1">
                            {formData.seo?.ogTitle || formData.seo?.siteTitle || 'Footazix — Turn Raw Footage Into Content Worth Watching'}
                          </h5>
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {formData.seo?.ogDescription || formData.seo?.metaDescription || 'Turning raw footage into content worth watching. High-retention video editing and creative growth.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* WhatsApp Mockup */}
                    {ogPreviewPlatform === 'whatsapp' && (
                      <div className="max-w-md mx-auto space-y-2">
                        <div className="flex justify-end">
                          <div className="max-w-sm rounded-2xl rounded-tr-none bg-[#0b3b2c] p-2.5 shadow-xl text-white space-y-2 border border-emerald-500/20">
                            <div className="rounded-xl overflow-hidden border border-black/20 bg-black aspect-[1.91/1]">
                              <img
                                src={formData.brandingAssets?.ogImage?.url || 'https://gdwlkqrzcixjajzvcwvg.supabase.co/storage/v1/object/public/footazix-media/branding/1790997433105_1001608268.png'}
                                alt="WhatsApp link preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-1">
                              <h5 className="text-xs font-bold text-white line-clamp-1">
                                {formData.seo?.ogTitle || formData.seo?.siteTitle || 'Footazix — Turn Raw Footage Into Content Worth Watching'}
                              </h5>
                              <p className="text-[11px] text-emerald-100/70 line-clamp-2 leading-relaxed">
                                {formData.seo?.ogDescription || formData.seo?.metaDescription || 'Turning raw footage into content worth watching.'}
                              </p>
                              <span className="text-[10px] text-emerald-300 font-mono block mt-1">footazix.site</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-emerald-200/50">12:45 PM • Read</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Discord Mockup */}
                    {ogPreviewPlatform === 'discord' && (
                      <div className="max-w-md mx-auto rounded-xl bg-[#2b2d31] p-3.5 border-l-4 border-blue-500 space-y-2 shadow-xl">
                        <span className="text-[11px] font-semibold text-blue-400 block font-mono">FOOTAZIX</span>
                        <h5 className="text-xs font-bold text-white hover:underline cursor-pointer">
                          {formData.seo?.ogTitle || formData.seo?.siteTitle || 'Footazix — Turn Raw Footage Into Content Worth Watching'}
                        </h5>
                        <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
                          {formData.seo?.ogDescription || formData.seo?.metaDescription || 'High-retention video editing and creative growth for modern creators.'}
                        </p>
                        <div className="rounded-lg overflow-hidden border border-black/30 aspect-[1.91/1] w-full">
                          <img
                            src={formData.brandingAssets?.ogImage?.url || 'https://gdwlkqrzcixjajzvcwvg.supabase.co/storage/v1/object/public/footazix-media/branding/1790997433105_1001608268.png'}
                            alt="Discord preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {/* Raw Meta Tags Inspector */}
                    {ogPreviewPlatform === 'meta' && (
                      <div className="font-mono text-[11px] bg-black/90 p-3.5 rounded-xl border border-white/10 text-zinc-300 space-y-1 overflow-x-auto max-h-56">
                        <p className="text-blue-400 font-semibold mb-2">// Universal OpenGraph & Twitter Card Metadata</p>
                        <p><span className="text-pink-400">&lt;meta</span> <span className="text-yellow-300">property</span>=<span className="text-emerald-300">"og:type"</span> <span className="text-yellow-300">content</span>=<span className="text-emerald-300">"website"</span> <span className="text-pink-400">/&gt;</span></p>
                        <p><span className="text-pink-400">&lt;meta</span> <span className="text-yellow-300">property</span>=<span className="text-emerald-300">"og:url"</span> <span className="text-yellow-300">content</span>=<span className="text-emerald-300">"{formData.seo?.canonicalUrl || 'https://footazix.site'}"</span> <span className="text-pink-400">/&gt;</span></p>
                        <p><span className="text-pink-400">&lt;meta</span> <span className="text-yellow-300">property</span>=<span className="text-emerald-300">"og:site_name"</span> <span className="text-yellow-300">content</span>=<span className="text-emerald-300">"{formData.brand?.name || 'FOOTAZIX'}"</span> <span className="text-pink-400">/&gt;</span></p>
                        <p><span className="text-pink-400">&lt;meta</span> <span className="text-yellow-300">property</span>=<span className="text-emerald-300">"og:image"</span> <span className="text-yellow-300">content</span>=<span className="text-emerald-300">"{formData.brandingAssets?.ogImage?.url || ''}"</span> <span className="text-pink-400">/&gt;</span></p>
                        <p><span className="text-pink-400">&lt;meta</span> <span className="text-yellow-300">property</span>=<span className="text-emerald-300">"og:image:width"</span> <span className="text-yellow-300">content</span>=<span className="text-emerald-300">"{formData.brandingAssets?.ogImage?.width || 1734}"</span> <span className="text-pink-400">/&gt;</span></p>
                        <p><span className="text-pink-400">&lt;meta</span> <span className="text-yellow-300">property</span>=<span className="text-emerald-300">"og:image:height"</span> <span className="text-yellow-300">content</span>=<span className="text-emerald-300">"{formData.brandingAssets?.ogImage?.height || 907}"</span> <span className="text-pink-400">/&gt;</span></p>
                        <p><span className="text-pink-400">&lt;meta</span> <span className="text-yellow-300">name</span>=<span className="text-emerald-300">"twitter:card"</span> <span className="text-yellow-300">content</span>=<span className="text-emerald-300">"summary_large_image"</span> <span className="text-pink-400">/&gt;</span></p>
                        <p><span className="text-pink-400">&lt;meta</span> <span className="text-yellow-300">name</span>=<span className="text-emerald-300">"twitter:image"</span> <span className="text-yellow-300">content</span>=<span className="text-emerald-300">"{formData.brandingAssets?.ogImage?.url || ''}"</span> <span className="text-pink-400">/&gt;</span></p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Controls, Upload, Specs, Actions (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* File Upload Trigger */}
                  <input
                    type="file"
                    ref={ogImageInputRef}
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'brandingAssets.ogImage.url', 'branding')}
                  />

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={uploadingAsset === 'brandingAssets.ogImage.url'}
                      onClick={() => ogImageInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
                    >
                      {uploadingAsset === 'brandingAssets.ogImage.url' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading to Supabase...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload / Replace OG Image</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const url = formData.brandingAssets?.ogImage?.url || '';
                        if (url) {
                          navigator.clipboard.writeText(url);
                          setCopiedOgUrl(true);
                          setToastMessage({ type: 'success', text: 'Copied image URL to clipboard.' });
                          setTimeout(() => setCopiedOgUrl(false), 2000);
                        }
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#12121c] border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {copiedOgUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedOgUrl ? 'Copied' : 'Copy URL'}</span>
                    </button>

                    {formData.brandingAssets?.ogImage?.url && (
                      <a
                        href={formData.brandingAssets.ogImage.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#12121c] border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Asset</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const fallbackUrl = 'https://footazix.site/assets/branding/footazix-og-default.png';
                        setFormData((prev) => {
                          const next = JSON.parse(JSON.stringify(prev));
                          if (!next.brandingAssets) next.brandingAssets = {};
                          next.brandingAssets.ogImage = {
                            url: fallbackUrl,
                            alt: 'Footazix Content Growth Agency',
                            width: 1200,
                            height: 630,
                            type: 'image/png',
                          };
                          if (!next.seo) next.seo = {};
                          next.seo.ogImage = fallbackUrl;
                          next.seo.ogImageAlt = 'Footazix Content Growth Agency';
                          next.seo.ogImageWidth = 1200;
                          next.seo.ogImageHeight = 630;
                          next.seo.ogImageType = 'image/png';
                          return next;
                        });
                        setToastMessage({ type: 'success', text: 'Reset OG image to default Footazix brand asset.' });
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-red-400 bg-[#12121c] border border-white/10 transition-colors cursor-pointer"
                    >
                      Reset to Default
                    </button>
                  </div>

                  {/* Permanent Supabase Storage Public HTTPS URL Field */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Current Storage Public HTTPS URL
                    </label>
                    <input
                      type="text"
                      value={formData.brandingAssets?.ogImage?.url || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => {
                          const next = JSON.parse(JSON.stringify(prev));
                          if (!next.brandingAssets) next.brandingAssets = {};
                          if (!next.brandingAssets.ogImage) next.brandingAssets.ogImage = {};
                          next.brandingAssets.ogImage.url = val;
                          if (!next.seo) next.seo = {};
                          next.seo.ogImage = val;
                          return next;
                        });
                      }}
                      placeholder="https://gdwlkqrzcixjajzvcwvg.supabase.co/storage/v1/object/public/footazix-media/branding/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white text-xs font-mono focus:border-blue-500 outline-none"
                    />
                  </div>

                  {/* Alt Text Field */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Image Alt Text (og:image:alt & twitter:image:alt)
                    </label>
                    <input
                      type="text"
                      value={formData.brandingAssets?.ogImage?.alt || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => {
                          const next = JSON.parse(JSON.stringify(prev));
                          if (!next.brandingAssets) next.brandingAssets = {};
                          if (!next.brandingAssets.ogImage) next.brandingAssets.ogImage = {};
                          next.brandingAssets.ogImage.alt = val;
                          if (!next.seo) next.seo = {};
                          next.seo.ogImageAlt = val;
                          return next;
                        });
                      }}
                      placeholder="Footazix Content Growth Agency"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white text-xs focus:border-blue-500 outline-none"
                    />
                  </div>

                  {/* Metadata Specs & Standards Card */}
                  <div className="p-3.5 rounded-xl bg-[#12121c] border border-white/5 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Dimensions:</span>
                      <span className="font-mono text-white font-semibold">
                        {formData.brandingAssets?.ogImage?.width || 1734} × {formData.brandingAssets?.ogImage?.height || 907} px
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>File Format:</span>
                      <span className="font-mono text-white font-semibold">
                        {formData.brandingAssets?.ogImage?.type || 'image/png'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Protocol:</span>
                      <span className="font-mono text-emerald-400 font-semibold">Absolute HTTPS</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Twitter Format:</span>
                      <span className="font-mono text-blue-400 font-semibold">summary_large_image</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: VISIBILITY & ORDER */}
        {/* ========================================================================= */}
        {activeTab === 'visibility' && (
          <div className="space-y-8">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1">
                Website Visibility & Section Ordering
              </h3>
              <p className="text-xs text-zinc-400">
                Turn any section ON or OFF with one click. When turned OFF, the section completely disappears from the public website with zero leftover gap. Reorder major sections to customize your homepage layout.
              </p>
            </div>

            {/* Global Section Visibility List */}
            <div className="p-6 rounded-2xl bg-[#0e0e18] border border-white/10 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Module Visibility Toggles
              </h4>

              <div className="divide-y divide-white/5">
                {[
                  { key: 'header', label: 'Header', desc: 'Top sticky navigation bar, brand logo, links, and action button.' },
                  { key: 'hero', label: 'Hero', desc: 'Main headline, badges, 3D interactive sculpture, and hero call-to-actions.' },
                  { key: 'system', label: 'System / VSL', desc: 'The Footazix System video player showcase, player controls, and reel.' },
                  { key: 'portfolio', label: 'Portfolio', desc: 'Selected Work gallery with category filters, aspect ratio video, and project cards.' },
                  { key: 'process', label: 'Process / About', desc: 'Raw → Edit → Ready three-stage content transformation pipeline strip.' },
                  { key: 'services', label: 'Services', desc: 'Core service cards with feature breakdowns, highlights, and CTAs.' },
                  { key: 'faq', label: 'FAQ', desc: 'Interactive frequently asked questions accordion module.' },
                  { key: 'team', label: 'Team', desc: 'Active team member cards, roles, photos, and social links.' },
                  { key: 'about', label: 'About & Philosophy', desc: 'Creator philosophy statement and agency story copy.' },
                  { key: 'finalCta', label: 'Final CTA', desc: 'Bottom high-conversion upgrade banner and action prompt.' },
                  { key: 'footer', label: 'Footer', desc: 'Bottom brand summary, copyright, legal links, and owner login.' },
                  { key: 'instagram', label: 'Instagram button', desc: 'Global Instagram social buttons across header, final CTA, and footer.' },
                  { key: 'startProjectModal', label: 'Start / Build Project CTA', desc: 'Primary "Build with Footazix" / "Start Project" action buttons and project modal.' },
                ].map((item) => {
                  const isVisible = (formData.sectionVisibility as any)?.[item.key] !== false;
                  return (
                    <div
                      key={item.key}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <span className="text-sm font-bold text-white block">{item.label}</span>
                        <span className="text-xs text-zinc-400 block mt-0.5">{item.desc}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleChange(`sectionVisibility.${item.key}`, !isVisible)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
                          isVisible
                            ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                            : 'bg-[#12121c] text-zinc-500 border border-white/10 hover:text-zinc-300'
                        }`}
                      >
                        {isVisible ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>VISIBLE</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>HIDDEN</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Display Order Management */}
            <div className="p-6 rounded-2xl bg-[#0e0e18] border border-white/10 space-y-4">
              <div className="border-b border-white/10 pb-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Homepage Section Display Order
                </h4>
                <p className="text-xs text-zinc-400">
                  Arrange the order in which sections appear as visitors scroll down the public homepage.
                </p>
              </div>

              <div className="space-y-2">
                {(() => {
                  const rawList = Array.from(
                    new Set(
                      (formData.sectionOrder || ['hero', 'system', 'portfolio', 'process', 'services', 'faq', 'about', 'finalCta']).map(
                        (s) => (s === 'team' ? 'about' : s)
                      )
                    )
                  );
                  if (!rawList.includes('faq')) {
                    const sIdx = rawList.indexOf('services');
                    if (sIdx !== -1) rawList.splice(sIdx + 1, 0, 'faq');
                    else rawList.push('faq');
                  }
                  return rawList.map((sectionId, index, array) => (
                    <div
                      key={sectionId}
                      className="p-3.5 rounded-xl bg-[#12121c] border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 text-xs font-mono font-bold flex items-center justify-center border border-blue-500/30">
                          {index + 1}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-white">
                          {sectionLabels[sectionId] || sectionId}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveSectionOrder(index, 'up')}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-black disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === array.length - 1}
                          onClick={() => moveSectionOrder(index, 'down')}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-black disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: HEADER & NAVIGATION */}
        {/* ========================================================================= */}
        {activeTab === 'header' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1">
                Header & Navigation CMS
              </h3>
              <p className="text-xs text-zinc-400">
                Configure navigation links, CTA button text, and header elements.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Primary Action Button Text
                </label>
                <input
                  type="text"
                  value={formData.header?.ctaText || ''}
                  onChange={(e) => handleChange('header.ctaText', e.target.value)}
                  placeholder="Build with Footazix"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-bold"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[#12121c] border border-white/10">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-white block">
                    Show Primary Action Button
                  </span>
                  <span className="text-[11px] text-zinc-400 block">Header CTA trigger for project modal</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.header?.showCta !== false}
                  onChange={(e) => handleChange('header.showCta', e.target.checked)}
                  className="w-5 h-5 rounded bg-zinc-900 border-white/20 text-blue-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Navigation Items List */}
            <div className="p-5 rounded-xl bg-[#12121c] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Navigation Links
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Edit labels, targets (#work, #system, etc.), and visibility for each header link.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddNavItem}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Link</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {(formData.header?.navItems || []).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#090910] border border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase">Label</label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => handleUpdateNavItem(item.id, 'label', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/10 text-white text-xs outline-none"
                      />
                    </div>

                    <div className="sm:col-span-5">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase">Target (URL / #hash)</label>
                      <input
                        type="text"
                        value={item.href}
                        onChange={(e) => handleUpdateNavItem(item.id, 'href', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/10 text-white text-xs font-mono outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3 flex items-center justify-end gap-3 pt-4 sm:pt-0">
                      <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.visible !== false}
                          onChange={(e) => handleUpdateNavItem(item.id, 'visible', e.target.checked)}
                          className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-blue-600 cursor-pointer"
                        />
                        <span>Visible</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveNavItem(item.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                        title="Delete link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: HERO */}
        {/* ========================================================================= */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1">
                Hero Section CMS
              </h3>
              <p className="text-xs text-zinc-400">
                Primary above-the-fold typography, badges, and action button labels.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Badge Kicker
                  </label>
                  <label className="text-xs text-zinc-400 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hero.showBadge !== false}
                      onChange={(e) => handleChange('hero.showBadge', e.target.checked)}
                      className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-blue-600 cursor-pointer"
                    />
                    <span>Show Badge</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.hero.badgeText}
                  onChange={(e) => handleChange('hero.badgeText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Headline Line 1 (White text)
                </label>
                <input
                  type="text"
                  value={formData.hero.headlineLine1}
                  onChange={(e) => handleChange('hero.headlineLine1', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Headline Line 2 (Blue accent text)
                </label>
                <input
                  type="text"
                  value={formData.hero.headlineLine2}
                  onChange={(e) => handleChange('hero.headlineLine2', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-blue-400 text-sm focus:border-blue-500 outline-none font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Supporting Line
                  </label>
                  <label className="text-xs text-zinc-400 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hero.showSupportingLine !== false}
                      onChange={(e) => handleChange('hero.showSupportingLine', e.target.checked)}
                      className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-blue-600 cursor-pointer"
                    />
                    <span>Show Line</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.hero.supportingLine}
                  onChange={(e) => handleChange('hero.supportingLine', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Description Paragraph
                  </label>
                  <label className="text-xs text-zinc-400 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hero.showDescription !== false}
                      onChange={(e) => handleChange('hero.showDescription', e.target.checked)}
                      className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-blue-600 cursor-pointer"
                    />
                    <span>Show Description</span>
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={formData.hero.description}
                  onChange={(e) => handleChange('hero.description', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Primary CTA Button Text
                  </label>
                  <label className="text-xs text-zinc-400 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hero.showPrimaryCta !== false}
                      onChange={(e) => handleChange('hero.showPrimaryCta', e.target.checked)}
                      className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-blue-600 cursor-pointer"
                    />
                    <span>Show</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.hero.primaryCta}
                  onChange={(e) => handleChange('hero.primaryCta', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-bold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Secondary CTA Button Text
                  </label>
                  <label className="text-xs text-zinc-400 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hero.showSecondaryCta !== false}
                      onChange={(e) => handleChange('hero.showSecondaryCta', e.target.checked)}
                      className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-blue-600 cursor-pointer"
                    />
                    <span>Show</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.hero.secondaryCta}
                  onChange={(e) => handleChange('hero.secondaryCta', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SYSTEM (VSL) */}
        {/* ========================================================================= */}
        {activeTab === 'vsl' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1">
                The Footazix System (VSL) CMS
              </h3>
              <p className="text-xs text-zinc-400">
                Configure video source, URLs, fallback messages, and section titles.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Section Badge Label
                </label>
                <input
                  type="text"
                  value={formData.vsl.label}
                  onChange={(e) => handleChange('vsl.label', e.target.value)}
                  placeholder="THE FOOTAZIX SYSTEM"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Section Heading
                </label>
                <input
                  type="text"
                  value={formData.vsl.heading}
                  onChange={(e) => handleChange('vsl.heading', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Section Description
                </label>
                <textarea
                  rows={2}
                  value={formData.vsl.description}
                  onChange={(e) => handleChange('vsl.description', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Video Source Type
                </label>
                <select
                  value={formData.vsl.videoSource}
                  onChange={(e) => handleChange('vsl.videoSource', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="youtube">YouTube Embed (No Cookies)</option>
                  <option value="drive">Google Drive Video Preview</option>
                  <option value="direct">Direct Upload / MP4 URL</option>
                  <option value="local">Bundled Local Asset</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Fallback Error Text
                </label>
                <input
                  type="text"
                  value={formData.vsl.fallbackMessage || 'VIDEO UNAVAILABLE'}
                  onChange={(e) => handleChange('vsl.fallbackMessage', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Video URL / Embed Link
                </label>
                <input
                  type="text"
                  value={formData.vsl.videoUrl}
                  onChange={(e) => handleChange('vsl.videoUrl', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm font-mono focus:border-blue-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Video Poster Image URL
                </label>
                <input
                  type="text"
                  value={formData.vsl.posterUrl}
                  onChange={(e) => handleChange('vsl.posterUrl', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm font-mono focus:border-blue-500 outline-none"
                />
              </div>

              {/* VSL Poster Monochrome Mode */}
              <div className="sm:col-span-2 p-4 rounded-xl bg-[#090912] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Poster Image Color Mode
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      Boolean(formData.vsl?.posterMonochrome || formData.vsl?.monochrome)
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {Boolean(formData.vsl?.posterMonochrome || formData.vsl?.monochrome) ? 'Monochrome (ON)' : 'Full Color (OFF)'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    OFF = original full-color image (default) · ON = professional monochrome/grayscale effect
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      handleChange('vsl.posterMonochrome', false);
                      handleChange('vsl.monochrome', false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      !Boolean(formData.vsl?.posterMonochrome || formData.vsl?.monochrome)
                        ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Full Color (OFF)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleChange('vsl.posterMonochrome', true);
                      handleChange('vsl.monochrome', true);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      Boolean(formData.vsl?.posterMonochrome || formData.vsl?.monochrome)
                        ? 'bg-zinc-200 text-zinc-950 font-extrabold shadow-sm'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Monochrome (ON)
                  </button>
                </div>
              </div>

              {/* VSL Video Aspect Ratio Selector */}
              <div className="sm:col-span-2 p-5 rounded-xl bg-[#090912] border border-white/10 space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white">
                    Video Player Aspect Ratio
                  </label>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Controls framing on the public website without stretching, cropping, or breaking the layout.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
                  {[
                    { id: '16:9', label: '16:9', desc: 'Landscape / Widescreen' },
                    { id: '9:16', label: '9:16', desc: 'Vertical Reel / Short' },
                    { id: '1:1', label: '1:1', desc: 'Square 1:1 Post' },
                    { id: '4:5', label: '4:5', desc: 'Portrait 4:5 Feed' },
                    { id: '4:3', label: '4:3', desc: 'Classic 4:3 Frame' },
                    { id: 'auto', label: 'Auto', desc: 'Auto / Original' },
                  ].map((ratio) => {
                    const isSelected = (formData.vsl.aspectRatio || '16:9') === ratio.id;
                    return (
                      <button
                        key={ratio.id}
                        type="button"
                        onClick={() => handleChange('vsl.aspectRatio', ratio.id)}
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
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: PORTFOLIO */}
        {/* ========================================================================= */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1">
                Portfolio / Selected Work CMS
              </h3>
              <p className="text-xs text-zinc-400">
                Headers, filter controls, empty states, and project card button texts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Badge Label
                </label>
                <input
                  type="text"
                  value={formData.portfolio?.badge || 'PORTFOLIO'}
                  onChange={(e) => handleChange('portfolio.badge', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Heading Text
                </label>
                <input
                  type="text"
                  value={formData.sectionHeadings?.portfolioHeading || 'SELECTED WORK'}
                  onChange={(e) => {
                    handleChange('sectionHeadings.portfolioHeading', e.target.value);
                    handleChange('portfolio.heading', e.target.value);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Subheading Description
                </label>
                <input
                  type="text"
                  value={formData.sectionHeadings?.portfolioSubheading || ''}
                  onChange={(e) => {
                    handleChange('sectionHeadings.portfolioSubheading', e.target.value);
                    handleChange('portfolio.subheading', e.target.value);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Card CTA Button Text
                </label>
                <input
                  type="text"
                  value={formData.portfolio?.cardCtaText || 'INQUIRE ABOUT THIS STYLE'}
                  onChange={(e) => handleChange('portfolio.cardCtaText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Empty State Heading
                </label>
                <input
                  type="text"
                  value={formData.portfolio?.emptyTitle || 'No projects in this category'}
                  onChange={(e) => handleChange('portfolio.emptyTitle', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl bg-[#12121c] border border-white/10">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-white block">
                    Show Category Filter Buttons
                  </span>
                  <span className="text-[11px] text-zinc-400 block">
                    Enables filtering between Reels, Shorts, YouTube, Brand
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.portfolio?.showFilters !== false}
                  onChange={(e) => handleChange('portfolio.showFilters', e.target.checked)}
                  className="w-5 h-5 rounded bg-zinc-900 border-white/20 text-blue-600 cursor-pointer"
                />
              </div>

              {/* Portfolio Default Image Color Mode */}
              <div className="sm:col-span-2 p-4 rounded-xl bg-[#12121c] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Section Default Thumbnail Color Mode
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      Boolean(formData.portfolio?.monochrome)
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {Boolean(formData.portfolio?.monochrome) ? 'Monochrome (ON)' : 'Full Color (OFF)'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Controls default thumbnail style unless overridden per individual project in the Portfolio Manager.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleChange('portfolio.monochrome', false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      !Boolean(formData.portfolio?.monochrome)
                        ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Full Color (OFF)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('portfolio.monochrome', true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      Boolean(formData.portfolio?.monochrome)
                        ? 'bg-zinc-200 text-zinc-950 font-extrabold shadow-sm'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Monochrome (ON)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: PROCESS (RAW TO READY) */}
        {/* ========================================================================= */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1">
                Process (Raw → Edit → Ready) CMS
              </h3>
              <p className="text-xs text-zinc-400">
                Manage the three transformation stages, badges, and explanatory copy.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Badge Label
                </label>
                <input
                  type="text"
                  value={formData.rawToReady?.badge || 'THE TRANSFORMATION'}
                  onChange={(e) => handleChange('rawToReady.badge', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Core Stage Highlight Badge
                </label>
                <input
                  type="text"
                  value={formData.rawToReady?.coreStepBadge || 'CORE STEP'}
                  onChange={(e) => handleChange('rawToReady.coreStepBadge', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-mono text-blue-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Section Heading
                </label>
                <input
                  type="text"
                  value={formData.rawToReady.heading}
                  onChange={(e) => handleChange('rawToReady.heading', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Subheading Description
                </label>
                <input
                  type="text"
                  value={formData.rawToReady.subheading}
                  onChange={(e) => handleChange('rawToReady.subheading', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Stages Cards */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Transformation Stages
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(formData.rawToReady?.steps || []).map((step, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#12121c] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-blue-400">STAGE {step.num}</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase">Title</label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => {
                          const steps = [...(formData.rawToReady.steps || [])];
                          steps[idx] = { ...steps[idx], title: e.target.value };
                          handleChange('rawToReady.steps', steps);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/10 text-white text-xs font-bold outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase">Description</label>
                      <textarea
                        rows={2}
                        value={step.desc}
                        onChange={(e) => {
                          const steps = [...(formData.rawToReady.steps || [])];
                          steps[idx] = { ...steps[idx], desc: e.target.value };
                          handleChange('rawToReady.steps', steps);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/10 text-white text-xs outline-none resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: SERVICES */}
        {/* ========================================================================= */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1">
                Services Section CMS
              </h3>
              <p className="text-xs text-zinc-400">
                Headers, specialty badges, feature list visibility, and service copy.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Badge Label
                </label>
                <input
                  type="text"
                  value={formData.servicesContent?.badge || 'SERVICES'}
                  onChange={(e) => handleChange('servicesContent.badge', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Main Specialty Badge Text
                </label>
                <input
                  type="text"
                  value={formData.servicesContent?.highlightedBadge || 'MAIN SPECIALTY'}
                  onChange={(e) => handleChange('servicesContent.highlightedBadge', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Heading Text
                </label>
                <input
                  type="text"
                  value={formData.sectionHeadings?.servicesHeading || 'WHAT WE DO'}
                  onChange={(e) => {
                    handleChange('sectionHeadings.servicesHeading', e.target.value);
                    handleChange('servicesContent.heading', e.target.value);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Subheading Description
                </label>
                <input
                  type="text"
                  value={formData.sectionHeadings?.servicesSubheading || ''}
                  onChange={(e) => {
                    handleChange('sectionHeadings.servicesSubheading', e.target.value);
                    handleChange('servicesContent.subheading', e.target.value);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex flex-wrap items-center gap-6 p-4 rounded-xl bg-[#12121c] border border-white/10">
                <label className="text-xs text-white font-medium flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.servicesContent?.showFeatureList !== false}
                    onChange={(e) => handleChange('servicesContent.showFeatureList', e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-blue-600 cursor-pointer"
                  />
                  <span>Show Feature Checklist on Cards</span>
                </label>

                <label className="text-xs text-white font-medium flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.servicesContent?.showNumbers !== false}
                    onChange={(e) => handleChange('servicesContent.showNumbers', e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-blue-600 cursor-pointer"
                  />
                  <span>Show Service Numbers (01, 02, 03)</span>
                </label>

                <label className="text-xs text-white font-medium flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.servicesContent?.showCta !== false}
                    onChange={(e) => handleChange('servicesContent.showCta', e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-blue-600 cursor-pointer"
                  />
                  <span>Show Card CTA Buttons</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: ABOUT & TEAM */}
        {/* ========================================================================= */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1">
                About & Team Section CMS
              </h3>
              <p className="text-xs text-zinc-400">
                Configure team philosophy text, button labels, and element visibility.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Badge Label
                </label>
                <input
                  type="text"
                  value={formData.aboutContent?.badge || 'TEAM & PHILOSOPHY'}
                  onChange={(e) => handleChange('aboutContent.badge', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Heading Text
                </label>
                <input
                  type="text"
                  value={formData.sectionHeadings?.teamHeading || 'BUILT AROUND CONTENT.'}
                  onChange={(e) => {
                    handleChange('sectionHeadings.teamHeading', e.target.value);
                    handleChange('aboutContent.heading', e.target.value);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Philosophy / Copy Text
                </label>
                <textarea
                  rows={3}
                  value={formData.sectionHeadings?.teamCopy || ''}
                  onChange={(e) => {
                    handleChange('sectionHeadings.teamCopy', e.target.value);
                    handleChange('aboutContent.copy', e.target.value);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Social Button Text
                </label>
                <input
                  type="text"
                  value={formData.aboutContent?.socialButtonText || 'Profile'}
                  onChange={(e) => handleChange('aboutContent.socialButtonText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Empty Team State Text
                </label>
                <input
                  type="text"
                  value={formData.aboutContent?.emptyText || 'No team members published yet.'}
                  onChange={(e) => handleChange('aboutContent.emptyText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              {/* About & Team Photo Color Mode */}
              <div className="sm:col-span-2 p-4 rounded-xl bg-[#12121c] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Team Photos Default Color Mode
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      Boolean(formData.aboutContent?.monochrome)
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {Boolean(formData.aboutContent?.monochrome) ? 'Monochrome (ON)' : 'Full Color (OFF)'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Controls default photo styling across team members unless individually overridden.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleChange('aboutContent.monochrome', false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      !Boolean(formData.aboutContent?.monochrome)
                        ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Full Color (OFF)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('aboutContent.monochrome', true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      Boolean(formData.aboutContent?.monochrome)
                        ? 'bg-zinc-200 text-zinc-950 font-extrabold shadow-sm'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Monochrome (ON)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 10: FINAL CTA */}
        {/* ========================================================================= */}
        {activeTab === 'cta' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1">
                Final Call To Action CMS
              </h3>
              <p className="text-xs text-zinc-400">
                Manage the high-conversion upgrade banner at the bottom of the page.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Eyebrow Badge Label
                </label>
                <input
                  type="text"
                  value={formData.finalCta?.badge || "LET'S TALK"}
                  onChange={(e) => handleChange('finalCta.badge', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Headline Text
                </label>
                <input
                  type="text"
                  value={formData.sectionHeadings?.finalCtaHeadline || 'READY TO UPGRADE YOUR CONTENT?'}
                  onChange={(e) => {
                    handleChange('sectionHeadings.finalCtaHeadline', e.target.value);
                    handleChange('finalCta.heading', e.target.value);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Supporting Paragraph
                </label>
                <input
                  type="text"
                  value={formData.sectionHeadings?.finalCtaSupporting || ''}
                  onChange={(e) => {
                    handleChange('sectionHeadings.finalCtaSupporting', e.target.value);
                    handleChange('finalCta.supporting', e.target.value);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Primary Button Text
                  </label>
                  <label className="text-xs text-zinc-400 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.finalCta?.showPrimaryCta !== false}
                      onChange={(e) => handleChange('finalCta.showPrimaryCta', e.target.checked)}
                      className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-blue-600 cursor-pointer"
                    />
                    <span>Show</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.finalCta?.primaryCta || 'BUILD WITH FOOTAZIX'}
                  onChange={(e) => handleChange('finalCta.primaryCta', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-bold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Secondary (Instagram) Button Text
                  </label>
                  <label className="text-xs text-zinc-400 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.finalCta?.showSecondaryCta !== false}
                      onChange={(e) => handleChange('finalCta.showSecondaryCta', e.target.checked)}
                      className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-blue-600 cursor-pointer"
                    />
                    <span>Show</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.finalCta?.secondaryCta || 'INSTAGRAM'}
                  onChange={(e) => handleChange('finalCta.secondaryCta', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 11: FOOTER */}
        {/* ========================================================================= */}
        {activeTab === 'footer' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1">
                Footer CMS
              </h3>
              <p className="text-xs text-zinc-400">
                Manage copyright line, navigation link labels, legal links, and social labels.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Brand Supporting Line / Tagline
                </label>
                <input
                  type="text"
                  value={formData.footer?.description || formData.footer?.tagline || ''}
                  onChange={(e) => {
                    handleChange('footer.description', e.target.value);
                    handleChange('footer.tagline', e.target.value);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Copyright Notice
                </label>
                <input
                  type="text"
                  value={formData.footer.copyrightText}
                  onChange={(e) => handleChange('footer.copyrightText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Back to Top Button Text
                </label>
                <input
                  type="text"
                  value={formData.footer?.backToTopText || 'Back to top'}
                  onChange={(e) => handleChange('footer.backToTopText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Terms & Conditions Label
                </label>
                <input
                  type="text"
                  value={formData.footer?.termsLabel || 'Terms & Conditions'}
                  onChange={(e) => handleChange('footer.termsLabel', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Privacy Policy Label
                </label>
                <input
                  type="text"
                  value={formData.footer?.privacyLabel || 'Privacy Policy'}
                  onChange={(e) => handleChange('footer.privacyLabel', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 12: LEGAL */}
        {/* ========================================================================= */}
        {activeTab === 'legal' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1">
                Legal Documents CMS (/terms & /privacy)
              </h3>
              <p className="text-xs text-zinc-400">
                Full legal compliance text for client intellectual property, turnaround policies, and privacy disclosures.
              </p>
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-[#12121c] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white uppercase">Terms & Conditions</h4>
                  <input
                    type="text"
                    value={formData.legal?.terms.lastUpdated || ''}
                    onChange={(e) => handleChange('legal.terms.lastUpdated', e.target.value)}
                    placeholder="October 2026"
                    className="px-3 py-1 rounded bg-black border border-white/10 text-white text-xs font-mono"
                  />
                </div>
                <textarea
                  rows={8}
                  value={formData.legal?.terms.content || ''}
                  onChange={(e) => handleChange('legal.terms.content', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white text-xs font-mono focus:border-blue-500 outline-none resize-y leading-relaxed"
                />
              </div>

              <div className="p-5 rounded-xl bg-[#12121c] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white uppercase">Privacy Policy</h4>
                  <input
                    type="text"
                    value={formData.legal?.privacy.lastUpdated || ''}
                    onChange={(e) => handleChange('legal.privacy.lastUpdated', e.target.value)}
                    placeholder="October 2026"
                    className="px-3 py-1 rounded bg-black border border-white/10 text-white text-xs font-mono"
                  />
                </div>
                <textarea
                  rows={8}
                  value={formData.legal?.privacy.content || ''}
                  onChange={(e) => handleChange('legal.privacy.content', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white text-xs font-mono focus:border-blue-500 outline-none resize-y leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 13: SEO & METADATA */}
        {/* ========================================================================= */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1">
                SEO & OpenGraph Social Metadata
              </h3>
              <p className="text-xs text-zinc-400">
                Manage search engine snippet titles, descriptions, canonical URLs, and social share cards.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Page Title (&lt;title&gt;)
                </label>
                <input
                  type="text"
                  value={formData.seo?.siteTitle || ''}
                  onChange={(e) => handleChange('seo.siteTitle', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-bold"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">Recommended: 30-60 characters for optimal Google search rendering</span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Meta Description (&lt;meta name="description"&gt;)
                </label>
                <textarea
                  rows={3}
                  value={formData.seo?.metaDescription || ''}
                  onChange={(e) => handleChange('seo.metaDescription', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none resize-none"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">Recommended: 120-160 characters</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Canonical Production URL
                </label>
                <input
                  type="text"
                  value={formData.seo?.canonicalUrl || 'https://footazix.site'}
                  onChange={(e) => handleChange('seo.canonicalUrl', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm font-mono focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Search Keywords
                </label>
                <input
                  type="text"
                  value={formData.seo?.keywords || ''}
                  onChange={(e) => handleChange('seo.keywords', e.target.value)}
                  placeholder="video editing, reels, shorts, footazix"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  OpenGraph Title (og:title)
                </label>
                <input
                  type="text"
                  value={formData.seo?.ogTitle || ''}
                  onChange={(e) => handleChange('seo.ogTitle', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  OpenGraph Description (og:description)
                </label>
                <input
                  type="text"
                  value={formData.seo?.ogDescription || ''}
                  onChange={(e) => handleChange('seo.ogDescription', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              {/* Linked Universal OG Image Preview */}
              <div className="sm:col-span-2 p-4 rounded-xl bg-black border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-20 h-12 rounded-lg bg-zinc-900 border border-white/10 overflow-hidden shrink-0">
                    <img
                      src={formData.brandingAssets?.ogImage?.url || 'https://gdwlkqrzcixjajzvcwvg.supabase.co/storage/v1/object/public/footazix-media/branding/1790997433105_1001608268.png'}
                      alt="OG Image Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Universal OG Image</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[9px] font-mono font-bold">SINGLE SOURCE OF TRUTH</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 block line-clamp-1 font-mono">
                      {formData.brandingAssets?.ogImage?.url || 'Default Footazix Brand Card'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('branding')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-400 hover:text-white bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 transition-colors shrink-0 cursor-pointer"
                >
                  Manage Image in Branding →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {isResetConfirmOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-2xl bg-[#0e0e18] border border-white/10 shadow-2xl space-y-4"
            >
              <h4 className="text-base font-bold text-white">Reset to Default Content?</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                This will reset all sections, branding references, and copy back to default values. Your Supabase media files will remain intact in storage.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-[#12121c] border border-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmReset}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </form>
  );
};
