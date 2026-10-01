import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HeroSettings } from '../../types';

export const AdminHeroCMS: React.FC = () => {
  const { content, updateWebsiteContent, saveStatus } = useApp();
  const [heroData, setHeroData] = useState<HeroSettings>(content.hero);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateWebsiteContent({ hero: heroData });
    if (ok) {
      setStatusMessage('Hero settings saved!');
      setTimeout(() => setStatusMessage(''), 2500);
    }
  };

  const handleReset = () => {
    setHeroData(content.hero);
    setStatusMessage('Reverted to current published hero values.');
    setTimeout(() => setStatusMessage(''), 2000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-950 border border-white/10 sticky top-4 z-20 backdrop-blur-md bg-zinc-950/95 shadow-xl">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight">
            Hero Section CMS
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure primary typography, 3D presentation settings, and primary CTA buttons.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {statusMessage && (
            <span className="text-xs font-medium text-blue-400 animate-in fade-in">
              {statusMessage}
            </span>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 border border-white/10 cursor-pointer"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className="px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 transition-all glow-blue-sm cursor-pointer"
          >
            {saveStatus === 'saving' ? 'SAVING...' : 'SAVE HERO'}
          </button>
        </div>
      </div>

      {/* Hero Form Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-white/10 space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Top Eyebrow Badge
          </label>
          <input
            type="text"
            value={heroData.badgeText}
            onChange={(e) => setHeroData({ ...heroData, badgeText: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Headline Line 1
            </label>
            <input
              type="text"
              value={heroData.headlineLine1}
              onChange={(e) => setHeroData({ ...heroData, headlineLine1: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Headline Line 2 (Accent)
            </label>
            <input
              type="text"
              value={heroData.headlineLine2}
              onChange={(e) => setHeroData({ ...heroData, headlineLine2: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Supporting Line
          </label>
          <input
            type="text"
            value={heroData.supportingLine}
            onChange={(e) => setHeroData({ ...heroData, supportingLine: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Hero Description
          </label>
          <textarea
            rows={3}
            value={heroData.description}
            onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Primary Action Button Label
            </label>
            <input
              type="text"
              value={heroData.primaryCta}
              onChange={(e) => setHeroData({ ...heroData, primaryCta: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Secondary Action Button Label
            </label>
            <input
              type="text"
              value={heroData.secondaryCta}
              onChange={(e) => setHeroData({ ...heroData, secondaryCta: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Live Visual Preview Card */}
      <div className="p-6 rounded-2xl bg-[#050508] border border-blue-500/30 space-y-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block font-mono">
          [ LIVE TYPOGRAPHY PREVIEW ]
        </span>
        <div className="space-y-2">
          <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">
            {heroData.badgeText}
          </span>
          <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            <span>{heroData.headlineLine1}</span>{' '}
            <span className="text-blue-500">{heroData.headlineLine2}</span>
          </h3>
          <p className="text-xs text-zinc-300 font-semibold">{heroData.supportingLine}</p>
          <p className="text-xs text-zinc-400 max-w-lg">{heroData.description}</p>
        </div>
      </div>
    </form>
  );
};
