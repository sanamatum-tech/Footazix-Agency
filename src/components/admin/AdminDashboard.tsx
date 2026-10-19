import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Inquiry } from '../../types';
import { inquiryService } from '../../services/inquiryService';
import {
  FolderKanban,
  FileCheck,
  FileClock,
  BriefcaseBusiness,
  UsersRound,
  Inbox,
  Images,
  Plus,
  Globe2,
  ExternalLink,
  ChevronRight,
  Clock,
  Mail,
  CheckCircle,
  Archive,
  Eye,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';

interface AdminDashboardProps {
  onNavigateSection: (section: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateSection }) => {
  const { inquiries, projects, team, services, media, content } = useApp();
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const publishedProjects = projects.filter((p) => p.status === 'published');
  const draftProjects = projects.filter((p) => p.status === 'draft');
  const newInquiries = inquiries.filter((i) => i.status === 'new');
  const recentInquiries = inquiries.slice(0, 5);
  const recentProjects = projects.slice(0, 4);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await inquiryService.updateInquiryStatus(id, 'contacted');
  };

  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await inquiryService.updateInquiryStatus(id, 'archived');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-2xl bg-[#121512] border border-[#292E25] relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#B1FF00] mb-2 px-2.5 py-1 rounded bg-[#181C16] border border-[#B1FF00]/30">
            <span>STUDIO OVERVIEW</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold text-[#F5F7F2] tracking-tight">
            {content.brand.name || 'Footazix'} Studio CMS
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#A7AEA0] leading-relaxed">
            Real-time management for content, video portfolio showcases, agency services, and incoming client inquiries.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateSection('website')}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A7AEA0] bg-[#0D0F10] hover:bg-[#181C16] hover:text-[#F5F7F2] border border-[#292E25] hover:border-[#B1FF00]/40 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Globe2 className="w-3.5 h-3.5 text-[#B1FF00]" />
            <span>Edit Website</span>
          </button>
          <button
            onClick={() => onNavigateSection('portfolio')}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#070809] bg-[#B1FF00] hover:bg-[#C4FF45] active:scale-95 transition-all shadow-[0_0_16px_rgba(177,255,0,0.35)] cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#070809]" />
            <span>Add Project</span>
          </button>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#B1FF00]/10 to-transparent pointer-events-none" />
      </div>

      {/* Useful Metrics Grid — Real Supabase Data */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Published Projects */}
        <div className="p-4 rounded-xl bg-[#121512] border border-[#292E25] flex flex-col justify-between hover:border-[#B1FF00]/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A7AEA0]">
              Published
            </span>
            <FileCheck className="w-4 h-4 text-[#B1FF00]" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-display font-extrabold text-[#F5F7F2] tabular-nums">
              {publishedProjects.length}
            </span>
            <span className="text-[10px] text-[#A7AEA0] font-mono">Live</span>
          </div>
        </div>

        {/* 2. Draft Projects */}
        <div className="p-4 rounded-xl bg-[#121512] border border-[#292E25] flex flex-col justify-between hover:border-[#B1FF00]/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A7AEA0]">
              Drafts
            </span>
            <FileClock className="w-4 h-4 text-[#737B6B]" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-display font-extrabold text-[#A7AEA0] tabular-nums">
              {draftProjects.length}
            </span>
            <span className="text-[10px] text-[#737B6B] font-mono">Queued</span>
          </div>
        </div>

        {/* 3. Services */}
        <div className="p-4 rounded-xl bg-[#121512] border border-[#292E25] flex flex-col justify-between hover:border-[#B1FF00]/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A7AEA0]">
              Services
            </span>
            <BriefcaseBusiness className="w-4 h-4 text-[#B1FF00]" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-display font-extrabold text-[#F5F7F2] tabular-nums">
              {services.length}
            </span>
            <span className="text-[10px] text-[#A7AEA0] font-mono">Active</span>
          </div>
        </div>

        {/* 4. Team Members */}
        <div className="p-4 rounded-xl bg-[#121512] border border-[#292E25] flex flex-col justify-between hover:border-[#B1FF00]/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A7AEA0]">
              Team
            </span>
            <UsersRound className="w-4 h-4 text-[#737B6B]" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-display font-extrabold text-[#F5F7F2] tabular-nums">
              {team.length}
            </span>
            <span className="text-[10px] text-[#A7AEA0] font-mono">Members</span>
          </div>
        </div>

        {/* 5. New Inquiries */}
        <div className="p-4 rounded-xl bg-[#181C16] border border-[#B1FF00]/30 flex flex-col justify-between shadow-[0_0_16px_rgba(177,255,0,0.08)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B1FF00]">
              Inquiries
            </span>
            <Inbox className="w-4 h-4 text-[#B1FF00]" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-display font-extrabold text-[#B1FF00] tabular-nums">
              {newInquiries.length}
            </span>
            <span className="text-[10px] font-mono text-[#070809] font-bold px-1.5 py-0.5 rounded bg-[#B1FF00]">
              New
            </span>
          </div>
        </div>

        {/* 6. Media Assets */}
        <div className="p-4 rounded-xl bg-[#121512] border border-[#292E25] flex flex-col justify-between hover:border-[#B1FF00]/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A7AEA0]">
              Media
            </span>
            <Images className="w-4 h-4 text-[#737B6B]" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-display font-extrabold text-[#F5F7F2] tabular-nums">
              {media.length}
            </span>
            <span className="text-[10px] text-[#A7AEA0] font-mono">Assets</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="p-5 rounded-2xl bg-[#121512] border border-[#292E25]">
        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A7AEA0] block mb-3 font-semibold">
          QUICK ACTIONS
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={() => onNavigateSection('portfolio')}
            className="p-3 rounded-xl bg-[#0D0F10] hover:bg-[#181C16] border border-[#292E25] hover:border-[#B1FF00]/40 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1">
              <Plus className="w-3.5 h-3.5 text-[#B1FF00] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#F5F7F2] group-hover:text-[#B1FF00]">
                Add Project
              </span>
            </div>
            <p className="text-[10px] text-[#A7AEA0]">Post client edit showcase</p>
          </button>

          <button
            onClick={() => onNavigateSection('team')}
            className="p-3 rounded-xl bg-[#0D0F10] hover:bg-[#181C16] border border-[#292E25] hover:border-[#B1FF00]/40 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1">
              <Plus className="w-3.5 h-3.5 text-[#B1FF00] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#F5F7F2] group-hover:text-[#B1FF00]">
                Add Team
              </span>
            </div>
            <p className="text-[10px] text-[#A7AEA0]">Add editor or strategist</p>
          </button>

          <button
            onClick={() => onNavigateSection('services')}
            className="p-3 rounded-xl bg-[#0D0F10] hover:bg-[#181C16] border border-[#292E25] hover:border-[#B1FF00]/40 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1">
              <Plus className="w-3.5 h-3.5 text-[#B1FF00] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#F5F7F2] group-hover:text-[#B1FF00]">
                Add Service
              </span>
            </div>
            <p className="text-[10px] text-[#A7AEA0]">Create new offering</p>
          </button>

          <button
            onClick={() => onNavigateSection('website')}
            className="p-3 rounded-xl bg-[#0D0F10] hover:bg-[#181C16] border border-[#292E25] hover:border-[#B1FF00]/40 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1">
              <Globe2 className="w-3.5 h-3.5 text-[#B1FF00] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#F5F7F2] group-hover:text-[#B1FF00]">
                Edit Website
              </span>
            </div>
            <p className="text-[10px] text-[#A7AEA0]">Update live copy & CTAs</p>
          </button>

          <button
            onClick={() => onNavigateSection('inquiries')}
            className="p-3 rounded-xl bg-[#0D0F10] hover:bg-[#181C16] border border-[#292E25] hover:border-[#B1FF00]/40 text-left transition-all cursor-pointer group col-span-2 sm:col-span-1"
          >
            <div className="flex items-center gap-2 mb-1">
              <Inbox className="w-3.5 h-3.5 text-[#B1FF00] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#F5F7F2] group-hover:text-[#B1FF00]">
                Inquiries ({inquiries.length})
              </span>
            </div>
            <p className="text-[10px] text-[#A7AEA0]">Manage client requests</p>
          </button>
        </div>
      </div>

      {/* Two Column Grid: Recent Inquiries + Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Inquiries (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#121512] border border-[#292E25] overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-[#292E25] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-display font-bold text-[#F5F7F2] tracking-tight">
                  Recent Project Inquiries
                </h2>
                <p className="text-[11px] text-[#A7AEA0] mt-0.5">
                  Submissions received through the public inquiry form.
                </p>
              </div>
              <button
                onClick={() => onNavigateSection('inquiries')}
                className="text-xs font-semibold text-[#B1FF00] hover:text-[#C4FF45] transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <span>View All ({inquiries.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentInquiries.length === 0 ? (
              <div className="p-10 text-center text-[#737B6B] text-xs">
                No inquiries received yet. Inquiries submitted on the site will appear here.
              </div>
            ) : (
              <div className="divide-y divide-[#292E25]">
                {recentInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    onClick={() => setSelectedInquiry(inq)}
                    className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                            inq.status === 'new'
                              ? 'bg-[#181C16] text-[#B1FF00] border border-[#B1FF00]/40'
                              : inq.status === 'contacted'
                              ? 'bg-zinc-800 text-zinc-300'
                              : 'bg-zinc-900 text-zinc-400'
                          }`}
                        >
                          {inq.status}
                        </span>
                        <h3 className="text-xs font-bold text-[#F5F7F2] truncate">
                          {inq.name}
                        </h3>
                        {inq.company && (
                          <span className="text-[11px] text-[#A7AEA0] truncate hidden sm:inline">
                            · {inq.company}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#A7AEA0] truncate max-w-md">
                        {inq.details}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-[#737B6B] font-mono">
                        <Clock className="w-3 h-3 text-[#737B6B]" />
                        <span>{inq.createdAt}</span>
                        <span>·</span>
                        <Mail className="w-3 h-3 text-[#737B6B]" />
                        <span className="truncate">{inq.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {inq.status === 'new' && (
                        <button
                          onClick={(e) => handleMarkRead(inq.id, e)}
                          title="Mark contacted"
                          className="p-1.5 rounded-lg text-[#B1FF00] hover:text-[#070809] hover:bg-[#B1FF00] border border-[#B1FF00]/30 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedInquiry(inq)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#A7AEA0] bg-[#0D0F10] hover:text-[#F5F7F2] border border-[#292E25]"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recently Updated Projects (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#121512] border border-[#292E25] overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-[#292E25] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-display font-bold text-[#F5F7F2] tracking-tight">
                  Portfolio Showcase
                </h2>
                <p className="text-[11px] text-[#A7AEA0] mt-0.5">
                  High-retention client edits on the live site.
                </p>
              </div>
              <button
                onClick={() => onNavigateSection('portfolio')}
                className="text-xs font-semibold text-[#B1FF00] hover:text-[#C4FF45] transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentProjects.length === 0 ? (
              <div className="p-10 text-center text-[#737B6B] text-xs">
                No portfolio projects added yet.
              </div>
            ) : (
              <div className="divide-y divide-[#292E25]">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => onNavigateSection('portfolio')}
                    className="p-3.5 hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-10 rounded-lg overflow-hidden bg-zinc-900 shrink-0 border border-[#292E25]">
                        <img
                          src={project.coverImage}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-[#F5F7F2] truncate group-hover:text-[#B1FF00] transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-[10px] text-[#737B6B] font-mono">
                          {project.category} {project.client ? `· ${project.client}` : ''}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold shrink-0 ${
                        project.status === 'published'
                          ? 'bg-[#181C16] text-[#B1FF00] border border-[#B1FF00]/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inquiry Detail Drawer / Modal */}
      {selectedInquiry && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setSelectedInquiry(null)}
        >
          <div
            className="w-full max-w-lg bg-[#121512] border border-[#292E25] rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#181C16] text-[#B1FF00] border border-[#B1FF00]/40">
                  {selectedInquiry.status}
                </span>
                <h3 className="text-lg font-bold text-[#F5F7F2] mt-2">
                  {selectedInquiry.name}
                </h3>
                <p className="text-xs text-[#A7AEA0]">
                  {selectedInquiry.email} {selectedInquiry.phone && `· ${selectedInquiry.phone}`}
                </p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-lg text-[#A7AEA0] hover:text-white bg-[#0D0F10] border border-[#292E25]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs border-y border-[#292E25] py-4">
              <div>
                <span className="text-[#A7AEA0] uppercase tracking-wider text-[10px] font-bold block mb-1">
                  Requested Services
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedInquiry.services.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded bg-[#0D0F10] border border-[#292E25] text-[#F5F7F2] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {selectedInquiry.budget && (
                <div>
                  <span className="text-[#A7AEA0] uppercase tracking-wider text-[10px] font-bold block mb-0.5">
                    Budget Preference
                  </span>
                  <p className="text-[#F5F7F2]">{selectedInquiry.budget}</p>
                </div>
              )}

              <div>
                <span className="text-[#A7AEA0] uppercase tracking-wider text-[10px] font-bold block mb-1">
                  Project Details
                </span>
                <div className="p-3.5 rounded-xl bg-[#0D0F10] text-[#F5F7F2] leading-relaxed font-normal whitespace-pre-wrap">
                  {selectedInquiry.details}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await inquiryService.updateInquiryStatus(selectedInquiry.id, 'contacted');
                    setSelectedInquiry({ ...selectedInquiry, status: 'contacted' });
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#070809] bg-[#B1FF00] hover:bg-[#C4FF45] transition-colors cursor-pointer"
                >
                  Mark as Contacted
                </button>
                <button
                  onClick={async () => {
                    await inquiryService.updateInquiryStatus(selectedInquiry.id, 'completed');
                    setSelectedInquiry({ ...selectedInquiry, status: 'completed' });
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#A7AEA0] bg-[#0D0F10] hover:text-white border border-[#292E25] transition-colors cursor-pointer"
                >
                  Mark Completed
                </button>
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-xs text-[#737B6B] hover:text-white cursor-pointer"
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
