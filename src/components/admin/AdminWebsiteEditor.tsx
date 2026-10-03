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
      handleChange(targetPath, res.url);
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
    const currentOrder = [...(formData.sectionOrder || ['hero', 'system', 'portfolio', 'process', 'services', 'about', 'finalCta'])];
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
    about: 'About & Team Philosophy',
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
                  ) : (
                    <img
                      src={formData.brandingAssets?.headerLogo?.url || '/assets/logo/footazix-logo.png'}
                      alt={formData.brandingAssets?.headerLogo?.alt || 'Footazix Logo'}
                      className="max-h-14 object-contain transition-all"
                      style={{
                        width: `${formData.brandingAssets?.headerLogo?.desktopWidth || 155}px`,
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
                      placeholder="/assets/logo/footazix-logo.png"
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
                          <span>UPLOAD NEW LOGO</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleChange('brandingAssets.headerLogo.url', '/assets/logo/footazix-logo.png');
                        handleChange('brandingAssets.headerLogo.desktopWidth', 155);
                        handleChange('brandingAssets.headerLogo.mobileWidth', 125);
                        setToastMessage({ type: 'success', text: 'Reset logo to default official asset.' });
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#12121c] border border-white/10 transition-colors cursor-pointer"
                    >
                      Reset to Official Asset
                    </button>
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
              <div className="border-b border-white/10 pb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>FAVICON & APPLE TOUCH ICON</span>
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    Separate Setting
                  </span>
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Upload your dedicated favicon for browser tabs and mobile home screens. (Does NOT automatically copy header logo).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Standard Browser Favicon */}
                <div className="p-5 rounded-xl bg-[#12121c] border border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center p-2 shrink-0">
                      <img
                        src={formData.brandingAssets?.favicon?.url || '/favicon.svg'}
                        alt="Favicon preview"
                        className="w-7 h-7 object-contain"
                      />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">Browser Favicon</h5>
                      <span className="text-[11px] text-zinc-400">Supports .ico, .svg, .png, .webp</span>
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
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-white text-xs font-mono focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={faviconInputRef}
                      accept="image/png,image/svg+xml,image/x-icon,image/webp"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'brandingAssets.favicon.url', 'favicons')}
                    />

                    <button
                      type="button"
                      disabled={uploadingAsset === 'brandingAssets.favicon.url'}
                      onClick={() => faviconInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Favicon</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleChange('brandingAssets.favicon.url', '/favicon.svg');
                        setToastMessage({ type: 'success', text: 'Reset favicon to default.' });
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-black border border-white/10 transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Apple Touch Icon */}
                <div className="p-5 rounded-xl bg-[#12121c] border border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center p-2 shrink-0">
                      <img
                        src={formData.brandingAssets?.favicon?.appleTouchIconUrl || '/apple-touch-icon.png'}
                        alt="Apple Touch Icon"
                        className="w-7 h-7 object-contain"
                      />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">Apple / Touch Icon</h5>
                      <span className="text-[11px] text-zinc-400">iOS bookmark & home screen icon</span>
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
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-white text-xs font-mono focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
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
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Touch Icon</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleChange('brandingAssets.favicon.appleTouchIconUrl', '/apple-touch-icon.png');
                        setToastMessage({ type: 'success', text: 'Reset apple touch icon to default.' });
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-black border border-white/10 transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. FOOTER LOGO & SOCIAL SHARE OG IMAGE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Footer Logo */}
              <div className="p-6 rounded-2xl bg-[#0e0e18] border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="text-sm font-bold text-white">FOOTER LOGO</h4>
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

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#12121c] border border-white/5">
                  <span className="text-xs text-white">Mirror Header Logo automatically</span>
                  <input
                    type="checkbox"
                    checked={formData.brandingAssets?.footerLogo?.useHeaderLogo !== false}
                    onChange={(e) => handleChange('brandingAssets.footerLogo.useHeaderLogo', e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-blue-600 cursor-pointer"
                  />
                </div>

                {formData.brandingAssets?.footerLogo?.useHeaderLogo === false && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.brandingAssets?.footerLogo?.url || ''}
                      onChange={(e) => handleChange('brandingAssets.footerLogo.url', e.target.value)}
                      placeholder="Custom footer logo URL"
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-white text-xs font-mono outline-none"
                    />

                    <input
                      type="file"
                      ref={footerLogoInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'brandingAssets.footerLogo.url', 'logos')}
                    />

                    <button
                      type="button"
                      onClick={() => footerLogoInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 cursor-pointer"
                    >
                      Upload Custom Footer Logo
                    </button>
                  </div>
                )}
              </div>

              {/* Social Sharing / OpenGraph Image */}
              <div className="p-6 rounded-2xl bg-[#0e0e18] border border-white/10 space-y-4">
                <div className="border-b border-white/10 pb-3">
                  <h4 className="text-sm font-bold text-white">SOCIAL SHARING IMAGE (OG)</h4>
                  <p className="text-[11px] text-zinc-400">Preview image rendered on Twitter, iMessage, Discord, Slack</p>
                </div>

                <div>
                  <input
                    type="text"
                    value={formData.brandingAssets?.ogImage?.url || ''}
                    onChange={(e) => handleChange('brandingAssets.ogImage.url', e.target.value)}
                    placeholder="/assets/vsl/vsl-poster.jpg"
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-white text-xs font-mono outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={ogImageInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'brandingAssets.ogImage.url', 'branding')}
                  />

                  <button
                    type="button"
                    onClick={() => ogImageInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 cursor-pointer"
                  >
                    Upload OG Image
                  </button>
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
                  { key: 'header', label: 'Website Header & Navigation Bar', desc: 'Top sticky navigation, brand logo, links, and action button.' },
                  { key: 'hero', label: 'Hero Section', desc: 'Main typographic headline, badges, 3D interactive sculpture, and hero CTAs.' },
                  { key: 'system', label: 'The Footazix System (VSL)', desc: 'Custom video player showcase and methodology walkthrough.' },
                  { key: 'portfolio', label: 'Selected Work / Portfolio', desc: 'Published project gallery with category filters and preview modals.' },
                  { key: 'process', label: 'Raw → Edit → Ready (Process)', desc: 'Three-stage content transformation pipeline strip.' },
                  { key: 'services', label: 'Services Grid', desc: 'Three core service offerings with feature breakdowns and call-to-actions.' },
                  { key: 'about', label: 'About & Team Section', desc: 'Creative philosophy and active team member cards.' },
                  { key: 'finalCta', label: 'Final Call To Action', desc: 'High-conversion bottom upgrade banner and project prompt.' },
                  { key: 'footer', label: 'Website Footer', desc: 'Bottom brand summary, copyright, legal links, and owner lock.' },
                  { key: 'instagram', label: 'Instagram Integration', desc: 'Global Instagram buttons across header, final CTA, and footer.' },
                  { key: 'startProjectModal', label: 'Start a Project Inquiry Modal', desc: 'Interactive project onboarding and lead capture form.' },
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
                {(formData.sectionOrder || ['hero', 'system', 'portfolio', 'process', 'services', 'about', 'finalCta']).map(
                  (sectionId, index, array) => (
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
                  )
                )}
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
