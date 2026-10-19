/**
-- ==============================================================================
-- FOOTAZIX — Client Feedback Submission Modal
-- File: src/components/clients/ClientFeedbackModal.tsx
-- ==============================================================================
*/

import React, { useState } from 'react';
import {
  ClientDeliverable,
  ClientFeedback,
  FeedbackCategory,
} from '../../types/clientPortal';
import { clientPortalService } from '../../services/clientPortalService';
import {
  X,
  MessageSquarePlus,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Link2,
} from 'lucide-react';

interface ClientFeedbackModalProps {
  clientId: string;
  deliverables: ClientDeliverable[];
  initialDeliverable?: ClientDeliverable | null;
  onClose: () => void;
  onSuccess: (feedback: ClientFeedback) => void;
}

const CATEGORIES: FeedbackCategory[] = [
  'Video Revision',
  'Pacing & Hooks',
  'Sound & Audio',
  'Graphics & Text',
  'General Feedback',
  'Agreement / Invoice',
];

export const ClientFeedbackModal: React.FC<ClientFeedbackModalProps> = ({
  clientId,
  deliverables,
  initialDeliverable,
  onClose,
  onSuccess,
}) => {
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string>(
    initialDeliverable?.id || ''
  );
  const [category, setCategory] = useState<FeedbackCategory>('Video Revision');
  const [message, setMessage] = useState('');
  const [referenceLink, setReferenceLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMessage = message.trim();

    if (!cleanMessage) {
      setError('Please provide feedback notes or revision instructions.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await clientPortalService.submitFeedback({
        client_id: clientId,
        deliverable_id: selectedDeliverableId || null,
        category,
        message: cleanMessage,
        reference_link: referenceLink.trim() || null,
      });

      if (!result) {
        throw new Error('Failed to record feedback.');
      }

      onSuccess(result);
    } catch (err: any) {
      setError(err?.message || 'Error submitting feedback. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-lg bg-[#090910] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#0e0e18]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <MessageSquarePlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Submit Client Feedback
              </h2>
              <p className="text-[11px] text-zinc-400">
                Direct to the Footazix editing & strategy team
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Related Deliverable (Optional or Selected) */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Related Deliverable (Optional)
            </label>
            <select
              value={selectedDeliverableId}
              onChange={(e) => setSelectedDeliverableId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
            >
              <option value="">General Project Feedback (No specific video)</option>
              {deliverables.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.category} · {d.version_info || 'v1.0'})
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Feedback Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold'
                      : 'bg-[#12121c] border-white/5 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Message textarea */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Your Notes / Revision Requests
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Please trim 2 seconds from the hook intro, and increase voiceover loudness slightly at 0:15..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Reference link */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Reference Link / Loom / Timestamp (Optional)
            </label>
            <div className="relative">
              <Link2 className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="url"
                value={referenceLink}
                onChange={(e) => setReferenceLink(e.target.value)}
                placeholder="https://loom.com/share/... or YouTube link"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#12121c] hover:bg-[#181826] border border-white/10 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Editor Team</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
