import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { WebsiteContent } from '../../types';

export const AdminWebsiteEditor: React.FC = () => {
  const { content, updateWebsiteContent, resetWebsiteContent, saveStatus } = useApp();
  const [formData, setFormData] = useState<WebsiteContent>(content);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setFormData(content);
  }, [content]);

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
    setStatusMessage('Saving...');
    const ok = await updateWebsiteContent(formData);
    if (ok) {
      setStatusMessage('Changes saved to live session!');
      setTimeout(() => setStatusMessage(''), 3000);
    } else {
      setStatusMessage('Error saving changes.');
    }
  };

  const handleCancel = () => {
    setFormData(content);
    setStatusMessage('Changes reverted to current published values.');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleResetToDefaults = async () => {
    if (window.confirm('Reset all website headings and copy back to default?')) {
      await resetWebsiteContent();
      setStatusMessage('Reset to defaults successfully.');
      setTimeout(() => setStatusMessage(''), 2500);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl pb-16">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-950 border border-white/10 sticky top-4 z-20 backdrop-blur-md bg-zinc-950/95 shadow-xl">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight">
            Website Content & Headings CMS
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Update hero headlines, section subtitles, and footer text in real-time.
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
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 border border-white/10 transition-colors cursor-pointer"
          >
            Cancel
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
              <span>SAVE ALL CHANGES</span>
            )}
          </button>
        </div>
      </div>

      {/* 1. HERO SECTION CMS */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-white/10 space-y-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 border-b border-white/10 pb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>1. Hero Section</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Hero Small Label
            </label>
            <input
              type="text"
              value={formData.hero.badgeText}
              onChange={(e) => handleChange('hero.badgeText', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Supporting Line
            </label>
            <input
              type="text"
              value={formData.hero.supportingLine}
              onChange={(e) => handleChange('hero.supportingLine', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Headline Line 1
            </label>
            <input
              type="text"
              value={formData.hero.headlineLine1}
              onChange={(e) => handleChange('hero.headlineLine1', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Headline Line 2 (Blue Accent)
            </label>
            <input
              type="text"
              value={formData.hero.headlineLine2}
              onChange={(e) => handleChange('hero.headlineLine2', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Hero Description
            </label>
            <textarea
              rows={2}
              value={formData.hero.description}
              onChange={(e) => handleChange('hero.description', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Primary CTA Button
            </label>
            <input
              type="text"
              value={formData.hero.primaryCta}
              onChange={(e) => handleChange('hero.primaryCta', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Secondary CTA Button
            </label>
            <input
              type="text"
              value={formData.hero.secondaryCta}
              onChange={(e) => handleChange('hero.secondaryCta', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 2. VSL SECTION COPY */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-white/10 space-y-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 border-b border-white/10 pb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>2. VSL Section Copy</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              VSL Label
            </label>
            <input
              type="text"
              value={formData.vsl.label}
              onChange={(e) => handleChange('vsl.label', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              VSL Heading
            </label>
            <input
              type="text"
              value={formData.vsl.heading}
              onChange={(e) => handleChange('vsl.heading', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              VSL Subtitle / Description
            </label>
            <input
              type="text"
              value={formData.vsl.description}
              onChange={(e) => handleChange('vsl.description', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 3. SECTION HEADINGS */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-white/10 space-y-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 border-b border-white/10 pb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>3. Section Titles & Descriptions</span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Portfolio Heading
              </label>
              <input
                type="text"
                value={formData.sectionHeadings.portfolioHeading}
                onChange={(e) => handleChange('sectionHeadings.portfolioHeading', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Portfolio Subtitle
              </label>
              <input
                type="text"
                value={formData.sectionHeadings.portfolioSubheading}
                onChange={(e) => handleChange('sectionHeadings.portfolioSubheading', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Services Heading
              </label>
              <input
                type="text"
                value={formData.sectionHeadings.servicesHeading}
                onChange={(e) => handleChange('sectionHeadings.servicesHeading', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Services Subtitle
              </label>
              <input
                type="text"
                value={formData.sectionHeadings.servicesSubheading}
                onChange={(e) => handleChange('sectionHeadings.servicesSubheading', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Team / About Heading
              </label>
              <input
                type="text"
                value={formData.sectionHeadings.teamHeading}
                onChange={(e) => handleChange('sectionHeadings.teamHeading', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Team / About Philosophy Copy
              </label>
              <textarea
                rows={2}
                value={formData.sectionHeadings.teamCopy}
                onChange={(e) => handleChange('sectionHeadings.teamCopy', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Final CTA Headline
              </label>
              <input
                type="text"
                value={formData.sectionHeadings.finalCtaHeadline}
                onChange={(e) => handleChange('sectionHeadings.finalCtaHeadline', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Final CTA Supporting
              </label>
              <input
                type="text"
                value={formData.sectionHeadings.finalCtaSupporting}
                onChange={(e) => handleChange('sectionHeadings.finalCtaSupporting', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. BRAND & FOOTER CMS */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-white/10 space-y-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 border-b border-white/10 pb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>4. Brand & Footer Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Brand Name
            </label>
            <input
              type="text"
              value={formData.brand.name}
              onChange={(e) => handleChange('brand.name', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Contact Email
            </label>
            <input
              type="email"
              value={formData.brand.email}
              onChange={(e) => handleChange('brand.email', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Instagram Profile URL
            </label>
            <input
              type="text"
              value={formData.brand.instagram}
              onChange={(e) => handleChange('brand.instagram', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Footer Tagline
            </label>
            <input
              type="text"
              value={formData.footer.tagline}
              onChange={(e) => handleChange('footer.tagline', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Reset to Defaults option */}
      <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/40 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-white block">Reset Default Headings</span>
          <span className="text-[11px] text-zinc-400">Revert all copy to original agency default copy.</span>
        </div>
        <button
          type="button"
          onClick={handleResetToDefaults}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-red-400 bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 transition-colors cursor-pointer"
        >
          Reset Defaults
        </button>
      </div>
    </form>
  );
};
