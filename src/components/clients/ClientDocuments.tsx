/**
-- ==============================================================================
-- FOOTAZIX — Client Portal: Documents Vault
-- File: src/components/clients/ClientDocuments.tsx
-- ==============================================================================
*/

import React, { useState } from 'react';
import { ClientDocument, DocumentCategory } from '../../types/clientPortal';
import {
  FileText,
  Download,
  ExternalLink,
  Eye,
  Calendar,
  Layers,
  Search,
  Filter,
  ShieldCheck,
} from 'lucide-react';

interface ClientDocumentsProps {
  documents: ClientDocument[];
  onPreviewDocument: (doc: ClientDocument) => void;
}

const ALL_CATEGORIES: DocumentCategory[] = [
  'Agreements',
  'Invoices',
  'Terms and Conditions',
  'Privacy and Policy Documents',
  'Project Briefs',
  'Delivery Reports',
  'Other',
];

export const ClientDocuments: React.FC<ClientDocumentsProps> = ({
  documents,
  onPreviewDocument,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = documents.filter((doc) => {
    if (selectedCategory !== 'ALL' && doc.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchCat = doc.category.toLowerCase().includes(q);
      const matchText = (doc.text_content || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchText) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Documents Vault
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Agency agreements, briefs, policies, invoices, and delivery reports.
          </p>
        </div>

        <div className="text-xs font-mono text-zinc-400 bg-[#0e0e18] px-3.5 py-1.5 rounded-xl border border-white/5 self-start sm:self-auto">
          {documents.length} Document{documents.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-[#090910] border border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title or keyword..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-[#12121c] text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            All Categories
          </button>
          {ALL_CATEGORIES.map((cat) => (
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
      </div>

      {/* Documents List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#090910] border border-white/5 space-y-3">
          <FileText className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-300">No documents found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchQuery
              ? 'Try adjusting your search criteria.'
              : 'Official documents assigned to your account will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-3xl bg-[#090910] border border-white/10 flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-all hover:shadow-lg hover:shadow-blue-500/5 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {doc.category}
                  </span>
                  {doc.version_number && (
                    <span className="text-[10px] font-mono text-zinc-500">
                      v{doc.version_number}
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 truncate">
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
                      <span>Issued: {doc.issue_date}</span>
                      {doc.expiry_date && <span>Exp: {doc.expiry_date}</span>}
                    </div>
                  </div>
                </div>

                {doc.text_content && (
                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed bg-[#0e0e18] p-3 rounded-xl border border-white/5">
                    {doc.text_content}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onPreviewDocument(doc)}
                  className="px-3.5 py-2 rounded-xl bg-[#12121c] hover:bg-[#181826] border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>View Details</span>
                </button>

                {doc.file_url ? (
                  <a
                    href={doc.file_url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => onPreviewDocument(doc)}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
