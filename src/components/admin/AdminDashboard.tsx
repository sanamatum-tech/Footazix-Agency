import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Inquiry } from '../../types';
import { inquiryService } from '../../services/inquiryService';

interface AdminDashboardProps {
  onNavigateSection: (section: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateSection }) => {
  const { inquiries, projects, team, services, content } = useApp();
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const newInquiries = inquiries.filter((i) => i.status === 'new');
  const recentInquiries = inquiries.slice(0, 5);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await inquiryService.updateInquiryStatus(id, 'contacted');
  };

  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await inquiryService.updateInquiryStatus(id, 'archived');
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-blue-950/30 border border-white/10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-2 px-2.5 py-1 rounded bg-blue-950/60 border border-blue-500/30">
            <span>STUDIO DASHBOARD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight mb-2">
            Welcome to {content.brand.name} CMS
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Manage your public landing page, high-retention video portfolio, services, and client inquiries from one central control panel.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-blue-soft pointer-events-none" />
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Stat 1: Total Project Requests */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Project Requests
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-display font-extrabold text-white">
              {inquiries.length}
            </span>
            <span className="text-xs font-medium text-blue-400 font-mono">Total</span>
          </div>
        </div>

        {/* Stat 2: New Requests */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-blue-500/30 bg-blue-950/10 flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
            New Requests
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-display font-extrabold text-blue-400">
              {newInquiries.length}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 font-mono">
              Action Req.
            </span>
          </div>
        </div>

        {/* Stat 3: Portfolio Projects */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Portfolio Projects
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-display font-extrabold text-white">
              {projects.length}
            </span>
            <span className="text-xs font-medium text-zinc-500 font-mono">
              {projects.filter((p) => p.status === 'published').length} Active
            </span>
          </div>
        </div>

        {/* Stat 4: Team Members */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Team Members
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-display font-extrabold text-white">
              {team.length}
            </span>
            <span className="text-xs font-medium text-zinc-500 font-mono">Active</span>
          </div>
        </div>

        {/* Stat 5: Published Content */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col justify-between col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Services
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-display font-extrabold text-white">
              {services.length}
            </span>
            <span className="text-xs font-medium text-zinc-500 font-mono">Published</span>
          </div>
        </div>
      </div>

      {/* Quick Access CMS Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigateSection('website')}
          className="p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-white/10 hover:border-blue-500/40 text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
              Website Copy & Headings
            </span>
            <span className="text-blue-400 text-xs">→</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Update headlines, descriptions, CTAs, and footer information live.
          </p>
        </button>

        <button
          onClick={() => onNavigateSection('vsl')}
          className="p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-white/10 hover:border-blue-500/40 text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
              VSL Settings
            </span>
            <span className="text-blue-400 text-xs">→</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Configure video source (YouTube, Google Drive, Direct file) & caption file.
          </p>
        </button>

        <button
          onClick={() => onNavigateSection('portfolio')}
          className="p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-white/10 hover:border-blue-500/40 text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
              Portfolio Projects
            </span>
            <span className="text-blue-400 text-xs">→</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Add new client edits, reorder showcases, and change categories.
          </p>
        </button>
      </div>

      {/* Recent Inquiries Card */}
      <div className="rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              Recent Project Inquiries
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Client requests submitted via the public website inquiry form.
            </p>
          </div>
          <button
            onClick={() => onNavigateSection('inquiries')}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
          >
            View All ({inquiries.length}) →
          </button>
        </div>

        {recentInquiries.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No inquiries received yet. Submit a test from the public site!
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentInquiries.map((inq) => (
              <div
                key={inq.id}
                onClick={() => setSelectedInquiry(inq)}
                className="p-5 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        inq.status === 'new'
                          ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                          : inq.status === 'contacted'
                          ? 'bg-zinc-800 text-zinc-300'
                          : 'bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      {inq.status}
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {inq.name}
                    </h3>
                    {inq.company && (
                      <span className="text-xs text-zinc-500">
                        • {inq.company}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1 max-w-xl">
                    <span className="text-blue-400 font-medium">{inq.services.join(', ')}</span>: {inq.details}
                  </p>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    {inq.createdAt} • {inq.email}
                  </p>
                </div>

                {/* Actions: View, Mark Read, Archive */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedInquiry(inq)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 bg-zinc-900 hover:text-white hover:bg-zinc-800 border border-white/10 transition-colors cursor-pointer"
                  >
                    View
                  </button>

                  {inq.status === 'new' && (
                    <button
                      onClick={(e) => handleMarkRead(inq.id, e)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-400 bg-blue-950/40 hover:bg-blue-900/40 border border-blue-500/30 transition-colors cursor-pointer"
                    >
                      Mark Read
                    </button>
                  )}

                  {inq.status !== 'archived' && (
                    <button
                      onClick={(e) => handleArchive(inq.id, e)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                      Archive
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setSelectedInquiry(null)}
        >
          <div
            className="w-full max-w-xl bg-zinc-950 border border-white/15 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-500/40">
                  {selectedInquiry.status}
                </span>
                <h3 className="text-xl font-bold text-white mt-2">
                  {selectedInquiry.name}
                </h3>
                <p className="text-xs text-zinc-400">
                  {selectedInquiry.email} {selectedInquiry.phone && `• ${selectedInquiry.phone}`}
                </p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white bg-zinc-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs border-y border-white/10 py-4">
              <div>
                <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-bold block mb-1">
                  Requested Services
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedInquiry.services.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded bg-zinc-900 border border-white/10 text-white font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {selectedInquiry.budget && (
                <div>
                  <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">
                    Budget Preference
                  </span>
                  <p className="text-zinc-200">{selectedInquiry.budget}</p>
                </div>
              )}

              <div>
                <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-bold block mb-1">
                  Project Details
                </span>
                <div className="p-3.5 rounded-xl bg-zinc-900 text-zinc-200 leading-relaxed font-normal whitespace-pre-wrap">
                  {selectedInquiry.details}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await inquiryService.updateInquiryStatus(selectedInquiry.id, 'contacted');
                    setSelectedInquiry({ ...selectedInquiry, status: 'contacted' });
                  }}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                >
                  Mark as Contacted
                </button>
                <button
                  onClick={async () => {
                    await inquiryService.updateInquiryStatus(selectedInquiry.id, 'completed');
                    setSelectedInquiry({ ...selectedInquiry, status: 'completed' });
                  }}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-zinc-300 bg-zinc-900 hover:text-white border border-white/10 transition-colors"
                >
                  Mark Completed
                </button>
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
