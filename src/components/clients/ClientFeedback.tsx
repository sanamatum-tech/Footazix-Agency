/**
-- ==============================================================================
-- FOOTAZIX — Client Portal: Feedback & Revision Pipeline
-- File: src/components/clients/ClientFeedback.tsx
-- ==============================================================================
*/

import React from 'react';
import type { ClientFeedback as ClientFeedbackItem } from '../../types/clientPortal';
import {
  MessageSquare,
  MessageSquarePlus,
  ExternalLink,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Video,
} from 'lucide-react';

interface ClientFeedbackProps {
  feedback: ClientFeedbackItem[];
  onOpenNewFeedback: () => void;
}

export const ClientFeedback: React.FC<ClientFeedbackProps> = ({
  feedback,
  onOpenNewFeedback,
}) => {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Feedback & Revisions
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Submit revision notes, review admin replies, and monitor video approval statuses.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewFeedback}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer self-start sm:self-auto"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>New Revision / Note</span>
        </button>
      </div>

      {feedback.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#090910] border border-white/5 space-y-3">
          <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-300">No feedback submitted yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Whenever you have thoughts or notes on any video edit, click "New Revision / Note" to notify the editor team.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <div
              key={item.id}
              className="p-5 sm:p-6 rounded-3xl bg-[#090910] border border-white/10 space-y-4"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {item.category}
                  </span>
                  {item.deliverable_title && (
                    <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{item.deliverable_title}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-zinc-500 font-mono text-[11px] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      item.status === 'RESOLVED'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : item.status === 'UNDER REVIEW'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-zinc-800 text-zinc-300 border border-white/10'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Client Note Body */}
              <div className="p-4 rounded-2xl bg-[#0e0e18] border border-white/5 space-y-2">
                <div className="text-[10px] font-mono uppercase text-zinc-500 font-bold">
                  Your Note
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {item.message}
                </p>

                {item.reference_link && (
                  <div className="pt-2 flex items-center gap-1.5 text-xs">
                    <span className="text-zinc-500">Reference:</span>
                    <a
                      href={item.reference_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1 truncate font-mono text-[11px]"
                    >
                      <span className="truncate">{item.reference_link}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}
              </div>

              {/* Admin / Editor Team Response */}
              {item.admin_response ? (
                <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-blue-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Footazix Editor Team Response</span>
                  </div>
                  <p className="text-xs text-blue-100 leading-relaxed">
                    {item.admin_response}
                  </p>
                  {item.resolved_at && (
                    <div className="text-[10px] text-zinc-500 font-mono pt-1">
                      Resolved on {new Date(item.resolved_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 font-mono">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span>Awaiting editor review and status update</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
