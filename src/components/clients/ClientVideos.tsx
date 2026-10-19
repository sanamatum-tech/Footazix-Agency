/**
-- ==============================================================================
-- FOOTAZIX — Client Portal: Videos & Deliverables
-- File: src/components/clients/ClientVideos.tsx
-- ==============================================================================
*/

import React, { useState } from 'react';
import { ClientDeliverable, DeliverableStatus } from '../../types/clientPortal';
import {
  Video,
  Play,
  MessageSquarePlus,
  ExternalLink,
  Calendar,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
} from 'lucide-react';

interface ClientVideosProps {
  deliverables: ClientDeliverable[];
  onWatchVideo: (video: ClientDeliverable) => void;
  onOpenFeedback: (video: ClientDeliverable) => void;
}

export const ClientVideos: React.FC<ClientVideosProps> = ({
  deliverables,
  onWatchVideo,
  onOpenFeedback,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Categories present in deliverables
  const categories = ['ALL', ...Array.from(new Set(deliverables.map((d) => d.category)))];

  const filtered = deliverables.filter((d) => {
    if (selectedCategory !== 'ALL' && d.category !== selectedCategory) return false;
    if (selectedStatus !== 'ALL' && d.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = d.title.toLowerCase().includes(q);
      const matchDesc = (d.description || '').toLowerCase().includes(q);
      const matchNotes = (d.delivery_notes || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchNotes) return false;
    }
    return true;
  });

  const getStatusBadge = (status: DeliverableStatus) => {
    switch (status) {
      case 'delivered':
      case 'approved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-blue-400" />
            <span>{status}</span>
          </span>
        );
      case 'awaiting_feedback':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Needs Review</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-zinc-800 text-zinc-300 border border-white/10 flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>In Progress</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            My Video Deliverables
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            High-retention edits, drafts, and approved video releases assigned to your account.
          </p>
        </div>

        <div className="text-xs font-mono text-zinc-400 bg-[#0e0e18] px-3.5 py-1.5 rounded-xl border border-white/5 self-start sm:self-auto">
          {deliverables.length} Deliverable{deliverables.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[#090910] border border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deliverables by title, version, notes..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-[#12121c] text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="delivered">Delivered</option>
            <option value="awaiting_feedback">Needs Review</option>
            <option value="in_progress">In Progress</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Grid of Deliverables */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#090910] border border-white/5 space-y-3">
          <Video className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-300">No deliverables found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchQuery
              ? 'Try modifying your search or filter criteria.'
              : 'Your assigned video edits will appear here once published by the Footazix team.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((video) => (
            <div
              key={video.id}
              className="rounded-3xl bg-[#090910] border border-white/10 overflow-hidden flex flex-col group hover:border-blue-500/40 transition-all hover:shadow-xl hover:shadow-blue-500/5"
            >
              {/* Thumbnail Stage */}
              <div
                onClick={() => onWatchVideo(video)}
                className="relative aspect-video w-full bg-black overflow-hidden cursor-pointer"
              >
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                    <Video className="w-8 h-8" />
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                  <div className="w-12 h-12 rounded-full bg-blue-600/90 group-hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                  </div>
                </div>

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-black/80 backdrop-blur-md text-white border border-white/10">
                    {video.category}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3">
                  {getStatusBadge(video.status)}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{video.delivery_date}</span>
                    </span>
                    {video.version_info && (
                      <span className="text-zinc-400 font-semibold">
                        {video.version_info}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                    {video.title}
                  </h3>

                  {video.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  )}

                  {video.delivery_notes && (
                    <div className="p-2.5 rounded-xl bg-[#0e0e18] border border-white/5 text-[11px] text-zinc-400 flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        <strong className="text-zinc-300">Notes: </strong>
                        {video.delivery_notes}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenFeedback(video)}
                    className="px-3 py-2 rounded-xl bg-[#12121c] hover:bg-[#181826] border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5 text-blue-400" />
                    <span>Feedback</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onWatchVideo(video)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" fill="currentColor" />
                    <span>Watch</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
