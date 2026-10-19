/**
-- ==============================================================================
-- FOOTAZIX — Client Portal: Overview Dashboard
-- File: src/components/clients/ClientOverview.tsx
-- ==============================================================================
* 
* Requirements Enforced:
* - Real database numbers (Total videos, delivered, in-progress, pending, awaiting feedback, documents, outstanding invoices)
* - Zero hardcoded sample figures
* - Personalized welcome message
* - CMS-controlled announcements
* - Recent activity feed
* - Direct action shortcuts
*/

import React from 'react';
import {
  ClientAccount,
  ClientDashboardStats,
  ClientDeliverable,
  ClientDocument,
  ClientInvoice,
  ClientFeedback,
} from '../../types/clientPortal';
import {
  Video,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  Receipt,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  AlertCircle,
  ExternalLink,
  Play,
} from 'lucide-react';

interface ClientOverviewProps {
  client: ClientAccount;
  stats: ClientDashboardStats;
  deliverables: ClientDeliverable[];
  documents: ClientDocument[];
  invoices: ClientInvoice[];
  feedback: ClientFeedback[];
  onNavigateTab: (tab: string) => void;
  onWatchVideo: (video: ClientDeliverable) => void;
  onOpenFeedback: (video?: ClientDeliverable) => void;
}

export const ClientOverview: React.FC<ClientOverviewProps> = ({
  client,
  stats,
  deliverables,
  documents,
  invoices,
  feedback,
  onNavigateTab,
  onWatchVideo,
  onOpenFeedback,
}) => {
  const latestDeliverable = deliverables[0] || null;
  const latestInvoice = invoices[0] || null;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* 1. Welcome Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0c0c16] via-[#090910] to-[#050508] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              {client.company_name || 'Active Client Workspace'}
            </span>
            <span className="text-xs text-zinc-500">·</span>
            <span className="text-xs text-zinc-400 font-mono">
              Signed in as {client.email}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {client.portal_title || `Welcome, ${client.full_name}`}
          </h1>

          <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">
            {client.welcome_message ||
              'Welcome to your private deliverables and project portal. Review edits, monitor approvals, and download assets.'}
          </p>
        </div>
      </div>

      {/* 2. CMS-Controlled Announcement Banner (if configured) */}
      {client.announcement && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 transition-all ${
            client.announcement_type === 'alert'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : client.announcement_type === 'important'
              ? 'bg-blue-600/15 border-blue-500/30 text-blue-200'
              : 'bg-[#0e0e18] border-white/10 text-zinc-300'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div className="space-y-0.5 flex-1">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400">
              Agency Announcement
            </div>
            <p className="text-xs sm:text-sm leading-relaxed">{client.announcement}</p>
          </div>
        </div>
      )}

      {/* 3. Real Deliverables & Project Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Videos */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#090910] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Total Deliverables</span>
            <Video className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {stats.totalVideos}
          </div>
          <div className="text-[11px] text-zinc-500 truncate">
            Assigned project edits
          </div>
        </div>

        {/* Metric 2: Delivered */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#090910] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Delivered / Ready</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {stats.deliveredVideos}
          </div>
          <div className="text-[11px] text-blue-400/80 font-medium truncate">
            {stats.totalVideos > 0
              ? `${Math.round((stats.deliveredVideos / stats.totalVideos) * 100)}% completed`
              : 'Zero backlog'}
          </div>
        </div>

        {/* Metric 3: Awaiting Feedback */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#090910] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Needs Review</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {stats.awaitingFeedbackVideos}
          </div>
          <div className="text-[11px] text-zinc-400 truncate">
            Awaiting your feedback
          </div>
        </div>

        {/* Metric 4: Invoices / Documents */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#090910] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Pending Invoices</span>
            <Receipt className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {stats.outstandingInvoices}
          </div>
          <div className="text-[11px] text-zinc-500 truncate">
            {stats.availableDocuments} docs in vault
          </div>
        </div>
      </div>

      {/* 4. Highlighted Latest Deliverable Card */}
      {latestDeliverable && (
        <div className="p-6 rounded-3xl bg-[#090910] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Latest Deliverable
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('videos')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All Videos ({deliverables.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-4 rounded-2xl bg-[#0e0e18] border border-white/5">
            <div className="flex items-center gap-4">
              <div
                onClick={() => onWatchVideo(latestDeliverable)}
                className="w-20 h-14 rounded-xl bg-black border border-white/10 overflow-hidden relative group cursor-pointer shrink-0"
              >
                {latestDeliverable.thumbnail_url ? (
                  <img
                    src={latestDeliverable.thumbnail_url}
                    alt={latestDeliverable.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                    <Video className="w-5 h-5" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                  <Play className="w-5 h-5 text-white drop-shadow" fill="currentColor" />
                </div>
              </div>

              <div className="space-y-1 truncate">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {latestDeliverable.category}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {latestDeliverable.delivery_date}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {latestDeliverable.title}
                </h3>
                <p className="text-xs text-zinc-400 truncate max-w-md">
                  {latestDeliverable.description || 'Delivered video edit ready for review.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
              <button
                type="button"
                onClick={() => onOpenFeedback(latestDeliverable)}
                className="px-3.5 py-2 rounded-xl bg-[#181826] hover:bg-[#202032] border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Give Notes</span>
              </button>
              <button
                type="button"
                onClick={() => onWatchVideo(latestDeliverable)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" fill="currentColor" />
                <span>Watch Video</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Two Columns: Quick Shortcuts & Recent Feedback/Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Quick Portal Actions */}
        <div className="p-6 rounded-3xl bg-[#090910] border border-white/10 space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            Quick Navigation Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('videos')}
              className="p-4 rounded-2xl bg-[#0e0e18] hover:bg-[#141422] border border-white/5 hover:border-blue-500/30 text-left transition-all cursor-pointer group space-y-1"
            >
              <div className="flex items-center justify-between text-zinc-400 group-hover:text-blue-400">
                <Video className="w-4 h-4" />
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-xs font-bold text-white">Video Deliverables</div>
              <div className="text-[11px] text-zinc-500">
                {deliverables.length} total edits assigned
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('documents')}
              className="p-4 rounded-2xl bg-[#0e0e18] hover:bg-[#141422] border border-white/5 hover:border-blue-500/30 text-left transition-all cursor-pointer group space-y-1"
            >
              <div className="flex items-center justify-between text-zinc-400 group-hover:text-blue-400">
                <FileText className="w-4 h-4" />
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-xs font-bold text-white">Documents Vault</div>
              <div className="text-[11px] text-zinc-500">
                {documents.length} agreements & briefs
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('invoices')}
              className="p-4 rounded-2xl bg-[#0e0e18] hover:bg-[#141422] border border-white/5 hover:border-blue-500/30 text-left transition-all cursor-pointer group space-y-1"
            >
              <div className="flex items-center justify-between text-zinc-400 group-hover:text-blue-400">
                <Receipt className="w-4 h-4" />
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-xs font-bold text-white">Invoices & Billing</div>
              <div className="text-[11px] text-zinc-500">
                {invoices.length} invoices on file
              </div>
            </button>

            <button
              type="button"
              onClick={() => onOpenFeedback()}
              className="p-4 rounded-2xl bg-[#0e0e18] hover:bg-[#141422] border border-white/5 hover:border-blue-500/30 text-left transition-all cursor-pointer group space-y-1"
            >
              <div className="flex items-center justify-between text-zinc-400 group-hover:text-blue-400">
                <MessageSquare className="w-4 h-4" />
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-xs font-bold text-white">Direct Feedback</div>
              <div className="text-[11px] text-zinc-500">
                Submit new notes to editors
              </div>
            </button>
          </div>
        </div>

        {/* Right: Recent Feedback & Status Tracker */}
        <div className="p-6 rounded-3xl bg-[#090910] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Recent Activity & Status
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab('feedback')}
              className="text-xs text-blue-400 hover:underline cursor-pointer"
            >
              View History
            </button>
          </div>

          <div className="space-y-2.5">
            {feedback.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                No recent feedback or revision requests submitted yet.
              </div>
            ) : (
              feedback.slice(0, 3).map((fb) => (
                <div
                  key={fb.id}
                  className="p-3.5 rounded-2xl bg-[#0e0e18] border border-white/5 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-200">
                      {fb.deliverable_title || fb.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        fb.status === 'RESOLVED'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {fb.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    "{fb.message}"
                  </p>
                  {fb.admin_response && (
                    <div className="text-[11px] text-blue-400 pt-1 border-t border-white/5">
                      <strong>Agency reply:</strong> {fb.admin_response}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
