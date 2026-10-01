import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HeroSettings } from '../../types';
import { PanelsTopLeft, Save, RotateCcw, CheckCircle2, Loader2 } from 'lucide-react';

export const AdminHeroCMS: React.FC = () => {
  const { content, updateWebsiteContent, saveStatus } = useApp();
  const [heroData, setHeroData] = useState<HeroSettings>(content.hero);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateWebsiteContent({ hero: heroData });
    if (ok) {
      setStatusMessage('Hero settings saved successfully!');
      setTimeout(() => setStatusMessage(''), 2500);
    }
  };

  const handleReset = () => {
    setHeroData(content.hero);
    setStatusMessage('Reverted to current published hero values.');
    setTimeout(() => setStatusMessage(''), 2000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#090910] border border-white/10">
        <div>
          <h2 className="text-base sm:text-lg font-display font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Hero Section CMS</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure primary typography, agency kicker badge, and conversion buttons.
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
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-[#12121c] border border-white/10 transition-colors"
            title="Revert"
            aria-label="Revert changes"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

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
                <span>SAVE HERO</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Form Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#090910] border border-white/10 space-y-5">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
            Hero Small Label
          </label>
          <input
            type="text"
            value={heroData.badgeText}
            onChange={(e) => setHeroData({ ...heroData, badgeText: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Headline Line 1 (White)
            </label>
            <input
              type="text"
              value={heroData.headlineLine1}
              onChange={(e) => setHeroData({ ...heroData, headlineLine1: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm font-bold outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Headline Line 2 (Blue Accent)
            </label>
            <input
              type="text"
              value={heroData.headlineLine2}
              onChange={(e) => setHeroData({ ...heroData, headlineLine2: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm font-bold outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
            Supporting Subtitle Line
          </label>
          <input
            type="text"
            value={heroData.supportingLine}
            onChange={(e) => setHeroData({ ...heroData, supportingLine: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
            Paragraph Description
          </label>
          <textarea
            rows={3}
            value={heroData.description}
            onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm outline-none focus:border-blue-500 leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Primary CTA
            </label>
            <input
              type="text"
              value={heroData.primaryCta}
              onChange={(e) => setHeroData({ ...heroData, primaryCta: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Secondary CTA
            </label>
            <input
              type="text"
              value={heroData.secondaryCta}
              onChange={(e) => setHeroData({ ...heroData, secondaryCta: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
