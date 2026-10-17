/**
-- ==============================================================================
-- FOOTAZIX — Client Document Viewer Modal
-- File: src/components/clients/ClientDocumentModal.tsx
-- ==============================================================================
* 
* Supports:
* - PDF previews and secure downloads
* - CMS-authored rich/plain text documents
* - Document metadata (category, issue date, status, version)
*/

import React from 'react';
import { ClientDocument } from '../../types/clientPortal';
import {
  X,
  Download,
  ExternalLink,
  FileText,
  Calendar,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface ClientDocumentModalProps {
  document: ClientDocument | null;
  onClose: () => void;
}

export const ClientDocumentModal: React.FC<ClientDocumentModalProps> = ({
  document: doc,
  onClose,
}) => {
  if (!doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-3xl bg-[#090910] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#0e0e18]">
          <div className="flex items-center gap-3 truncate mr-4">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
              {doc.category}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white truncate">
              {doc.title}
            </h2>
            {doc.version_number && (
              <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline-block">
                · v{doc.version_number}
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 bg-[#050508]">
          {/* Metadata pill list */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 border-b border-white/5 pb-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>Issue Date: <strong className="text-zinc-200">{doc.issue_date}</strong></span>
            </span>
            {doc.expiry_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>Expires: <strong className="text-zinc-200">{doc.expiry_date}</strong></span>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-zinc-500" />
              <span>Status: <strong className="text-zinc-200 uppercase font-mono">{doc.status}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Official Agency Record</span>
            </span>
          </div>

          {/* Text Content Rendering */}
          {doc.text_content ? (
            <div className="p-6 rounded-2xl bg-[#0e0e18] border border-white/5 space-y-4">
              <div className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
                Document Body
              </div>
              <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap selection:bg-blue-600">
                {doc.text_content}
              </div>
            </div>
          ) : doc.file_url ? (
            /* PDF / External Document Frame */
            <div className="space-y-4">
              <div className="w-full h-[480px] rounded-2xl bg-[#090910] border border-white/10 overflow-hidden relative">
                <iframe
                  src={doc.file_url}
                  title={doc.title}
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No text content or file attached to this document.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#0e0e18] border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 font-mono">
            Footazix Secure Document Registry
          </span>

          <div className="flex items-center gap-2">
            {doc.file_url && (
              <>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#181826] hover:bg-[#202032] border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Fullscreen</span>
                </a>
                <a
                  href={doc.file_url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </a>
              </>
            )}
            {!doc.file_url && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
