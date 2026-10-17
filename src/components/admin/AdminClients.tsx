/**
-- ==============================================================================
-- FOOTAZIX — Admin CMS: Client Portal Management Suite
-- File: src/components/admin/AdminClients.tsx
-- ==============================================================================
* 
* Complete Administrative Control for:
* - Client accounts & email authorization (Active / Deactivated toggle)
* - Custom welcome message, announcements & module visibility toggles
* - Deliverable videos & Google Drive links
* - Client documents (PDFs & text documents)
* - Agreements & Invoices with itemized calculations
* - Client feedback review & admin replies
* - Targeted feedback pop-ups (prompts)
* - 1-Click "Preview as Client"
*/

import React, { useState, useEffect, useCallback } from 'react';
import {
  ClientAccount,
  ClientDeliverable,
  ClientDocument,
  ClientInvoice,
  ClientAgreement,
  ClientFeedback,
  ClientFeedbackPrompt,
  DocumentCategory,
  DeliverableStatus,
  InvoicePaymentStatus,
  AgreementStatus,
} from '../../types/clientPortal';
import { clientPortalService } from '../../services/clientPortalService';
import { clientAuthService } from '../../services/clientAuthService';
import {
  Users,
  UserPlus,
  Video,
  FileText,
  Receipt,
  FileCheck2,
  MessageSquare,
  Sparkles,
  Sliders,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  Lock,
  Unlock,
  ExternalLink,
  Upload,
  Calendar,
  Layers,
  Check,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';

type AdminClientTab =
  | 'clients'
  | 'customization'
  | 'videos'
  | 'documents'
  | 'agreements_invoices'
  | 'feedback_prompts';

interface AdminClientsProps {
  onPreviewClientPortal?: () => void;
}

export const AdminClients: React.FC<AdminClientsProps> = ({ onPreviewClientPortal }) => {
  const [activeTab, setActiveTab] = useState<AdminClientTab>('clients');
  const [clients, setClients] = useState<ClientAccount[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sub-entity states for selected client
  const [deliverables, setDeliverables] = useState<ClientDeliverable[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [agreements, setAgreements] = useState<ClientAgreement[]>([]);
  const [feedback, setFeedback] = useState<ClientFeedback[]>([]);
  const [prompts, setPrompts] = useState<ClientFeedbackPrompt[]>([]);

  // Modals & Creation Drawer States
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientAccount | null>(null);

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<ClientDeliverable | null>(null);

  const [showDocModal, setShowDocModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<ClientDocument | null>(null);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<ClientInvoice | null>(null);

  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState<ClientAgreement | null>(null);

  const [showPromptModal, setShowPromptModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<ClientFeedbackPrompt | null>(null);

  // Load all clients on mount
  const loadClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await clientPortalService.getAllClients();
      setClients(list);
      if (list.length > 0 && !selectedClientId) {
        setSelectedClientId(list[0].id);
      }
    } catch (err: any) {
      console.warn('Error loading clients:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Load selected client's child data
  const loadSelectedClientData = useCallback(async () => {
    if (!selectedClientId) return;
    try {
      const [delivs, docs, invs, agrees, fbs, prmpts] = await Promise.all([
        clientPortalService.getDeliverablesByClient(selectedClientId, false),
        clientPortalService.getDocumentsByClient(selectedClientId, false),
        clientPortalService.getInvoicesByClient(selectedClientId),
        clientPortalService.getAgreementsByClient(selectedClientId),
        clientPortalService.getFeedback(selectedClientId),
        clientPortalService.getAllPrompts(),
      ]);

      setDeliverables(delivs);
      setDocuments(docs);
      setInvoices(invs);
      setAgreements(agrees);
      setFeedback(fbs);
      setPrompts(prmpts);
    } catch (err) {
      console.warn('Error loading client child entities:', err);
    }
  }, [selectedClientId]);

  useEffect(() => {
    loadSelectedClientData();
  }, [loadSelectedClientData]);

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0] || null;

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1-Click Preview as Client
  const handlePreviewAsClient = (targetClient: ClientAccount) => {
    clientAuthService.setAdminPreviewClient(targetClient);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/clients');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    if (onPreviewClientPortal) {
      onPreviewClientPortal();
    }
  };

  // Toggle Account Active / Deactivated
  const handleToggleStatus = async (cl: ClientAccount) => {
    const nextStatus = cl.status === 'active' ? 'deactivated' : 'active';
    const success = await clientPortalService.updateClientAccount(cl.id, { status: nextStatus });
    if (success) {
      setClients((prev) =>
        prev.map((c) => (c.id === cl.id ? { ...c, status: nextStatus } : c))
      );
      showToast(
        'success',
        `Client account ${cl.email} is now ${nextStatus.toUpperCase()}.`
      );
    } else {
      showToast('error', 'Failed to update client status.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-[#090910] border-blue-500/30 text-blue-300'
              : 'bg-[#090910] border-red-500/30 text-red-300'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span className="text-xs font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header & Client Selector */}
      <div className="p-6 rounded-3xl bg-[#090910] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
              CMS Business Suite
            </span>
            <span className="text-xs text-zinc-500">·</span>
            <span className="text-xs text-zinc-400 font-mono">
              {clients.length} Authorized Client{clients.length === 1 ? '' : 's'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Client Portal CMS
          </h1>
          <p className="text-xs text-zinc-400 max-w-xl">
            Authorize client emails, publish videos, attach documents and invoices, and configure customized dashboards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Client Selector Dropdown */}
          {clients.length > 0 && (
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-semibold focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.company_name || c.email}) [{c.status}]
                </option>
              ))}
            </select>
          )}

          {/* New Client Button */}
          <button
            type="button"
            onClick={() => {
              setEditingClient(null);
              setShowClientModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Authorize Client</span>
          </button>

          {/* 1-Click Preview Portal as this client */}
          {selectedClient && (
            <button
              type="button"
              onClick={() => handlePreviewAsClient(selectedClient)}
              className="px-3.5 py-2 rounded-xl bg-[#181826] hover:bg-[#202032] border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Preview the portal exactly as this client sees it"
            >
              <Eye className="w-4 h-4 text-blue-400" />
              <span>Preview as Client</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-white/5">
        {[
          { id: 'clients', label: 'Client Accounts', icon: Users, badge: clients.length },
          { id: 'customization', label: 'Dashboard & Navigation', icon: Sliders },
          { id: 'videos', label: 'Videos & Deliverables', icon: Video, badge: deliverables.length },
          { id: 'documents', label: 'Documents Vault', icon: FileText, badge: documents.length },
          { id: 'agreements_invoices', label: 'Agreements & Invoices', icon: Receipt, badge: invoices.length + agreements.length },
          { id: 'feedback_prompts', label: 'Feedback & Pop-ups', icon: MessageSquare, badge: feedback.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as AdminClientTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#181826] text-zinc-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: CLIENT ACCOUNTS DIRECTORY
         ========================================================================= */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#090910] border border-white/5 flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-zinc-400 font-bold">
              Authorized Client Roster
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Only authorized emails can receive OTP login codes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((cl) => (
              <div
                key={cl.id}
                className={`p-5 rounded-3xl bg-[#090910] border transition-all flex flex-col justify-between space-y-4 ${
                  selectedClientId === cl.id
                    ? 'border-blue-500/50 shadow-lg shadow-blue-500/5'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        cl.status === 'active'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-zinc-800 text-zinc-400 border border-white/10'
                      }`}
                    >
                      {cl.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(cl)}
                      className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 font-mono cursor-pointer"
                    >
                      {cl.status === 'active' ? (
                        <>
                          <Lock className="w-3 h-3 text-red-400" />
                          <span>Deactivate</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3 text-blue-400" />
                          <span>Activate</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 overflow-hidden flex items-center justify-center text-blue-400 font-bold shrink-0">
                      {cl.avatar_url ? (
                        <img src={cl.avatar_url} alt={cl.full_name} className="w-full h-full object-cover" />
                      ) : (
                        cl.full_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="truncate space-y-0.5">
                      <h3 className="text-sm font-bold text-white truncate">{cl.full_name}</h3>
                      <div className="text-xs text-zinc-400 font-mono truncate">{cl.email}</div>
                      {cl.company_name && (
                        <div className="text-[11px] text-zinc-500 truncate">{cl.company_name}</div>
                      )}
                    </div>
                  </div>

                  {cl.internal_notes && (
                    <div className="p-2.5 rounded-xl bg-[#0e0e18] border border-white/5 text-[11px] text-zinc-400 line-clamp-2">
                      <strong className="text-zinc-300 font-semibold">Notes: </strong>
                      {cl.internal_notes}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClientId(cl.id);
                      setActiveTab('customization');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#12121c] hover:bg-[#181826] border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Manage Scope
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePreviewAsClient(cl)}
                      className="p-2 rounded-xl bg-[#12121c] hover:bg-[#181826] border border-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Preview Dashboard as Client"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingClient(cl);
                        setShowClientModal(true);
                      }}
                      className="p-2 rounded-xl bg-[#12121c] hover:bg-[#181826] border border-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CUSTOMIZATION & DASHBOARD MODULES
         ========================================================================= */}
      {activeTab === 'customization' && selectedClient && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#090910] border border-white/10 space-y-6 max-w-4xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <h2 className="text-base font-bold text-white">
                Portal Scope & Customization: {selectedClient.full_name}
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                {selectedClient.email} · {selectedClient.company_name || 'Individual Creator'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handlePreviewAsClient(selectedClient)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Dashboard</span>
            </button>
          </div>

          {/* Welcome Message */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Personalized Welcome Message
            </label>
            <textarea
              rows={2}
              value={selectedClient.welcome_message || ''}
              onChange={(e) => {
                const val = e.target.value;
                setClients((prev) =>
                  prev.map((c) => (c.id === selectedClient.id ? { ...c, welcome_message: val } : c))
                );
              }}
              placeholder="e.g. Welcome back Alex. Your 12 Q4 reels and retainer agreement are ready below."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Announcement Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Dashboard Announcement Text (Optional)
              </label>
              <input
                type="text"
                value={selectedClient.announcement || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setClients((prev) =>
                    prev.map((c) => (c.id === selectedClient.id ? { ...c, announcement: val } : c))
                  );
                }}
                placeholder="e.g. Batch 4 is in color grading. Delivery scheduled for Friday 5 PM."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Announcement Type
              </label>
              <select
                value={selectedClient.announcement_type || 'info'}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setClients((prev) =>
                    prev.map((c) => (c.id === selectedClient.id ? { ...c, announcement_type: val } : c))
                  );
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="info">Info (Default Blue)</option>
                <option value="important">Important (High Priority)</option>
                <option value="alert">Alert (Urgent Attention)</option>
              </select>
            </div>
          </div>

          {/* Module Visibility Toggles */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Visible Portal Modules & Tabs
              </h3>
              <p className="text-[11px] text-zinc-500">
                Control which sections this specific client can access in their portal.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'videos', label: 'My Videos' },
                { id: 'documents', label: 'Documents' },
                { id: 'agreements', label: 'Agreements' },
                { id: 'invoices', label: 'Invoices' },
                { id: 'feedback', label: 'Feedback' },
                { id: 'notifications', label: 'Announcements' },
                { id: 'profile', label: 'Profile' },
              ].map((mod) => {
                const isEnabled = (selectedClient.navigation_config as any)[mod.id] !== false;

                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => {
                      const updatedNav = {
                        ...selectedClient.navigation_config,
                        [mod.id]: !isEnabled,
                      };
                      setClients((prev) =>
                        prev.map((c) => (c.id === selectedClient.id ? { ...c, navigation_config: updatedNav } : c))
                      );
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isEnabled
                        ? 'bg-blue-600/10 border-blue-500/40 text-blue-300'
                        : 'bg-[#12121c] border-white/5 text-zinc-500'
                    }`}
                  >
                    <span className="text-xs font-semibold">{mod.label}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isEnabled ? 'bg-blue-400' : 'bg-zinc-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Customization */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-mono">
              Changes persist immediately to Supabase
            </span>
            <button
              type="button"
              onClick={async () => {
                const success = await clientPortalService.updateClientAccount(selectedClient.id, {
                  welcome_message: selectedClient.welcome_message,
                  announcement: selectedClient.announcement,
                  announcement_type: selectedClient.announcement_type,
                  navigation_config: selectedClient.navigation_config,
                });
                if (success) {
                  showToast('success', 'Client dashboard customization successfully updated.');
                } else {
                  showToast('error', 'Failed to save customization.');
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Portal Configuration</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: VIDEOS & DELIVERABLES
         ========================================================================= */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#090910] border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-zinc-400 font-bold">
                Deliverables for: {selectedClient?.full_name || 'Client'}
              </span>
              <p className="text-[11px] text-zinc-500">
                Direct MP4s and Google Drive links with thumbnail and status management.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingVideo(null);
                setShowVideoModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Deliverable Video</span>
            </button>
          </div>

          {deliverables.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#090910] border border-white/5 space-y-2">
              <Video className="w-8 h-8 text-zinc-600 mx-auto" />
              <h3 className="text-sm font-semibold text-zinc-300">No deliverables added yet</h3>
              <p className="text-xs text-zinc-500">Click "Add Deliverable Video" to assign edits to this client.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deliverables.map((video) => (
                <div
                  key={video.id}
                  className="rounded-3xl bg-[#090910] border border-white/10 overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-video w-full bg-black">
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Video className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-black/80 text-white border border-white/10">
                        {video.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        video.published ? 'bg-blue-500/20 text-blue-300' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {video.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{video.title}</h4>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{video.description}</p>
                      <div className="text-[11px] text-zinc-500 font-mono mt-2">
                        Status: <strong className="text-zinc-300 uppercase">{video.status}</strong> · {video.delivery_date}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingVideo(video);
                          setShowVideoModal(true);
                        }}
                        className="text-xs text-blue-400 hover:underline cursor-pointer"
                      >
                        Edit Details
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Delete deliverable "${video.title}"?`)) {
                            await clientPortalService.deleteDeliverable(video.id);
                            setDeliverables((prev) => prev.filter((d) => d.id !== video.id));
                            showToast('success', 'Deliverable deleted.');
                          }
                        }}
                        className="p-1.5 text-zinc-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: DOCUMENTS VAULT
         ========================================================================= */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#090910] border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-zinc-400 font-bold">
                Documents for: {selectedClient?.full_name || 'Client'}
              </span>
              <p className="text-[11px] text-zinc-500">
                Upload PDFs, create rich text documents, and assign permissions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingDoc(null);
                setShowDocModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Document</span>
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#090910] border border-white/5 space-y-2">
              <FileText className="w-8 h-8 text-zinc-600 mx-auto" />
              <h3 className="text-sm font-semibold text-zinc-300">No documents added</h3>
              <p className="text-xs text-zinc-500">Add agreements, briefs, invoices, or reports for this client.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="p-5 rounded-3xl bg-[#090910] border border-white/10 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {doc.category}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {doc.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{doc.title}</h4>
                    <div className="text-[11px] text-zinc-500 font-mono">Issued: {doc.issue_date}</div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDoc(doc);
                        setShowDocModal(true);
                      }}
                      className="text-xs text-blue-400 hover:underline cursor-pointer"
                    >
                      Edit Document
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Delete document "${doc.title}"?`)) {
                          await clientPortalService.deleteDocument(doc.id);
                          setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
                          showToast('success', 'Document deleted.');
                        }
                      }}
                      className="p-1.5 text-zinc-500 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 5: AGREEMENTS & INVOICES
         ========================================================================= */}
      {activeTab === 'agreements_invoices' && (
        <div className="space-y-8">
          {/* Section A: Invoices */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#090910] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-zinc-400 font-bold">
                  Client Invoices
                </span>
                <p className="text-[11px] text-zinc-500">
                  Itemized billing records and payment statuses.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingInvoice(null);
                  setShowInvoiceModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Invoice</span>
              </button>
            </div>

            {invoices.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-[#090910] border border-white/5 text-xs text-zinc-500">
                No invoices created for this client yet.
              </div>
            ) : (
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <div key={inv.id} className="p-4 rounded-2xl bg-[#090910] border border-white/10 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">#{inv.invoice_number}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {inv.payment_status}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        Issued: {inv.issue_date} · Due: {inv.due_date}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm font-bold text-white">
                        {inv.currency || '$'}{Number(inv.total_amount).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingInvoice(inv);
                          setShowInvoiceModal(true);
                        }}
                        className="text-xs text-blue-400 hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Delete invoice #${inv.invoice_number}?`)) {
                            await clientPortalService.deleteInvoice(inv.id);
                            setInvoices((prev) => prev.filter((i) => i.id !== inv.id));
                            showToast('success', 'Invoice deleted.');
                          }
                        }}
                        className="p-1.5 text-zinc-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B: Agreements */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#090910] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-zinc-400 font-bold">
                  Client Agreements & Contracts
                </span>
                <p className="text-[11px] text-zinc-500">
                  Deliverable quotas, terms, and revision policies.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingAgreement(null);
                  setShowAgreementModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Agreement</span>
              </button>
            </div>

            {agreements.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-[#090910] border border-white/5 text-xs text-zinc-500">
                No agreements drafted for this client yet.
              </div>
            ) : (
              <div className="space-y-2">
                {agreements.map((agr) => (
                  <div key={agr.id} className="p-4 rounded-2xl bg-[#090910] border border-white/10 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{agr.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {agr.status}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">v{agr.version_number}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        Period: {agr.agreement_period || 'Ongoing'}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAgreement(agr);
                          setShowAgreementModal(true);
                        }}
                        className="text-xs text-blue-400 hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Delete agreement "${agr.title}"?`)) {
                            await clientPortalService.deleteAgreement(agr.id);
                            setAgreements((prev) => prev.filter((a) => a.id !== agr.id));
                            showToast('success', 'Agreement deleted.');
                          }
                        }}
                        className="p-1.5 text-zinc-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: FEEDBACK & POP-UP CAMPAIGNS
         ========================================================================= */}
      {activeTab === 'feedback_prompts' && (
        <div className="space-y-8">
          {/* Section A: Client Feedback Review */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#090910] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-zinc-400 font-bold">
                  Client Revision Requests & Feedback
                </span>
                <p className="text-[11px] text-zinc-500">
                  Review client feedback, add admin replies, and mark status as RESOLVED.
                </p>
              </div>
            </div>

            {feedback.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-[#090910] border border-white/5 text-xs text-zinc-500">
                No feedback received from this client yet.
              </div>
            ) : (
              <div className="space-y-3">
                {feedback.map((item) => (
                  <div key={item.id} className="p-5 rounded-3xl bg-[#090910] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {item.category}
                        </span>
                        {item.deliverable_title && (
                          <span className="text-xs font-semibold text-zinc-300">
                            Deliverable: {item.deliverable_title}
                          </span>
                        )}
                      </div>

                      <select
                        value={item.status}
                        onChange={async (e) => {
                          const nextStatus = e.target.value as any;
                          await clientPortalService.updateFeedbackStatus(item.id, nextStatus, item.admin_response);
                          setFeedback((prev) =>
                            prev.map((f) => (f.id === item.id ? { ...f, status: nextStatus } : f))
                          );
                          showToast('success', `Feedback status updated to ${nextStatus}.`);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono focus:outline-none"
                      >
                        <option value="SUBMITTED">SUBMITTED</option>
                        <option value="UNDER REVIEW">UNDER REVIEW</option>
                        <option value="RESOLVED">RESOLVED</option>
                      </select>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0e0e18] border border-white/5 text-xs text-zinc-300 leading-relaxed">
                      "{item.message}"
                    </div>

                    {/* Admin reply field */}
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Admin Reply to Client
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          defaultValue={item.admin_response || ''}
                          placeholder="Type agency reply..."
                          onBlur={async (e) => {
                            const val = e.target.value.trim();
                            if (val !== item.admin_response) {
                              await clientPortalService.updateFeedbackStatus(item.id, item.status, val);
                              setFeedback((prev) =>
                                prev.map((f) => (f.id === item.id ? { ...f, admin_response: val } : f))
                              );
                              showToast('success', 'Admin reply saved.');
                            }
                          }}
                          className="flex-1 px-3 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B: Targeted Feedback Pop-ups (Prompts) */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#090910] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-zinc-400 font-bold">
                  CMS-Controlled Feedback Pop-ups (Prompts)
                </span>
                <p className="text-[11px] text-zinc-500">
                  Trigger targeted feedback modals on client dashboards without annoying repetitive popups.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingPrompt(null);
                  setShowPromptModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Feedback Prompt</span>
              </button>
            </div>

            {prompts.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-[#090910] border border-white/5 text-xs text-zinc-500">
                No feedback pop-up prompts active.
              </div>
            ) : (
              <div className="space-y-3">
                {prompts.map((prm) => (
                  <div key={prm.id} className="p-4 rounded-2xl bg-[#090910] border border-white/10 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{prm.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          prm.is_enabled ? 'bg-blue-500/20 text-blue-300' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {prm.is_enabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-1">{prm.message}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={async () => {
                          const nextState = !prm.is_enabled;
                          await clientPortalService.updatePrompt(prm.id, { is_enabled: nextState });
                          setPrompts((prev) =>
                            prev.map((p) => (p.id === prm.id ? { ...p, is_enabled: nextState } : p))
                          );
                          showToast('success', `Prompt is now ${nextState ? 'Active' : 'Disabled'}.`);
                        }}
                        className="text-xs text-blue-400 hover:underline cursor-pointer"
                      >
                        {prm.is_enabled ? 'Disable' : 'Enable'}
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Delete prompt "${prm.title}"?`)) {
                            await clientPortalService.deletePrompt(prm.id);
                            setPrompts((prev) => prev.filter((p) => p.id !== prm.id));
                            showToast('success', 'Prompt deleted.');
                          }
                        }}
                        className="p-1.5 text-zinc-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS & FORM DRAWERS
         ========================================================================= */}

      {/* 1. Add / Edit Client Modal */}
      {showClientModal && (
        <ClientEditModal
          client={editingClient}
          onClose={() => setShowClientModal(false)}
          onSave={async (saved) => {
            setShowClientModal(false);
            await loadClients();
            setSelectedClientId(saved.id);
            showToast('success', `Client account ${saved.email} saved.`);
          }}
        />
      )}

      {/* 2. Add / Edit Video Deliverable Modal */}
      {showVideoModal && selectedClient && (
        <DeliverableEditModal
          clientId={selectedClient.id}
          deliverable={editingVideo}
          onClose={() => setShowVideoModal(false)}
          onSave={async (saved) => {
            setShowVideoModal(false);
            await loadSelectedClientData();
            showToast('success', `Deliverable "${saved.title}" saved.`);
          }}
        />
      )}

      {/* 3. Add / Edit Document Modal */}
      {showDocModal && selectedClient && (
        <DocumentEditModal
          clientId={selectedClient.id}
          document={editingDoc}
          onClose={() => setShowDocModal(false)}
          onSave={async (saved) => {
            setShowDocModal(false);
            await loadSelectedClientData();
            showToast('success', `Document "${saved.title}" saved.`);
          }}
        />
      )}

      {/* 4. Add / Edit Invoice Modal */}
      {showInvoiceModal && selectedClient && (
        <InvoiceEditModal
          clientId={selectedClient.id}
          invoice={editingInvoice}
          onClose={() => setShowInvoiceModal(false)}
          onSave={async (saved) => {
            setShowInvoiceModal(false);
            await loadSelectedClientData();
            showToast('success', `Invoice #${saved.invoice_number} saved.`);
          }}
        />
      )}

      {/* 5. Add / Edit Agreement Modal */}
      {showAgreementModal && selectedClient && (
        <AgreementEditModal
          clientId={selectedClient.id}
          agreement={editingAgreement}
          onClose={() => setShowAgreementModal(false)}
          onSave={async (saved) => {
            setShowAgreementModal(false);
            await loadSelectedClientData();
            showToast('success', `Agreement "${saved.title}" saved.`);
          }}
        />
      )}

      {/* 6. Add / Edit Prompt Modal */}
      {showPromptModal && selectedClient && (
        <PromptEditModal
          clientId={selectedClient.id}
          prompt={editingPrompt}
          onClose={() => setShowPromptModal(false)}
          onSave={async (saved) => {
            setShowPromptModal(false);
            await loadSelectedClientData();
            showToast('success', `Prompt "${saved.title}" created.`);
          }}
        />
      )}
    </div>
  );
};

// ==============================================================================
// SUB-MODALS IMPLEMENTATION
// ==============================================================================

// A. Client Edit / Authorize Modal
function ClientEditModal({
  client,
  onClose,
  onSave,
}: {
  client: ClientAccount | null;
  onClose: () => void;
  onSave: (client: ClientAccount) => void;
}) {
  const [email, setEmail] = useState(client?.email || '');
  const [fullName, setFullName] = useState(client?.full_name || '');
  const [companyName, setCompanyName] = useState(client?.company_name || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [status, setStatus] = useState<any>(client?.status || 'active');
  const [notes, setNotes] = useState(client?.internal_notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      if (client) {
        await clientPortalService.updateClientAccount(client.id, {
          email: email.trim().toLowerCase(),
          full_name: fullName.trim() || 'Client',
          company_name: companyName.trim() || null,
          phone: phone.trim() || null,
          status,
          internal_notes: notes.trim() || null,
        });
        onSave({ ...client, email, full_name: fullName, company_name: companyName, phone, status });
      } else {
        const created = await clientPortalService.createClientAccount({
          email: email.trim().toLowerCase(),
          full_name: fullName.trim() || 'New Client',
          company_name: companyName.trim() || null,
          phone: phone.trim() || null,
          status,
          internal_notes: notes.trim() || null,
        });
        if (created) onSave(created);
      }
    } catch (err: any) {
      alert(err.message || 'Error saving client.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#090910] border border-white/10 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-base font-bold text-white">
            {client ? 'Edit Client Record' : 'Authorize New Client Email'}
          </h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Client Email (Must be unique)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@company.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Vance"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Company / Brand
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Vance Media"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="active">Active (Access Allowed)</option>
                <option value="deactivated">Deactivated (Access Blocked)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Phone / WhatsApp
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 123 4567"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Internal Admin Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Monthly retainer client. 12 short-form videos."
              className="w-full px-3.5 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#12121c] border border-white/10 text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Authorize Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// B. Deliverable Edit Modal
function DeliverableEditModal({
  clientId,
  deliverable,
  onClose,
  onSave,
}: {
  clientId: string;
  deliverable: ClientDeliverable | null;
  onClose: () => void;
  onSave: (saved: ClientDeliverable) => void;
}) {
  const [title, setTitle] = useState(deliverable?.title || '');
  const [description, setDescription] = useState(deliverable?.description || '');
  const [videoUrl, setVideoUrl] = useState(deliverable?.video_url || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(deliverable?.thumbnail_url || '');
  const [category, setCategory] = useState(deliverable?.category || 'Reels');
  const [status, setStatus] = useState<DeliverableStatus>(deliverable?.status || 'delivered');
  const [deliveryDate, setDeliveryDate] = useState(deliverable?.delivery_date || new Date().toISOString().split('T')[0]);
  const [versionInfo, setVersionInfo] = useState(deliverable?.version_info || 'v1.0');
  const [deliveryNotes, setDeliveryNotes] = useState(deliverable?.delivery_notes || '');
  const [published, setPublished] = useState(deliverable ? deliverable.published : true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const data = {
        client_id: clientId,
        title: title.trim(),
        description: description.trim() || undefined,
        video_url: videoUrl.trim(),
        thumbnail_url: thumbnailUrl.trim() || undefined,
        category,
        status,
        delivery_date: deliveryDate,
        version_info: versionInfo.trim() || undefined,
        delivery_notes: deliveryNotes.trim() || undefined,
        published,
      };

      if (deliverable) {
        await clientPortalService.updateDeliverable(deliverable.id, data);
        onSave({ ...deliverable, ...data } as ClientDeliverable);
      } else {
        const created = await clientPortalService.createDeliverable(data as any);
        if (created) onSave(created);
      }
    } catch (err: any) {
      alert(err.message || 'Error saving deliverable.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#090910] border border-white/10 rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-base font-bold text-white">
            {deliverable ? 'Edit Video Deliverable' : 'Add New Deliverable Video'}
          </h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Video Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Retention Reel #1: Hook Mastercut"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Video URL (Direct MP4 or Google Drive Sharing Link)
            </label>
            <input
              type="url"
              required
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/.../view or MP4 URL"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
            />
            <p className="text-[10px] text-zinc-500">
              Tip: Google Drive URLs are automatically embedded for seamless client playback.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Thumbnail URL (Optional)
            </label>
            <input
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="/assets/portfolio/... or image URL"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="Reels">Reels</option>
                <option value="Shorts">Shorts</option>
                <option value="YouTube">YouTube</option>
                <option value="Brand">Brand</option>
                <option value="Motion">Motion</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="delivered">Delivered</option>
                <option value="awaiting_feedback">Needs Review</option>
                <option value="in_progress">In Progress</option>
                <option value="approved">Approved</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Version Info
              </label>
              <input
                type="text"
                value={versionInfo}
                onChange={(e) => setVersionInfo(e.target.value)}
                placeholder="v1.0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Delivery Notes / Instructions
            </label>
            <textarea
              rows={2}
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g. Added sound sweeps at 0:04 and adjusted contrast in the b-roll sequence."
              className="w-full px-3.5 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published_toggle"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded text-blue-600 focus:ring-0"
            />
            <label htmlFor="published_toggle" className="text-xs text-zinc-300 font-medium cursor-pointer">
              Publish immediately to client portal (Visible to client)
            </label>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#12121c] border border-white/10 text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save Deliverable'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// C. Document Edit Modal
function DocumentEditModal({
  clientId,
  document: doc,
  onClose,
  onSave,
}: {
  clientId: string;
  document: ClientDocument | null;
  onClose: () => void;
  onSave: (saved: ClientDocument) => void;
}) {
  const [title, setTitle] = useState(doc?.title || '');
  const [category, setCategory] = useState<DocumentCategory>(doc?.category || 'Project Briefs');
  const [fileUrl, setFileUrl] = useState(doc?.file_url || '');
  const [textContent, setTextContent] = useState(doc?.text_content || '');
  const [issueDate, setIssueDate] = useState(doc?.issue_date || new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(doc?.expiry_date || '');
  const [versionNumber, setVersionNumber] = useState(doc?.version_number || '1.0');
  const [published, setPublished] = useState(doc ? doc.published : true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const data = {
        client_id: clientId,
        title: title.trim(),
        category,
        file_url: fileUrl.trim() || null,
        file_type: (fileUrl ? 'pdf' : 'text') as any,
        text_content: textContent.trim() || null,
        issue_date: issueDate,
        expiry_date: expiryDate || null,
        version_number: versionNumber.trim() || '1.0',
        published,
        status: 'active' as any,
      };

      if (doc) {
        await clientPortalService.updateDocument(doc.id, data);
        onSave({ ...doc, ...data } as ClientDocument);
      } else {
        const created = await clientPortalService.createDocument(data as any);
        if (created) onSave(created);
      }
    } catch (err: any) {
      alert(err.message || 'Error saving document.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#090910] border border-white/10 rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-base font-bold text-white">
            {doc ? 'Edit Document' : 'Add Document to Client Vault'}
          </h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Document Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master Services Agreement / Project Scope Brief"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="Agreements">Agreements</option>
                <option value="Invoices">Invoices</option>
                <option value="Terms and Conditions">Terms and Conditions</option>
                <option value="Privacy and Policy Documents">Privacy and Policy Documents</option>
                <option value="Project Briefs">Project Briefs</option>
                <option value="Delivery Reports">Delivery Reports</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Version Number
              </label>
              <input
                type="text"
                value={versionNumber}
                onChange={(e) => setVersionNumber(e.target.value)}
                placeholder="1.0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              PDF / Storage File Link (Optional)
            </label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://... PDF URL"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              CMS Formatted Text Document (Optional)
            </label>
            <textarea
              rows={4}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Write or paste agreement text, terms, or delivery report clauses here..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="doc_pub"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded text-blue-600 focus:ring-0"
            />
            <label htmlFor="doc_pub" className="text-xs text-zinc-300 font-medium cursor-pointer">
              Visible to client in their Documents Vault
            </label>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#12121c] border border-white/10 text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// D. Invoice Edit Modal
function InvoiceEditModal({
  clientId,
  invoice: inv,
  onClose,
  onSave,
}: {
  clientId: string;
  invoice: ClientInvoice | null;
  onClose: () => void;
  onSave: (saved: ClientInvoice) => void;
}) {
  const [invoiceNumber, setInvoiceNumber] = useState(inv?.invoice_number || `FTZ-${Math.floor(1000 + Math.random() * 9000)}`);
  const [issueDate, setIssueDate] = useState(inv?.issue_date || new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(inv?.due_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [currency, setCurrency] = useState(inv?.currency || '$');
  const [amount, setAmount] = useState(inv?.total_amount ? String(inv.total_amount) : '2400.00');
  const [status, setStatus] = useState<InvoicePaymentStatus>(inv?.payment_status || 'ISSUED');
  const [pdfUrl, setPdfUrl] = useState(inv?.pdf_url || '');
  const [notes, setNotes] = useState(inv?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber.trim()) return;

    setIsSubmitting(true);
    try {
      const totalAmount = parseFloat(amount) || 0;
      const data = {
        client_id: clientId,
        invoice_number: invoiceNumber.trim(),
        issue_date: issueDate,
        due_date: dueDate,
        currency,
        subtotal: totalAmount,
        tax: 0,
        total_amount: totalAmount,
        payment_status: status,
        pdf_url: pdfUrl.trim() || null,
        notes: notes.trim() || null,
        line_items: [
          {
            description: 'Monthly Short-Form Video Retainer & Creative Direction',
            quantity: 1,
            unit_price: totalAmount,
            total: totalAmount,
          },
        ],
      };

      if (inv) {
        await clientPortalService.updateInvoice(inv.id, data);
        onSave({ ...inv, ...data } as ClientInvoice);
      } else {
        const created = await clientPortalService.createInvoice(data as any);
        if (created) onSave(created);
      }
    } catch (err: any) {
      alert(err.message || 'Error saving invoice.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#090910] border border-white/10 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-base font-bold text-white">
            {inv ? 'Edit Invoice' : 'Create Client Invoice'}
          </h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Invoice Number
              </label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="FTZ-2026-01"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Payment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="ISSUED">ISSUED</option>
                <option value="PAID">PAID</option>
                <option value="PARTIALLY PAID">PARTIALLY PAID</option>
                <option value="OVERDUE">OVERDUE</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Issue Date
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Total Amount
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="2400.00"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Currency
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="$ / USD"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              PDF Invoice URL (Optional)
            </label>
            <input
              type="url"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="https://... PDF URL"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#12121c] border border-white/10 text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// E. Agreement Edit Modal
function AgreementEditModal({
  clientId,
  agreement: agr,
  onClose,
  onSave,
}: {
  clientId: string;
  agreement: ClientAgreement | null;
  onClose: () => void;
  onSave: (saved: ClientAgreement) => void;
}) {
  const [title, setTitle] = useState(agr?.title || 'Video Editing Monthly Retainer Scope');
  const [period, setPeriod] = useState(agr?.agreement_period || 'Monthly Retainer');
  const [deliverablesQuota, setDeliverablesQuota] = useState(agr?.agreed_deliverables || '12 Short-Form Reels per month + 2 Long-form YouTube cuts');
  const [deliveryTerms, setDeliveryTerms] = useState(agr?.delivery_terms || '24-48 business hours turnaround per edit cut.');
  const [revisionPolicy, setRevisionPolicy] = useState(agr?.revision_policy || 'Up to 2 revision rounds included per deliverable.');
  const [status, setStatus] = useState<AgreementStatus>(agr?.status || 'ACTIVE');
  const [versionNumber, setVersionNumber] = useState(agr?.version_number || '1.0');
  const [documentUrl, setDocumentUrl] = useState(agr?.document_url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const data = {
        client_id: clientId,
        title: title.trim(),
        agreement_period: period.trim() || undefined,
        agreed_deliverables: deliverablesQuota.trim() || undefined,
        delivery_terms: deliveryTerms.trim() || undefined,
        revision_policy: revisionPolicy.trim() || undefined,
        status,
        version_number: versionNumber.trim() || '1.0',
        document_url: documentUrl.trim() || null,
        included_services: ['Short-Form Video', 'Retention Editing', 'Audio & Sound'],
      };

      if (agr) {
        await clientPortalService.updateAgreement(agr.id, data);
        onSave({ ...agr, ...data } as ClientAgreement);
      } else {
        const created = await clientPortalService.createAgreement(data as any);
        if (created) onSave(created);
      }
    } catch (err: any) {
      alert(err.message || 'Error saving agreement.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#090910] border border-white/10 rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-base font-bold text-white">
            {agr ? 'Edit Agreement' : 'Create Client Agreement'}
          </h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Agreement Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master Video Production Agreement"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Period
              </label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="Q4 2026 / Monthly Retainer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="DRAFT">DRAFT</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Agreed Deliverable Quota
            </label>
            <textarea
              rows={2}
              value={deliverablesQuota}
              onChange={(e) => setDeliverablesQuota(e.target.value)}
              placeholder="e.g. 12 High-Retention Reels per month + 2 Long-form cuts"
              className="w-full px-3.5 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Delivery Terms
            </label>
            <input
              type="text"
              value={deliveryTerms}
              onChange={(e) => setDeliveryTerms(e.target.value)}
              placeholder="e.g. 24-48 business hours turnaround per edit cut"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Revision Policy
            </label>
            <input
              type="text"
              value={revisionPolicy}
              onChange={(e) => setRevisionPolicy(e.target.value)}
              placeholder="e.g. Up to 2 revision rounds included per deliverable"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Signed PDF Link (Optional)
            </label>
            <input
              type="url"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              placeholder="https://... PDF URL"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#12121c] border border-white/10 text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save Agreement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// F. Prompt Edit Modal
function PromptEditModal({
  clientId,
  prompt: prm,
  onClose,
  onSave,
}: {
  clientId: string;
  prompt: ClientFeedbackPrompt | null;
  onClose: () => void;
  onSave: (saved: ClientFeedbackPrompt) => void;
}) {
  const [title, setTitle] = useState(prm?.title || 'How is your latest edit looking?');
  const [message, setMessage] = useState(prm?.message || 'We just uploaded your latest video cuts. Let us know if you need any pacing adjustments before distribution!');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const data = {
        title: title.trim(),
        message: message.trim(),
        target_client_ids: [clientId],
        is_enabled: true,
        trigger_event: 'on_dashboard_load' as const,
        disappear_after_submit: true,
      };

      if (prm) {
        await clientPortalService.updatePrompt(prm.id, data);
        onSave({ ...prm, ...data } as ClientFeedbackPrompt);
      } else {
        const created = await clientPortalService.createPrompt(data as any);
        if (created) onSave(created);
      }
    } catch (err: any) {
      alert(err.message || 'Error saving prompt.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#090910] border border-white/10 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-base font-bold text-white">
            {prm ? 'Edit Feedback Pop-up' : 'Create Targeted Feedback Pop-up'}
          </h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Pop-up Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quick feedback on Batch 3 edits"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Message to Client
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Let us know if the hook timing feels right..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <p className="text-[11px] text-zinc-500">
            This pop-up will appear on the client dashboard once and automatically disappear after they respond or dismiss it.
          </p>

          <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#12121c] border border-white/10 text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 cursor-pointer"
            >
              {isSubmitting ? 'Creating...' : 'Launch Pop-up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
