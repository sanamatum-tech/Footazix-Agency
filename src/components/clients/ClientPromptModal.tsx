/**
-- ==============================================================================
-- FOOTAZIX — CMS-Controlled Client Feedback Pop-up (Prompt)
-- File: src/components/clients/ClientPromptModal.tsx
-- ==============================================================================
* 
* Requirements Enforced:
* - Show only to targeted, authorized clients
* - Avoid repeated interruptions (persisted dismissal & completion in Supabase)
* - Custom title and message from Admin CMS
* - Direct trigger into feedback submission flow
*/

import React, { useState } from 'react';
import {
  ClientFeedbackPrompt,
  ClientAccount,
} from '../../types/clientPortal';
import { clientPortalService } from '../../services/clientPortalService';
import {
  Sparkles,
  X,
  MessageSquarePlus,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface ClientPromptModalProps {
  prompt: ClientFeedbackPrompt;
  client: ClientAccount;
  onDismiss: () => void;
  onOpenFeedbackWithDeliverable?: (deliverableId?: string | null) => void;
}

export const ClientPromptModal: React.FC<ClientPromptModalProps> = ({
  prompt,
  client,
  onDismiss,
  onOpenFeedbackWithDeliverable,
}) => {
  const [quickResponse, setQuickResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleDismiss = async () => {
    try {
      await clientPortalService.recordPromptInteraction(prompt.id, client.id, 'dismiss');
    } catch (e) {
      console.warn('Error recording prompt dismiss:', e);
    }
    onDismiss();
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickResponse.trim()) return;

    setIsSubmitting(true);
    try {
      const fb = await clientPortalService.submitFeedback({
        client_id: client.id,
        deliverable_id: prompt.related_deliverable_id || null,
        category: 'General Feedback',
        message: quickResponse.trim(),
      });

      if (fb) {
        await clientPortalService.recordPromptInteraction(
          prompt.id,
          client.id,
          'complete',
          fb.id
        );
      }
      setSubmitted(true);
      setTimeout(() => {
        onDismiss();
      }, 1200);
    } catch (err) {
      console.error('Error submitting prompt feedback:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-[#090910] border border-blue-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10 p-6 space-y-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss icon button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center absolute top-4 right-4 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge & Title */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-bold uppercase">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Footazix Concierge Note</span>
          </div>

          <h3 className="text-base font-bold text-white tracking-tight">
            {prompt.title}
          </h3>

          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {prompt.message}
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Thank you! Your response has been logged directly with your editor.</span>
          </div>
        ) : (
          <form onSubmit={handleQuickSubmit} className="space-y-3 pt-2">
            <textarea
              rows={3}
              value={quickResponse}
              onChange={(e) => setQuickResponse(e.target.value)}
              placeholder="Type your quick response or thoughts here..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
            />

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                Dismiss for now
              </button>

              <div className="flex items-center gap-2">
                {prompt.related_deliverable_id && onOpenFeedbackWithDeliverable && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDismiss();
                      onOpenFeedbackWithDeliverable(prompt.related_deliverable_id);
                    }}
                    className="px-3 py-2 rounded-xl bg-[#12121c] hover:bg-[#181826] border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>Full Review</span>
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !quickResponse.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Send Response</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
