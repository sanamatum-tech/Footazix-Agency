import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Settings2, Download, RefreshCw, CheckCircle2, Database, ShieldCheck, Copy, Check } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { content, projects, services, team, inquiries, media, refreshAll } = useApp();
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshAll();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleCopySchemaPath = () => {
    navigator.clipboard.writeText('supabase/schema.sql');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#090910] border border-white/10">
        <div>
          <h2 className="text-base sm:text-lg font-display font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Studio System Settings</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Database synchronization, full data backup export, and system configuration.
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-200 bg-[#12121c] hover:bg-[#1a1a26] border border-white/10 transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sync State</span>
        </button>
      </div>

      {/* Database & Security Status */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#090910] border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Database & Security Architecture</h3>
            <p className="text-xs text-zinc-400">
              Row Level Security (RLS) policies and authentication active on all 9 tables.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-[#12121c] border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">Tables</span>
            <span className="text-sm font-bold text-white">9 Active Tables</span>
            <span className="text-[10px] text-zinc-400 font-mono block">projects, inquiries, settings...</span>
          </div>

          <div className="p-4 rounded-xl bg-[#12121c] border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">Security</span>
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>RLS Enforced</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-mono block">Public read / Admin write</span>
          </div>

          <div className="p-4 rounded-xl bg-[#12121c] border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">Storage Bucket</span>
            <span className="text-sm font-bold text-white font-mono text-xs">footazix-media</span>
            <span className="text-[10px] text-zinc-400 font-mono block">Posters, stills, videos</span>
          </div>
        </div>
      </div>

      {/* JSON Backup Export */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#090910] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-400" />
              <span>Export Full CMS Backup (JSON)</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Download a complete JSON snapshot containing all website content, projects, services, team members, inquiries, and media assets.
            </p>
          </div>

          <button
            onClick={handleExportJSON}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-[0_0_16px_rgba(37,99,235,0.3)] cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Schema Reference */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#090910] border border-white/10 space-y-3">
        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400 font-bold block">
          SQL MIGRATIONS REFERENCE
        </span>
        <p className="text-xs text-zinc-400">
          The canonical database schema and RLS policies are maintained in your repository:
        </p>
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#12121c] border border-white/10 font-mono text-xs text-zinc-300">
          <span>supabase/schema.sql</span>
          <button
            onClick={handleCopySchemaPath}
            className="text-xs text-blue-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Path'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
