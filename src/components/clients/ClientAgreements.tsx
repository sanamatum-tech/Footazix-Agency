/**
-- ==============================================================================
-- FOOTAZIX — Client Portal: Agreements & Contracts
-- File: src/components/clients/ClientAgreements.tsx
-- ==============================================================================
*/

import React, { useState } from 'react';
import { ClientAgreement } from '../../types/clientPortal';
import {
  FileCheck2,
  Calendar,
  Layers,
  Download,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  History,
  CheckCircle2,
} from 'lucide-react';

interface ClientAgreementsProps {
  agreements: ClientAgreement[];
}

export const ClientAgreements: React.FC<ClientAgreementsProps> = ({ agreements }) => {
  const [expandedId, setExpandedId] = useState<string | null>(agreements[0]?.id || null);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Client Agreements & Scope
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Active service agreements, delivery terms, deliverable quotas, and revision policies.
          </p>
        </div>

        <div className="text-xs font-mono text-zinc-400 bg-[#0e0e18] px-3.5 py-1.5 rounded-xl border border-white/5 self-start sm:self-auto">
          {agreements.length} Agreement{agreements.length === 1 ? '' : 's'}
        </div>
      </div>

      {agreements.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#090910] border border-white/5 space-y-3">
          <FileCheck2 className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-300">No active agreements</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Your formal retainer agreements and scope contracts will be displayed here once executed with Footazix.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {agreements.map((agreement) => {
            const isExpanded = expandedId === agreement.id;

            return (
              <div
                key={agreement.id}
                className="rounded-3xl bg-[#090910] border border-white/10 overflow-hidden transition-all"
              >
                {/* Accordion Head */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : agreement.id)}
                  className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      <FileCheck2 className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {agreement.status}
                        </span>
                        {agreement.agreement_period && (
                          <span className="text-[11px] text-zinc-400 font-mono">
                            Period: {agreement.agreement_period}
                          </span>
                        )}
                        <span className="text-[11px] text-zinc-500 font-mono">
                          · v{agreement.version_number}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {agreement.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {agreement.document_url && (
                      <a
                        href={agreement.document_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12121c] border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </a>
                    )}
                    <div
                      className={`w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 transition-transform ${
                        isExpanded ? 'rotate-180 text-white' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-white/5 bg-[#050508] space-y-6">
                    {/* Deliverables & Services Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Agreed Deliverables */}
                      <div className="p-4 rounded-2xl bg-[#0e0e18] border border-white/5 space-y-2">
                        <div className="text-[11px] font-mono uppercase text-blue-400 font-bold">
                          Agreed Deliverable Quota
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                          {agreement.agreed_deliverables || 'As outlined in custom master services agreement.'}
                        </p>
                      </div>

                      {/* Included Services */}
                      <div className="p-4 rounded-2xl bg-[#0e0e18] border border-white/5 space-y-2">
                        <div className="text-[11px] font-mono uppercase text-blue-400 font-bold">
                          Covered Service Pillars
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {agreement.included_services && agreement.included_services.length > 0 ? (
                            agreement.included_services.map((srv, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-zinc-300 text-xs font-mono"
                              >
                                {srv}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-zinc-500">Short-form Video Editing, Motion, Strategy</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Terms & Policies */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Delivery Terms */}
                      <div className="p-4 rounded-2xl bg-[#0e0e18] border border-white/5 space-y-2">
                        <div className="text-[11px] font-mono uppercase text-zinc-400 font-bold">
                          Delivery Timeline & Terms
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {agreement.delivery_terms ||
                            'Standard 24-48 business hour turnaround for first cuts following raw footage upload.'}
                        </p>
                      </div>

                      {/* Revision Policy */}
                      <div className="p-4 rounded-2xl bg-[#0e0e18] border border-white/5 space-y-2">
                        <div className="text-[11px] font-mono uppercase text-zinc-400 font-bold">
                          Revision & Approval Policy
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {agreement.revision_policy ||
                            'Up to two revision rounds included per deliverable. Major scope changes quoted separately.'}
                        </p>
                      </div>
                    </div>

                    {/* Agreement Text Content if present */}
                    {agreement.text_content && (
                      <div className="p-4 rounded-2xl bg-[#0e0e18] border border-white/5 space-y-2">
                        <div className="text-[11px] font-mono uppercase text-zinc-400 font-bold">
                          Agreement Terms & Clauses
                        </div>
                        <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">
                          {agreement.text_content}
                        </div>
                      </div>
                    )}

                    {/* Version History */}
                    {agreement.version_history && agreement.version_history.length > 0 && (
                      <div className="p-4 rounded-2xl bg-[#090910] border border-white/5 space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 uppercase font-bold">
                          <History className="w-3.5 h-3.5" />
                          <span>Version History</span>
                        </div>
                        <div className="space-y-1.5">
                          {agreement.version_history.map((vh, i) => (
                            <div
                              key={i}
                              className="text-xs text-zinc-400 flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5"
                            >
                              <span className="font-mono text-zinc-200">v{vh.version}</span>
                              <span>{vh.change_summary || 'Updated agreement terms'}</span>
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {vh.modified_at ? new Date(vh.modified_at).toLocaleDateString() : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Download PDF Footer */}
                    {agreement.document_url && (
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-[11px] text-zinc-500 font-mono">
                          Official Footazix Executed Scope
                        </span>
                        <a
                          href={agreement.document_url}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Signed PDF</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
