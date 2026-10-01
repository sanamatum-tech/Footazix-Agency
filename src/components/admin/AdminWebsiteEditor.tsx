import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { WebsiteContent } from '../../types';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type EditorTab =
  | 'settings'
  | 'header'
  | 'hero'
  | 'about'
  | 'services'
  | 'team'
  | 'portfolio'
  | 'vsl'
  | 'cta'
  | 'footer'
  | 'legal';

export const AdminWebsiteEditor: React.FC = () => {
  const { content, updateWebsiteContent, resetWebsiteContent, saveStatus } = useApp();
  const [formData, setFormData] = useState<WebsiteContent>(content);
  const [activeTab, setActiveTab] = useState<EditorTab>('settings');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

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
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return copy;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ok = await updateWebsiteContent(formData);
      if (ok) {
        setToastMessage({ type: 'success', text: 'Saved successfully.' });
      } else {
        setToastMessage({ type: 'error', text: 'Unable to save changes.' });
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
      setToastMessage({ type: 'success', text: 'Reset to default content successfully.' });
    } catch {
      setToastMessage({ type: 'error', text: 'Failed to reset content.' });
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  const tabs: { id: EditorTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'settings', label: 'General', icon: Globe2 },
    { id: 'header', label: 'Header & Nav', icon: PanelTop },
    { id: 'hero', label: 'Hero', icon: Sparkles },
    { id: 'vsl', label: 'System', icon: PlaySquare },
    { id: 'portfolio', label: 'Portfolio', icon: FolderKanban },
    { id: 'about', label: 'Process', icon: Layers },
    { id: 'services', label: 'Services', icon: BriefcaseBusiness },
    { id: 'team', label: 'Team', icon: UsersRound },
    { id: 'cta', label: 'Final CTA', icon: Flame },
    { id: 'footer', label: 'Footer', icon: PanelBottom },
    { id: 'legal', label: 'Legal Pages', icon: ShieldCheck },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Sticky Header with Save and Unsaved Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#090910] border border-white/10 sticky top-20 z-20 backdrop-blur-md bg-[#090910]/95 shadow-xl">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-display font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Website Content CMS</span>
              {hasUnsavedChanges && (
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" title="Unsaved changes detected" />
              )}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {hasUnsavedChanges ? (
                <span className="text-blue-400 font-medium">Unsaved changes pending</span>
              ) : (
                <span>All sections in sync with Supabase database</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
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
      <div className="p-6 sm:p-8 rounded-2xl bg-[#090910] border border-white/10">
        {/* 1. SITE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                Site & Agency Settings
              </h3>
              <p className="text-xs text-zinc-400">
                Core brand parameters, canonical domain, and contact channels.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.brand.name}
                  onChange={(e) => handleChange('brand.name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">Displayed across navbar, footer, and admin</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Production Domain
                </label>
                <input
                  type="text"
                  value={formData.brand.domain}
                  onChange={(e) => handleChange('brand.domain', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-mono"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">Production URL domain (footazix.site)</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Agency Email
                </label>
                <input
                  type="email"
                  value={formData.brand.email}
                  onChange={(e) => handleChange('brand.email', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Instagram Handle & URL
                </label>
                <input
                  type="text"
                  value={formData.brand.instagram}
                  onChange={(e) => handleChange('brand.instagram', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2 pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-white block">
                    Show Instagram Button
                  </label>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Toggle Instagram visibility across website header, CTAs, and footer.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.brand.showInstagramButton !== false}
                  onChange={(e) => handleChange('brand.showInstagramButton', e.target.checked)}
                  className="w-5 h-5 rounded bg-[#12121c] border-white/20 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. HEADER & NAVIGATION */}
        {activeTab === 'header' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                Header & Navigation CMS
              </h3>
              <p className="text-xs text-zinc-400">
                Configure public navigation labels, primary call-to-action button, and social link visibility.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Nav Item: Work
                </label>
                <input
                  type="text"
                  value={formData.header?.navWork || 'Work'}
                  onChange={(e) => handleChange('header.navWork', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Nav Item: System (f/k/a VSL)
                </label>
                <input
                  type="text"
                  value={formData.header?.navSystem || 'System'}
                  onChange={(e) => handleChange('header.navSystem', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Nav Item: Services
                </label>
                <input
                  type="text"
                  value={formData.header?.navServices || 'Services'}
                  onChange={(e) => handleChange('header.navServices', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Nav Item: About
                </label>
                <input
                  type="text"
                  value={formData.header?.navAbout || 'About'}
                  onChange={(e) => handleChange('header.navAbout', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Primary Header Action Button
                </label>
                <input
                  type="text"
                  value={formData.header?.ctaText || 'Build with Footazix'}
                  onChange={(e) => handleChange('header.ctaText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-bold"
                />
              </div>

              <div className="sm:col-span-2 p-4 rounded-xl bg-[#12121c] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-white block">
                    Show Instagram Icon in Header
                  </span>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">
                    If disabled, the button disappears completely with zero empty gap.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.brand.showInstagramButton !== false}
                  onChange={(e) => handleChange('brand.showInstagramButton', e.target.checked)}
                  className="w-5 h-5 rounded bg-zinc-900 border-white/20 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. HERO */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                Hero Section CMS
              </h3>
              <p className="text-xs text-zinc-400">
                Above-the-fold typography, agency badge, and high-converting CTAs.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Hero Badge Kicker
                </label>
                <input
                  type="text"
                  value={formData.hero.badgeText}
                  onChange={(e) => handleChange('hero.badgeText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-mono"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">Displayed above the main headline with the blue status dot</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Headline Line 1 (White)
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
                    Headline Line 2 (Blue Accent)
                  </label>
                  <input
                    type="text"
                    value={formData.hero.headlineLine2}
                    onChange={(e) => handleChange('hero.headlineLine2', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Supporting Line
                </label>
                <input
                  type="text"
                  value={formData.hero.supportingLine}
                  onChange={(e) => handleChange('hero.supportingLine', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Hero Paragraph Description
                </label>
                <textarea
                  rows={3}
                  value={formData.hero.description}
                  onChange={(e) => handleChange('hero.description', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Primary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.hero.primaryCta}
                    onChange={(e) => handleChange('hero.primaryCta', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Secondary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.hero.secondaryCta}
                    onChange={(e) => handleChange('hero.secondaryCta', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. ABOUT / RAW TO READY */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                RAW → EDIT → READY Framework
              </h3>
              <p className="text-xs text-zinc-400">
                The three-stage production mechanism explaining your video editing process.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Section Heading
                </label>
                <input
                  type="text"
                  value={formData.rawToReady.heading}
                  onChange={(e) => handleChange('rawToReady.heading', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Subheading
                </label>
                <input
                  type="text"
                  value={formData.rawToReady.subheading}
                  onChange={(e) => handleChange('rawToReady.subheading', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Steps Array */}
            <div className="space-y-4 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                Stages (01, 02, 03)
              </span>

              {formData.rawToReady.steps.map((step, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#12121c] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-400">Stage {step.num}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Title</label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => handleChange(`rawToReady.steps.${idx}.title`, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#090910] border border-white/10 text-white text-xs outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Description</label>
                      <input
                        type="text"
                        value={step.desc}
                        onChange={(e) => handleChange(`rawToReady.steps.${idx}.desc`, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#090910] border border-white/10 text-white text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. SERVICES */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                Services Section Copy
              </h3>
              <p className="text-xs text-zinc-400">
                Control the section title and narrative context above your service offerings.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Heading
                </label>
                <input
                  type="text"
                  value={formData.sectionHeadings.servicesHeading}
                  onChange={(e) => handleChange('sectionHeadings.servicesHeading', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Subheading
                </label>
                <input
                  type="text"
                  value={formData.sectionHeadings.servicesSubheading}
                  onChange={(e) => handleChange('sectionHeadings.servicesSubheading', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. TEAM */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                Team / About Copy
              </h3>
              <p className="text-xs text-zinc-400">
                Editorial title and introductory narrative above the agency team roster.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Heading
                </label>
                <input
                  type="text"
                  value={formData.sectionHeadings.teamHeading}
                  onChange={(e) => handleChange('sectionHeadings.teamHeading', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Team Narrative Copy
                </label>
                <input
                  type="text"
                  value={formData.sectionHeadings.teamCopy}
                  onChange={(e) => handleChange('sectionHeadings.teamCopy', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                Portfolio Showcase Copy
              </h3>
              <p className="text-xs text-zinc-400">
                Heading and descriptive lead above the client project cards.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Section Heading
                </label>
                <input
                  type="text"
                  value={formData.sectionHeadings.portfolioHeading}
                  onChange={(e) => handleChange('sectionHeadings.portfolioHeading', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Section Subheading
                </label>
                <input
                  type="text"
                  value={formData.sectionHeadings.portfolioSubheading}
                  onChange={(e) => handleChange('sectionHeadings.portfolioSubheading', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 7. VSL */}
        {activeTab === 'vsl' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                Founder VSL Copy & Setup
              </h3>
              <p className="text-xs text-zinc-400">
                Heading, descriptive label, and video source settings.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  VSL Label Kicker
                </label>
                <input
                  type="text"
                  value={formData.vsl.label}
                  onChange={(e) => handleChange('vsl.label', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Heading
                </label>
                <input
                  type="text"
                  value={formData.vsl.heading}
                  onChange={(e) => handleChange('vsl.heading', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                value={formData.vsl.description}
                onChange={(e) => handleChange('vsl.description', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* 8. FINAL CTA */}
        {activeTab === 'cta' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                Final Call to Action
              </h3>
              <p className="text-xs text-zinc-400">
                High-converting conversion anchor at the bottom of the landing page.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Headline
                </label>
                <input
                  type="text"
                  value={formData.sectionHeadings.finalCtaHeadline}
                  onChange={(e) => handleChange('sectionHeadings.finalCtaHeadline', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Supporting Line
                </label>
                <input
                  type="text"
                  value={formData.sectionHeadings.finalCtaSupporting}
                  onChange={(e) => handleChange('sectionHeadings.finalCtaSupporting', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 9. FOOTER */}
        {activeTab === 'footer' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                Footer Information
              </h3>
              <p className="text-xs text-zinc-400">
                Copyright notice and closing tagline.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Copyright Notice
                </label>
                <input
                  type="text"
                  value={formData.footer.copyrightText}
                  onChange={(e) => handleChange('footer.copyrightText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Closing Tagline
                </label>
                <input
                  type="text"
                  value={formData.footer.tagline}
                  onChange={(e) => handleChange('footer.tagline', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 11. LEGAL PAGES */}
        {activeTab === 'legal' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                Legal & Compliance Documents
              </h3>
              <p className="text-xs text-zinc-400">
                Manage Terms & Conditions (/terms) and Privacy Policy (/privacy) copy.
              </p>
            </div>

            {/* Terms & Conditions Block */}
            <div className="p-5 rounded-xl bg-[#12121c] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                  Document 01 — Terms & Conditions
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Path: /terms</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={formData.legal?.terms?.title || 'Terms & Conditions'}
                    onChange={(e) => handleChange('legal.terms.title', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090910] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Last Updated Label
                  </label>
                  <input
                    type="text"
                    value={formData.legal?.terms?.lastUpdated || 'October 2026'}
                    onChange={(e) => handleChange('legal.terms.lastUpdated', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090910] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Terms & Conditions Text
                </label>
                <textarea
                  rows={6}
                  value={formData.legal?.terms?.content || ''}
                  onChange={(e) => handleChange('legal.terms.content', e.target.value)}
                  placeholder="Enter full Terms & Conditions clauses..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#090910] border border-white/10 text-white text-xs leading-relaxed focus:border-blue-500 outline-none font-mono resize-y"
                />
              </div>
            </div>

            {/* Privacy Policy Block */}
            <div className="p-5 rounded-xl bg-[#12121c] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                  Document 02 — Privacy Policy
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Path: /privacy</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={formData.legal?.privacy?.title || 'Privacy Policy'}
                    onChange={(e) => handleChange('legal.privacy.title', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090910] border border-white/10 text-white text-sm focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Last Updated Label
                  </label>
                  <input
                    type="text"
                    value={formData.legal?.privacy?.lastUpdated || 'October 2026'}
                    onChange={(e) => handleChange('legal.privacy.lastUpdated', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090910] border border-white/10 text-white text-sm focus:border-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Privacy Policy Text
                </label>
                <textarea
                  rows={6}
                  value={formData.legal?.privacy?.content || ''}
                  onChange={(e) => handleChange('legal.privacy.content', e.target.value)}
                  placeholder="Enter full Privacy Policy clauses..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#090910] border border-white/10 text-white text-xs leading-relaxed focus:border-blue-500 outline-none font-mono resize-y"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset Confirmation Dialog Modal */}
      {isResetConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="w-full max-w-md bg-[#0b0b14] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Website Content?</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  This will reset all headlines, copy, and CTAs back to their factory defaults.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#12121c] border border-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReset}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-500 transition-colors"
              >
                Yes, Reset Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
