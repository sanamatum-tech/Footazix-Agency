/**
-- ==============================================================================
-- FOOTAZIX — Client Video Player Modal
-- File: src/components/clients/ClientVideoModal.tsx
-- ==============================================================================
* 
* Supports:
* - Direct MP4 / Supabase storage video playback
* - Google Drive sharing URLs (converted into embed preview player)
* - Google Drive access instructions
* - Delivery notes & version inspection
* - Seamless feedback trigger
*/

import React from 'react';
import { ClientDeliverable } from '../../types/clientPortal';
import {
  X,
  ExternalLink,
  MessageSquarePlus,
  Calendar,
  Layers,
  FileText,
  AlertCircle,
  Play,
} from 'lucide-react';

interface ClientVideoModalProps {
  deliverable: ClientDeliverable | null;
  onClose: () => void;
  onOpenFeedback: (deliverable: ClientDeliverable) => void;
}

export const ClientVideoModal: React.FC<ClientVideoModalProps> = ({
  deliverable,
  onClose,
  onOpenFeedback,
}) => {
  if (!deliverable) return null;

  // Process Google Drive URLs
  const getEmbeddableUrl = (rawUrl: string): { type: 'drive' | 'direct'; url: string; driveId?: string } => {
    if (!rawUrl) return { type: 'direct', url: '' };

    // Google Drive file patterns
    const driveFileRegex = /https:\/\/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/;
    const match = rawUrl.match(driveFileRegex);

    if (match && match[1]) {
      const driveId = match[1];
      return {
        type: 'drive',
        url: `https://drive.google.com/file/d/${driveId}/preview`,
        driveId,
      };
    }

    return { type: 'direct', url: rawUrl };
  };

  const videoMeta = getEmbeddableUrl(deliverable.video_url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-4xl bg-[#090910] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#0e0e18]">
          <div className="flex items-center gap-3 truncate mr-4">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
              {deliverable.category}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white truncate">
              {deliverable.title}
            </h2>
            {deliverable.version_info && (
              <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline-block">
                · {deliverable.version_info}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Stage */}
        <div className="relative bg-black flex-1 flex items-center justify-center min-h-[260px] sm:min-h-[440px] max-h-[60vh] overflow-hidden">
          {videoMeta.type === 'drive' ? (
            <div className="w-full h-full relative">
              <iframe
                src={videoMeta.url}
                title={deliverable.title}
                className="w-full h-full border-0 absolute inset-0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            </div>
          ) : (
            <video
              src={deliverable.video_url}
              poster={deliverable.thumbnail_url}
              controls
              autoPlay
              playsInline
              className="w-full h-full max-h-[58vh] object-contain"
            />
          )}
        </div>

        {/* Google Drive permissions helper banner if applicable */}
        {videoMeta.type === 'drive' && (
          <div className="px-4 py-2 bg-blue-950/40 border-b border-blue-500/20 text-[11px] text-blue-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <AlertCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">
                Google Drive Asset: Ensure you are logged into your authorized Google account to view.
              </span>
            </div>
            <a
              href={deliverable.video_url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline flex items-center gap-1 font-semibold shrink-0 cursor-pointer text-[10px]"
            >
              <span>Open in Drive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Deliverable Details & Actions Footer */}
        <div className="p-4 sm:p-5 bg-[#0e0e18] border-t border-white/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-4 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Delivered: {deliverable.delivery_date}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Status: <strong className="text-zinc-200 uppercase font-mono">{deliverable.status.replace('_', ' ')}</strong></span>
                </span>
              </div>
              {deliverable.description && (
                <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">
                  {deliverable.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFeedback(deliverable);
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>

              <a
                href={deliverable.video_url}
                target="_blank"
                rel="noreferrer"
                download
                className="px-3.5 py-2.5 rounded-xl bg-[#181826] hover:bg-[#202032] border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Direct Link</span>
              </a>
            </div>
          </div>

          {/* Delivery Notes */}
          {deliverable.delivery_notes && (
            <div className="p-3 rounded-xl bg-[#090910] border border-white/5 text-xs text-zinc-400 flex items-start gap-2">
              <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-zinc-300 font-medium">Editor Notes: </strong>
                <span>{deliverable.delivery_notes}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
