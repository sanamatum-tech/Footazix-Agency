/**
-- ==============================================================================
-- FOOTAZIX — Client Portal Master Layout
-- File: src/components/clients/ClientPortalLayout.tsx
-- ==============================================================================
* 
* Requirements Enforced:
* - Top Bar with client identity, live status, and logout
* - Responsive Sidebar with CMS-controlled navigation ordering and module visibility
* - Interactive Video Player modal with Google Drive support
* - Interactive Document Viewer modal
* - Feedback Submission modal
* - CMS-Controlled Targeted Feedback Pop-up modal
*/

import React, { useState, useEffect, useCallback } from 'react';
import {
  ClientAccount,
  ClientDashboardStats,
  ClientDeliverable,
  ClientDocument,
  ClientInvoice,
  ClientAgreement,
  ClientFeedback,
  ClientFeedbackPrompt,
} from '../../types/clientPortal';
import { clientPortalService } from '../../services/clientPortalService';
import { clientAuthService } from '../../services/clientAuthService';
import { ClientOverview } from './ClientOverview';
import { ClientVideos } from './ClientVideos';
import { ClientDocuments } from './ClientDocuments';
import { ClientAgreements } from './ClientAgreements';
import { ClientInvoices } from './ClientInvoices';
import { ClientFeedback as ClientFeedbackView } from './ClientFeedback';
import { ClientNotifications } from './ClientNotifications';
import { ClientProfile } from './ClientProfile';
import { ClientVideoModal } from './ClientVideoModal';
import { ClientDocumentModal } from './ClientDocumentModal';
import { ClientFeedbackModal } from './ClientFeedbackModal';
import { ClientPromptModal } from './ClientPromptModal';
import { FootazixLogo } from '../FootazixLogo';
import {
  LayoutDashboard,
  Video,
  FileText,
  FileCheck2,
  Receipt,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface ClientPortalLayoutProps {
  initialClient: ClientAccount;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export type ClientNavTab =
  | 'overview'
  | 'videos'
  | 'documents'
  | 'agreements'
  | 'invoices'
  | 'feedback'
  | 'notifications'
  | 'profile';

export const ClientPortalLayout: React.FC<ClientPortalLayoutProps> = ({
  initialClient,
  onLogout,
  onNavigateHome,
}) => {
  const [client, setClient] = useState<ClientAccount>(initialClient);
  const [activeTab, setActiveTab] = useState<ClientNavTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Portal Data States
  const [stats, setStats] = useState<ClientDashboardStats>({
    totalVideos: 0,
    deliveredVideos: 0,
    inProgressVideos: 0,
    awaitingFeedbackVideos: 0,
    pendingDeliverables: 0,
    availableDocuments: 0,
    outstandingInvoices: 0,
    unresolvedFeedbackCount: 0,
  });
  const [deliverables, setDeliverables] = useState<ClientDeliverable[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [agreements, setAgreements] = useState<ClientAgreement[]>([]);
  const [feedback, setFeedback] = useState<ClientFeedback[]>([]);
  const [activePrompt, setActivePrompt] = useState<ClientFeedbackPrompt | null>(null);

  // Modal States
  const [selectedVideo, setSelectedVideo] = useState<ClientDeliverable | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<ClientDocument | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackTargetVideo, setFeedbackTargetVideo] = useState<ClientDeliverable | null>(null);

  // Load client data
  const loadPortalData = useCallback(async () => {
    try {
      const [
        dashStats,
        delivs,
        docs,
        invs,
        agrees,
        fbs,
        prompt,
      ] = await Promise.all([
        clientPortalService.getDashboardStats(client.id),
        clientPortalService.getDeliverablesByClient(client.id, true),
        clientPortalService.getDocumentsByClient(client.id, true),
        clientPortalService.getInvoicesByClient(client.id),
        clientPortalService.getAgreementsByClient(client.id),
        clientPortalService.getFeedback(client.id),
        clientPortalService.getActivePromptForClient(client.id),
      ]);

      setStats(dashStats);
      setDeliverables(delivs);
      setDocuments(docs);
      setInvoices(invs);
      setAgreements(agrees);
      setFeedback(fbs);
      setActivePrompt(prompt);
    } catch (err) {
      console.warn('Error loading client portal data:', err);
    }
  }, [client.id]);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  // Handle URL hash navigation if applicable
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as ClientNavTab;
      if (
        hash &&
        ['overview', 'videos', 'documents', 'agreements', 'invoices', 'feedback', 'notifications', 'profile'].includes(hash)
      ) {
        setActiveTab(hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTab = (tab: ClientNavTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.location.hash = tab === 'overview' ? '' : tab;
    }
  };

  // Nav configuration check: only show enabled modules
  const navConfig = client.navigation_config || {
    overview: true,
    videos: true,
    documents: true,
    agreements: true,
    invoices: true,
    feedback: true,
    notifications: true,
    profile: true,
  };

  interface NavItem {
    id: ClientNavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const allNavItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'videos', label: 'My Videos', icon: Video, badge: stats.pendingDeliverables > 0 ? stats.pendingDeliverables : undefined },
    { id: 'documents', label: 'Documents', icon: FileText, badge: stats.availableDocuments > 0 ? stats.availableDocuments : undefined },
    { id: 'agreements', label: 'Agreements', icon: FileCheck2 },
    { id: 'invoices', label: 'Invoices', icon: Receipt, badge: stats.outstandingInvoices > 0 ? stats.outstandingInvoices : undefined },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, badge: stats.unresolvedFeedbackCount > 0 ? stats.unresolvedFeedbackCount : undefined },
    { id: 'notifications', label: 'Announcements', icon: Bell },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const navItems = allNavItems.filter((item) => navConfig[item.id] !== false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <ClientOverview
            client={client}
            stats={stats}
            deliverables={deliverables}
            documents={documents}
            invoices={invoices}
            feedback={feedback}
            onNavigateTab={(tab) => navigateTab(tab as ClientNavTab)}
            onWatchVideo={(v) => setSelectedVideo(v)}
            onOpenFeedback={(v) => {
              setFeedbackTargetVideo(v || null);
              setFeedbackModalOpen(true);
            }}
          />
        );

      case 'videos':
        return (
          <ClientVideos
            deliverables={deliverables}
            onWatchVideo={(v) => setSelectedVideo(v)}
            onOpenFeedback={(v) => {
              setFeedbackTargetVideo(v);
              setFeedbackModalOpen(true);
            }}
          />
        );

      case 'documents':
        return (
          <ClientDocuments
            documents={documents}
            onPreviewDocument={(d) => setSelectedDoc(d)}
          />
        );

      case 'agreements':
        return <ClientAgreements agreements={agreements} />;

      case 'invoices':
        return <ClientInvoices invoices={invoices} />;

      case 'feedback':
        return (
          <ClientFeedbackView
            feedback={feedback}
            onOpenNewFeedback={() => {
              setFeedbackTargetVideo(null);
              setFeedbackModalOpen(true);
            }}
          />
        );

      case 'notifications':
        return <ClientNotifications client={client} />;

      case 'profile':
        return (
          <ClientProfile
            client={client}
            onUpdateClient={(up) => setClient(up)}
            onLogout={onLogout}
          />
        );

      default:
        return (
          <ClientOverview
            client={client}
            stats={stats}
            deliverables={deliverables}
            documents={documents}
            invoices={invoices}
            feedback={feedback}
            onNavigateTab={(tab) => navigateTab(tab as ClientNavTab)}
            onWatchVideo={(v) => setSelectedVideo(v)}
            onOpenFeedback={(v) => {
              setFeedbackTargetVideo(v || null);
              setFeedbackModalOpen(true);
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 1. Global Top Bar */}
      <header className="sticky top-0 z-40 bg-[#090910]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Footazix Logo */}
          <div className="flex items-center gap-3">
            <FootazixLogo className="h-7 w-auto text-white" />
            <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold uppercase">
              Client Portal
            </span>
          </div>
        </div>

        {/* Right User Bar */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateHome}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </button>

          {/* Client Avatar / Name */}
          <div
            onClick={() => navigateTab('profile')}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-2xl bg-[#12121c] border border-white/10 hover:border-blue-500/30 transition-colors cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-xl bg-blue-600/20 border border-blue-500/30 overflow-hidden flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
              {client.avatar_url ? (
                <img src={client.avatar_url} alt={client.full_name} className="w-full h-full object-cover" />
              ) : (
                client.full_name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="hidden sm:block text-left truncate max-w-[140px]">
              <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                {client.full_name}
              </div>
              <div className="text-[10px] text-zinc-500 font-mono truncate">
                {client.company_name || 'Authorized Client'}
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <button
            type="button"
            onClick={onLogout}
            title="Sign out of client portal"
            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Main Portal Stage */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 gap-8">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 space-y-6">
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-3 pb-2 font-bold">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/20'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isActive
                          ? 'bg-white text-blue-600'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Concierge Support Card */}
          <div className="p-4 rounded-3xl bg-[#090910] border border-white/5 space-y-2.5 mt-auto">
            <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Footazix Concierge</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Need immediate priority editing, rushes, or delivery updates?
            </p>
            <button
              type="button"
              onClick={() => {
                setFeedbackTargetVideo(null);
                setFeedbackModalOpen(true);
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#12121c] hover:bg-[#181826] border border-white/10 text-xs font-semibold text-zinc-200 hover:text-white transition-colors cursor-pointer text-center"
            >
              Contact Team
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md md:hidden animate-fade-in flex flex-col p-6">
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FootazixLogo className="h-6 w-auto text-white" />
                <span className="text-xs font-mono text-blue-400 font-bold uppercase">Client Portal</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-6 space-y-2 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTab(item.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-medium transition-all ${
                      isActive ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400 hover:text-white bg-[#090910]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-white text-blue-600">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-mono">{client.email}</span>
              <button
                type="button"
                onClick={onLogout}
                className="text-xs text-red-400 font-semibold"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Active Content View */}
        <main className="flex-1 min-w-0">{renderActiveView()}</main>
      </div>

      {/* 3. Interactive Modals */}
      {selectedVideo && (
        <ClientVideoModal
          deliverable={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onOpenFeedback={(v) => {
            setFeedbackTargetVideo(v);
            setFeedbackModalOpen(true);
          }}
        />
      )}

      {selectedDoc && (
        <ClientDocumentModal
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}

      {feedbackModalOpen && (
        <ClientFeedbackModal
          clientId={client.id}
          deliverables={deliverables}
          initialDeliverable={feedbackTargetVideo}
          onClose={() => {
            setFeedbackModalOpen(false);
            setFeedbackTargetVideo(null);
          }}
          onSuccess={(newFb) => {
            setFeedback((prev) => [newFb, ...prev]);
            setFeedbackModalOpen(false);
            setFeedbackTargetVideo(null);
            loadPortalData();
          }}
        />
      )}

      {/* CMS-Controlled Feedback Pop-up Prompt */}
      {activePrompt && (
        <ClientPromptModal
          prompt={activePrompt}
          client={client}
          onDismiss={() => setActivePrompt(null)}
          onOpenFeedbackWithDeliverable={(delivId) => {
            const found = deliverables.find((d) => d.id === delivId) || null;
            setFeedbackTargetVideo(found);
            setFeedbackModalOpen(true);
          }}
        />
      )}
    </div>
  );
};
