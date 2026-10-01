import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Inquiry, InquiryStatus } from '../../types';
import { inquiryService } from '../../services/inquiryService';

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

  const filtered = inquiries.filter((inq) => {
    const matchesFilter = selectedFilter === 'ALL' || inq.status === selectedFilter;
    const matchesSearch =
      searchQuery === '' ||
      inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
  };

  const handleSaveNotes = async () => {
    if (!activeInquiry) return;
    await inquiryService.updateInquiryNotes(activeInquiry.id, notesText);
    setActiveInquiry({ ...activeInquiry, notes: notesText });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Permanently delete this project inquiry?')) {
      await inquiryService.deleteInquiry(id);
      if (activeInquiry?.id === id) setActiveInquiry(null);
    }
  };

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case 'new':
        return 'bg-blue-600/30 text-blue-300 border-blue-500/40';
      case 'contacted':
        return 'bg-amber-600/20 text-amber-300 border-amber-500/30';
      case 'in_progress':
        return 'bg-purple-600/20 text-purple-300 border-purple-500/30';
      case 'completed':
        return 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30';
      case 'archived':
        return 'bg-zinc-800 text-zinc-400 border-white/5';
      default:
        return 'bg-zinc-800 text-zinc-300 border-white/10';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header & Filter Controls */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-white tracking-tight">
              Client Project Inquiries
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Review and manage incoming project briefs from creators, brands, and agencies.
            </p>
          </div>

          <div className="text-xs font-mono text-zinc-400">
            Total Inquiries: <span className="text-white font-bold">{inquiries.length}</span>
          </div>
        </div>

        {/* Filter Pills & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedFilter === f
                    ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by name, email, service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Inquiries Table or Empty State */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-white mb-1">No inquiries match criteria.</h3>
          <p className="text-xs text-zinc-400">
            Try adjusting your search query or status filter.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/60 border-b border-white/10 text-zinc-400 uppercase font-mono tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Client Name</th>
                  <th className="py-3.5 px-4 font-semibold">Email</th>
                  <th className="py-3.5 px-4 font-semibold">Requested Services</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((inq) => (
                  <tr
                    key={inq.id}
                    onClick={() => handleOpenDetail(inq)}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-4 font-bold text-white">
                      <div>
                        <span>{inq.name}</span>
                        {inq.company && (
                          <span className="block text-[11px] text-zinc-500 font-normal">
                            {inq.company}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-zinc-300 font-mono">
                      {inq.email}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {inq.services.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-300 text-[10px]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-zinc-500 font-mono whitespace-nowrap">
                      {inq.createdAt}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                          inq.status
                        )}`}
                      >
                        {inq.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetail(inq)}
                          className="px-2.5 py-1 rounded text-xs font-semibold text-blue-400 hover:text-white bg-blue-950/40 hover:bg-blue-900/40 border border-blue-500/30 transition-colors cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleChangeStatus(inq.id, inq.status === 'archived' ? 'new' : 'archived')}
                          className="px-2.5 py-1 rounded text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-white/10 transition-colors cursor-pointer"
                        >
                          {inq.status === 'archived' ? 'Unarchive' : 'Archive'}
                        </button>
                        <button
                          onClick={() => handleDelete(inq.id)}
                          className="px-2 py-1 rounded text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inquiry Detailed View Modal */}
      {activeInquiry && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={() => setActiveInquiry(null)}
        >
          <div
            className="w-full max-w-2xl bg-zinc-950 border border-white/15 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                      activeInquiry.status
                    )}`}
                  >
                    {activeInquiry.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    Received: {activeInquiry.createdAt}
                  </span>
                </div>
                <h3 className="text-xl font-display font-bold text-white">
                  {activeInquiry.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {activeInquiry.email} {activeInquiry.phone && `• ${activeInquiry.phone}`} {activeInquiry.company && `• ${activeInquiry.company}`}
                </p>
              </div>

              <button
                onClick={() => setActiveInquiry(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Status:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(['new', 'contacted', 'in_progress', 'completed', 'archived'] as InquiryStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleChangeStatus(activeInquiry.id, st)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer border ${
                      activeInquiry.status === st
                        ? getStatusBadge(st)
                        : 'bg-zinc-900 text-zinc-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Information Grid */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                  Requested Services
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeInquiry.services.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {activeInquiry.budget && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-0.5">
                    Budget Preference
                  </span>
                  <p className="text-xs text-zinc-200">{activeInquiry.budget}</p>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                  Project Brief & Raw Footage Details
                </span>
                <div className="p-4 rounded-xl bg-zinc-900 border border-white/10 text-zinc-200 text-xs leading-relaxed font-normal whitespace-pre-wrap">
                  {activeInquiry.details}
                </div>
              </div>

              {/* Internal Studio Notes */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                  Internal Notes (Local State)
                </span>
                <textarea
                  rows={2}
                  placeholder="Add internal production notes or followup reminders..."
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
                />
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="mt-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                >
                  Save Note
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                onClick={() => handleDelete(activeInquiry.id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Delete Inquiry
              </button>

              <button
                onClick={() => setActiveInquiry(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-zinc-800 hover:bg-zinc-700"
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
