import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { isSupabaseConfigured } from '../../lib/supabase';

export const AdminSettings: React.FC = () => {
  const { content, projects, services, team, inquiries, media, resetWebsiteContent, refreshAll } = useApp();
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  const supabaseUrlEnv = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const supabaseKeyEnv = (
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    ''
  ).trim();

  const isConfigured = isSupabaseConfigured();

  const handleExportJSON = () => {
    const fullBackup = {
      exportDate: new Date().toISOString(),
      brand: 'FOOTAZIX',
      supabaseConnected: isConfigured,
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

  const handleCopySqlInstructions = () => {
    const sampleSql = `-- Run this in Supabase SQL Editor:
-- File is located at: supabase/schema.sql
-- 1. site_settings
-- 2. hero_content
-- 3. vsl_settings
-- 4. projects
-- 5. services
-- 6. team_members
-- 7. about_content
-- 8. inquiries
-- 9. admin_profiles
-- + storage bucket: footazix-media`;
    navigator.clipboard.writeText(sampleSql);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  const handleResetEverything = async () => {
    if (window.confirm('Reset ALL website settings, portfolio, and CMS content back to initial defaults?')) {
      localStorage.clear();
      sessionStorage.clear();
      await resetWebsiteContent();
      await refreshAll();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight">
            Studio CMS & Supabase Configuration
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cloud database status, Row Level Security, backups, and system defaults.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isConfigured ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Supabase Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Credentials Pending
            </span>
          )}
        </div>
      </div>

      {/* Supabase Status & Checklist Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-blue-500/30 bg-blue-950/10 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Supabase Cloud Integration</span>
          </div>

          <button
            onClick={handleCopySqlInstructions}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-mono cursor-pointer"
          >
            {sqlCopied ? '✓ Copied SQL path' : 'Copy SQL Schema Path'}
          </button>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          The Footazix architecture connects directly to Supabase via <code className="text-blue-400">@supabase/supabase-js</code>. All 9 relational tables, Row Level Security (RLS) policies, and storage bucket configuration are defined in <code className="text-blue-400">supabase/schema.sql</code>.
        </p>

        {/* Environment Variables Checklist */}
        <div className="space-y-2.5 pt-1 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-white/10">
            <div>
              <span className="font-mono text-zinc-300 block">VITE_SUPABASE_URL</span>
              <span className="text-[11px] text-zinc-500">
                {supabaseUrlEnv ? `${supabaseUrlEnv.substring(0, 32)}...` : 'Not set in environment'}
              </span>
            </div>
            <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${supabaseUrlEnv ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
              {supabaseUrlEnv ? 'Active' : 'Missing'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-white/10">
            <div>
              <span className="font-mono text-zinc-300 block">VITE_SUPABASE_PUBLISHABLE_KEY</span>
              <span className="text-[11px] text-zinc-500">
                {supabaseKeyEnv ? `${supabaseKeyEnv.substring(0, 16)}...` : 'Not set in environment'}
              </span>
            </div>
            <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${supabaseKeyEnv ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
              {supabaseKeyEnv ? 'Active' : 'Missing'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-white/10">
            <div>
              <span className="font-mono text-zinc-300 block">Storage Bucket (footazix-media)</span>
              <span className="text-[11px] text-zinc-500">Public bucket for video posters, team photos & reels</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950 border border-blue-500/40 text-blue-400">
              Configured
            </span>
          </div>
        </div>

        {/* Database Tables Summary */}
        <div className="pt-2 border-t border-white/10">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
            Schema Tables (RLS Protected):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-zinc-300">
            <div className="p-2 rounded bg-zinc-900/60 border border-white/5">1. site_settings</div>
            <div className="p-2 rounded bg-zinc-900/60 border border-white/5">2. hero_content</div>
            <div className="p-2 rounded bg-zinc-900/60 border border-white/5">3. vsl_settings</div>
            <div className="p-2 rounded bg-zinc-900/60 border border-white/5">4. projects</div>
            <div className="p-2 rounded bg-zinc-900/60 border border-white/5">5. services</div>
            <div className="p-2 rounded bg-zinc-900/60 border border-white/5">6. team_members</div>
            <div className="p-2 rounded bg-zinc-900/60 border border-white/5">7. about_content</div>
            <div className="p-2 rounded bg-zinc-900/60 border border-white/5">8. inquiries</div>
            <div className="p-2 rounded bg-zinc-900/60 border border-white/5">9. admin_profiles</div>
          </div>
        </div>
      </div>

      {/* JSON Backup & Migration Export */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Export CMS Data (JSON Backup)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Download current website configuration, portfolio projects, team members, and client inquiries.
            </p>
          </div>

          <button
            onClick={handleExportJSON}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all glow-blue-sm cursor-pointer whitespace-nowrap self-start sm:self-center"
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
              Clears localStorage and restores initial Footazix brand dataset.
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
