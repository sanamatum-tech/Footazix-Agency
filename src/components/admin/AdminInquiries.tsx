import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Inquiry, InquiryStatus } from '../../types';
import { inquiryService } from '../../services/inquiryService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  Inbox,
  Search,
  ChevronRight,
  Clock,
  Mail,
  Phone,
  Building,
  DollarSign,
  FileText,
  Trash2,
  X,
  CheckCircle2,
  Save,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STATUS_FILTERS: Array<'ALL' | InquiryStatus> = [
  'ALL',
  'new',
  'contacted',
  'in_progress',
  'completed',
  'archived',
];

export const AdminInquiries: React.FC = () => {
  const { inquiries } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | InquiryStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeInquiry, setActiveInquiry] = useState<Inquiry | null>(null);
  const [notesText, setNotesText] = useState('');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async (showNotification: boolean = false) => {
    setIsRefreshing(true);
    try {
      await inquiryService.getInquiries();
      if (showNotification) {
        setToast('Inquiries refreshed from Supabase.');
        setTimeout(() => setToast(null), 2000);
      }
    } catch {
      if (showNotification) {
        setToast('Could not refresh inquiries.');
        setTimeout(() => setToast(null), 2500);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Fetch latest inquiries on component mount
  useEffect(() => {
    handleRefresh(false);
  }, [handleRefresh]);

  // Subscribe to real-time changes on the Supabase inquiries table
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured() || !client) return;

    const channel = client
      .channel('admin-inquiries-live-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries' },
        () => {
          inquiryService.getInquiries();
        }
      )
      .subscribe();

    // Secondary background poll every 25 seconds
    const interval = setInterval(() => {
      inquiryService.getInquiries();
    }, 25000);

    return () => {
      client.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const filtered = inquiries.filter((inq) => {
    const matchesFilter = selectedFilter === 'ALL' || inq.status === selectedFilter;
    const matchesSearch =
      searchQuery === '' ||
      inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inq.company && inq.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      inq.services.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleOpenDetail = (inq: Inquiry) => {
    setActiveInquiry(inq);
    setNotesText(inq.notes || '');
  };

  const handleChangeStatus = async (id: string, status: InquiryStatus) => {
    await inquiryService.updateInquiryStatus(id, status);
    if (activeInquiry && activeInquiry.id === id) {
      setActiveInquiry({ ...activeInquiry, status });
    }
    setToast(`Status updated to "${status.replace('_', ' ')}"`);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSaveNotes = async () => {
    if (!activeInquiry) return;
    await inquiryService.updateInquiryNotes(activeInquiry.id, notesText);
    setActiveInquiry({ ...activeInquiry, notes: notesText });
    setToast('Internal notes saved.');
    setTimeout(() => setToast(null), 2500);
  };

  const confirmDelete = async (id: string) => {
    await inquiryService.deleteInquiry(id);
    if (activeInquiry?.id === id) setActiveInquiry(null);
    setIsDeletingId(null);
    setToast('Inquiry deleted.');
    setTimeout(() => setToast(null), 2500);
  };

  // Strictly neutral & blue palette (anti-green, anti-purple rule)
  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case 'new':
        return 'bg-blue-600/25 text-blue-300 border-blue-500/40';
      case 'contacted':
        return 'bg-zinc-800 text-zinc-200 border-white/10';
      case 'in_progress':
        return 'bg-blue-950/70 text-blue-300 border-blue-500/30';
      case 'completed':
        return 'bg-zinc-900 text-zinc-300 border-white/15';
      case 'archived':
        return 'bg-zinc-900/60 text-zinc-500 border-white/5';
      default:
        return 'bg-zinc-900 text-zinc-400 border-white/10';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#090910] border border-white/10">
        <div>
          <h2 className="text-base sm:text-lg font-display font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Project Inquiries</span>
            <span className="text-xs font-mono font-normal text-zinc-400">
              ({inquiries.length} total)
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Private CRM of client project briefs submitted via the public website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {toast && (
            <span className="text-xs text-blue-400 font-medium animate-in fade-in flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{toast}</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => handleRefresh(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 bg-[#12121c] hover:bg-[#1a1a29] border border-white/10 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            title="Fetch latest client submissions from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#090910] border border-white/10">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, email, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#12121c] border border-white/10 text-white text-xs placeholder-zinc-500 outline-none focus:border-blue-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
                selectedFilter === f
                  ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                  : 'text-zinc-400 hover:text-white bg-[#12121c] border border-white/5'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* CRM Table */}
      <div className="rounded-2xl bg-[#090910] border border-white/10 overflow-hidden shadow-xl">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs space-y-2">
            <Inbox className="w-8 h-8 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No inquiries found</h3>
            <p className="text-xs text-zinc-400">
              {searchQuery || selectedFilter !== 'ALL'
                ? 'Try clearing your search query or status filter.'
                : 'Client inquiries submitted via the website form will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#0d0d16] text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Company</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Email</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell">Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filtered.map((inq) => (
                  <tr
                    key={inq.id}
                    onClick={() => handleOpenDetail(inq)}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {inq.name}
                    </td>
                    <td className="py-3 px-4 text-zinc-400 hidden md:table-cell whitespace-nowrap">
                      {inq.company || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-blue-400 font-medium truncate block max-w-[160px]">
                        {inq.services.join(', ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400 font-mono hidden sm:table-cell whitespace-nowrap">
                      {inq.email}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(
                          inq.status
                        )}`}
                      >
                        {inq.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400 font-mono text-[11px] hidden lg:table-cell whitespace-nowrap">
                      {inq.createdAt}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(inq);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-300 bg-[#12121c] group-hover:text-white border border-white/10 inline-flex items-center gap-1"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3 h-3 text-zinc-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inquiry Detail Slide-Over / Modal */}
      {activeInquiry && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setActiveInquiry(null)}
        >
          <div
            className="w-full max-w-xl bg-[#0b0b14] border border-white/15 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div>
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(
                    activeInquiry.status
                  )}`}
                >
                  {activeInquiry.status.replace('_', ' ')}
                </span>
                <h3 className="text-lg font-bold text-white mt-2">
                  {activeInquiry.name}
                </h3>
                {activeInquiry.company && (
                  <p className="text-xs text-zinc-400">{activeInquiry.company}</p>
                )}
              </div>
              <button
                onClick={() => setActiveInquiry(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-[#12121c]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#12121c] text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a href={`mailto:${activeInquiry.email}`} className="hover:underline truncate">
                  {activeInquiry.email}
                </a>
              </div>
              {activeInquiry.phone && (
                <div className="flex items-center gap-2 text-zinc-300">
                  <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <a href={`tel:${activeInquiry.phone}`} className="hover:underline">
                    {activeInquiry.phone}
                  </a>
                </div>
              )}
              {activeInquiry.budget && (
                <div className="flex items-center gap-2 text-zinc-300">
                  <DollarSign className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Budget: {activeInquiry.budget}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>{activeInquiry.createdAt}</span>
              </div>
            </div>

            {/* Requested services */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Requested Services
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeInquiry.services.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg bg-[#12121c] border border-white/10 text-white text-xs font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Project Details */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Project Details / Brief
              </span>
              <div className="p-4 rounded-xl bg-[#12121c] text-zinc-200 text-xs leading-relaxed whitespace-pre-wrap font-normal">
                {activeInquiry.details}
              </div>
            </div>

            {/* Status Change Selector */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Update Status
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {(['new', 'contacted', 'in_progress', 'completed', 'archived'] as InquiryStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleChangeStatus(activeInquiry.id, st)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-mono uppercase font-bold tracking-wider transition-colors ${
                        activeInquiry.status === st
                          ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                          : 'bg-[#12121c] text-zinc-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Internal Notes */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Internal Studio Notes
              </span>
              <textarea
                rows={2}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Add private team notes regarding budget negotiation, schedule, or deliverable agreements..."
                className="w-full p-3 rounded-xl bg-[#12121c] border border-white/10 text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500 leading-relaxed"
              />
              <button
                type="button"
                onClick={handleSaveNotes}
                className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors inline-flex items-center gap-1.5"
              >
                <Save className="w-3 h-3" />
                <span>Save Notes</span>
              </button>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsDeletingId(activeInquiry.id)}
                className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Inquiry</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveInquiry(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#12121c] border border-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeletingId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="w-full max-w-md bg-[#0b0b14] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Delete Inquiry?</h3>
            <p className="text-xs text-zinc-400">
              Are you sure you want to permanently remove this inquiry record from Supabase?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeletingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#12121c] border border-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(isDeletingId)}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
