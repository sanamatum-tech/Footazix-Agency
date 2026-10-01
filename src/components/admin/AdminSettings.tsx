import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const AdminSettings: React.FC = () => {
  const { content, projects, services, team, inquiries, media, resetWebsiteContent } = useApp();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportJSON = () => {
    const fullBackup = {
      exportDate: new Date().toISOString(),
      brand: 'FOOTAZIX',
      phase: 'Phase 1 - Frontend Local State',
      supabaseMigrationReady: true,
      websiteContent: content,
      projects,
      services,
      team,
      inquiries,
      media,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `footazix-cms-backup-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleResetEverything = async () => {
    if (window.confirm('Reset ALL website settings, portfolio, and CMS content back to initial defaults?')) {
      localStorage.clear();
      sessionStorage.clear();
      await resetWebsiteContent();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10">
        <h2 className="text-xl font-display font-bold text-white tracking-tight">
          Studio CMS Settings & Architecture
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Data backup, export for future Supabase migration, and system defaults.
        </p>
      </div>

      {/* Future Supabase Architecture Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-blue-500/30 bg-blue-950/10 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Phase 2 Backend Architecture Blueprint</span>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          The current UI is built with a strictly decoupled service layer (<code className="text-blue-400">src/services/*</code>). When connecting Supabase in Phase 2, the UI components will require zero redesign.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/10">
            <span className="font-bold text-white block mb-1">Supabase Auth</span>
            <p className="text-[11px] text-zinc-400">
              Replaces <code className="text-blue-400">authService.ts</code> with email/password authentication & session tokens.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/10">
            <span className="font-bold text-white block mb-1">PostgreSQL Tables</span>
            <p className="text-[11px] text-zinc-400">
              Maps to <code className="text-blue-400">portfolio_projects</code>, <code className="text-blue-400">services</code>, <code className="text-blue-400">team_members</code>, and <code className="text-blue-400">inquiries</code>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/10">
            <span className="font-bold text-white block mb-1">Supabase Storage</span>
            <p className="text-[11px] text-zinc-400">
              Replaces local object URLs with persistent cloud buckets for VSL posters, reels, and team photos.
            </p>
          </div>
        </div>
      </div>

      {/* JSON Backup & Migration Export */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              Export CMS Data (JSON)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Download your full local website configuration, portfolio projects, team roster, and client inquiries as a JSON file.
            </p>
          </div>

          <button
            onClick={handleExportJSON}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all glow-blue-sm cursor-pointer whitespace-nowrap"
          >
            {downloadSuccess ? '✓ DOWNLOADED' : 'EXPORT JSON BACKUP'}
          </button>
        </div>
      </div>

      {/* Danger Zone: Factory Reset */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-red-500/20 space-y-3">
        <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">
          Danger Zone
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <span className="text-xs font-semibold text-white block">
              Reset All Local State to Defaults
            </span>
            <span className="text-[11px] text-zinc-500">
              Clears localStorage and restores initial Footazix brand mock dataset.
            </span>
          </div>

          <button
            onClick={handleResetEverything}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 transition-colors cursor-pointer self-start sm:self-center"
          >
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
};
