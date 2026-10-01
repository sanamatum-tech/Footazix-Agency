import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminWebsiteEditor } from './AdminWebsiteEditor';
import { AdminHeroCMS } from './AdminHeroCMS';
import { AdminVSLEditor } from './AdminVSLEditor';
import { AdminPortfolio } from './AdminPortfolio';
import { AdminServices } from './AdminServices';
import { AdminTeam } from './AdminTeam';
import { AdminInquiries } from './AdminInquiries';
import { AdminMediaLibrary } from './AdminMediaLibrary';
import { AdminSettings } from './AdminSettings';
import {
  LayoutDashboard,
  Globe2,
  PanelsTopLeft,
  PlaySquare,
  FolderKanban,
  BriefcaseBusiness,
  UsersRound,
  Inbox,
  Images,
  Settings2,
  LogOut,
  ExternalLink,
  Bell,
  Search,
  Menu,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type AdminSection =
  | 'dashboard'
  | 'website'
  | 'hero'
  | 'vsl'
  | 'portfolio'
  | 'services'
  | 'team'
  | 'inquiries'
  | 'media'
  | 'settings';

interface NavItemConfig {
  id: AdminSection;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: number;
}

interface NavGroup {
  groupLabel: string;
  items: NavItemConfig[];
}

export const AdminLayout: React.FC = () => {
  const { content, inquiries, currentUser, logout, navigateToPublic, saveStatus, saveMessage } =
    useApp();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const newInquiries = inquiries.filter((i) => i.status === 'new');
  const newInquiriesCount = newInquiries.length;

  const navGroups: NavGroup[] = [
    {
      groupLabel: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      groupLabel: 'CONTENT',
      items: [
        { id: 'website', label: 'Website Editor', icon: Globe2 },
        { id: 'hero', label: 'Hero', icon: PanelsTopLeft },
        { id: 'vsl', label: 'VSL', icon: PlaySquare },
        { id: 'portfolio', label: 'Portfolio', icon: FolderKanban },
        { id: 'services', label: 'Services', icon: BriefcaseBusiness },
        { id: 'team', label: 'Team', icon: UsersRound },
        { id: 'media', label: 'Media', icon: Images },
      ],
    },
    {
      groupLabel: 'BUSINESS',
      items: [
        { id: 'inquiries', label: 'Inquiries', icon: Inbox, badge: newInquiriesCount },
      ],
    },
    {
      groupLabel: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings2 },
      ],
    },
  ];

  const sectionTitles: Record<AdminSection, { title: string; breadcrumb: string }> = {
    dashboard: { title: 'Dashboard', breadcrumb: 'Home / Dashboard' },
    website: { title: 'Website Editor', breadcrumb: 'Content / Website Editor' },
    hero: { title: 'Hero CMS', breadcrumb: 'Content / Hero' },
    vsl: { title: 'VSL Settings', breadcrumb: 'Content / VSL' },
    portfolio: { title: 'Portfolio Management', breadcrumb: 'Content / Portfolio' },
    services: { title: 'Services Management', breadcrumb: 'Content / Services' },
    team: { title: 'Team Members', breadcrumb: 'Content / Team' },
    inquiries: { title: 'Client Inquiries', breadcrumb: 'Business / Inquiries' },
    media: { title: 'Media Library', breadcrumb: 'Content / Media' },
    settings: { title: 'Studio Settings', breadcrumb: 'System / Settings' },
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard onNavigateSection={(sec) => setActiveSection(sec as AdminSection)} />;
      case 'website':
        return <AdminWebsiteEditor />;
      case 'hero':
        return <AdminHeroCMS />;
      case 'vsl':
        return <AdminVSLEditor />;
      case 'portfolio':
        return <AdminPortfolio />;
      case 'services':
        return <AdminServices />;
      case 'team':
        return <AdminTeam />;
      case 'inquiries':
        return <AdminInquiries />;
      case 'media':
        return <AdminMediaLibrary />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard onNavigateSection={(sec) => setActiveSection(sec as AdminSection)} />;
    }
  };

  // Quick search items across all sections
  const allNavItems = navGroups.flatMap((g) => g.items);
  const filteredNavItems = searchQuery.trim()
    ? allNavItems.filter((i) => i.label.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    : allNavItems;

  return (
    <div className="min-h-screen bg-[#07070a] text-zinc-100 flex flex-col lg:flex-row selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3.5 bg-[#050508] border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg text-zinc-300 hover:text-white bg-zinc-900 border border-white/10 transition-colors"
            aria-label="Toggle navigation drawer"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-white text-base tracking-tight">
              {content.brand.name || 'FOOTAZIX'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
            <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-500/30 text-blue-300">
              CMS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-zinc-300 hover:text-white bg-zinc-900 border border-white/10 relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {newInquiriesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-[#050508]" />
            )}
          </button>
          <button
            onClick={navigateToPublic}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Sidebar for Desktop & Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[270px] bg-[#07070c] border-r border-white/10 flex flex-col justify-between transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="font-display font-extrabold text-lg text-white tracking-tight">
                {content.brand.name || 'FOOTAZIX'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950/70 border border-blue-500/30 text-blue-300 font-semibold">
                CMS
              </span>
            </div>

            {/* Mobile close */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Grouped Navigation */}
          <nav className="p-3.5 space-y-5 flex-1">
            {navGroups.map((group) => (
              <div key={group.groupLabel} className="space-y-1">
                <span className="block px-3 text-[10px] font-bold font-mono tracking-[0.2em] text-zinc-400 mb-1.5 select-none">
                  {group.groupLabel}
                </span>

                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                          isActive
                            ? 'bg-blue-600/12 text-white border border-blue-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
                            : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                        }`}
                      >
                        {/* Blue Active Left Indicator */}
                        {isActive && (
                          <motion.span
                            layoutId="activeNavIndicator"
                            className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]"
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          />
                        )}

                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 transition-colors ${
                              isActive
                                ? 'text-blue-400'
                                : 'text-zinc-400 group-hover:text-zinc-200'
                            }`}
                            strokeWidth={1.8}
                          />
                          <span className="tracking-tight">{item.label}</span>
                        </div>

                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tabular-nums ${
                              isActive
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-950/80 text-blue-400 border border-blue-500/40'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer: View Live Website, Profile & Logout */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-[#050508]/80">
          <button
            onClick={navigateToPublic}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-zinc-300 bg-[#12121a] hover:text-white hover:bg-[#1a1a26] border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer group"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
            <span>View Live Website</span>
          </button>

          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
            <div className="truncate max-w-[150px]">
              <span className="font-semibold text-white block truncate text-xs">
                {currentUser?.email || 'footazix@gmail.com'}
              </span>
              <div className="inline-flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span className="uppercase tracking-wider">
                  {currentUser?.role === 'owner' ? 'OWNER' : 'ADMIN'}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Desktop Topbar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-white/10 bg-[#050508]/80 backdrop-blur-md sticky top-0 z-30">
          {/* Breadcrumb & Section Title */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-0.5">
              {sectionTitles[activeSection].breadcrumb}
            </div>
            <h1 className="text-lg font-display font-extrabold text-white tracking-tight">
              {sectionTitles[activeSection].title}
            </h1>
          </div>

          {/* Right Header Actions: Quick Search, Notifications, Save Indicator, Live Site */}
          <div className="flex items-center gap-3">
            {/* Quick Search Trigger */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-400 bg-zinc-900/80 hover:bg-zinc-900 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span>Search CMS sections...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/10 text-[10px] font-mono text-zinc-400">
                ⌘K
              </kbd>
            </button>

            {/* Notifications Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-900 border border-white/10 relative transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {newInquiriesCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-blue-600 text-white shadow-[0_0_8px_rgba(37,99,235,0.8)]">
                    {newInquiriesCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#0b0b12] border border-white/15 p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Notifications
                    </span>
                    <span className="text-[10px] font-mono text-blue-400">
                      {newInquiriesCount} new inquiries
                    </span>
                  </div>

                  {newInquiries.length === 0 ? (
                    <div className="py-6 text-center text-xs text-zinc-500">
                      No unread inquiries. All caught up!
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {newInquiries.slice(0, 4).map((inq) => (
                        <div
                          key={inq.id}
                          onClick={() => {
                            setActiveSection('inquiries');
                            setShowNotifications(false);
                          }}
                          className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/5 transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-white mb-0.5">
                            <span>{inq.name}</span>
                            <span className="text-[10px] font-mono text-blue-400 font-normal">
                              New
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {inq.details}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setActiveSection('inquiries');
                      setShowNotifications(false);
                    }}
                    className="w-full mt-3 py-1.5 text-center text-xs font-semibold text-blue-400 hover:text-blue-300 block"
                  >
                    View all inquiries →
                  </button>
                </div>
              )}
            </div>

            {/* Live Save Status Toast/Indicator */}
            <AnimatePresence>
              {saveStatus !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                    saveStatus === 'saving'
                      ? 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                      : saveStatus === 'saved'
                      ? 'bg-zinc-900 text-white border-blue-500/50 shadow-[0_0_12px_rgba(37,99,235,0.2)]'
                      : 'bg-red-950/60 text-red-300 border-red-500/40'
                  }`}
                >
                  {saveStatus === 'saving' ? (
                    <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                  ) : saveStatus === 'saved' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  )}
                  <span>{saveMessage || (saveStatus === 'saved' ? 'Saved successfully' : 'Saving...')}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live Site Link Button */}
            <button
              onClick={navigateToPublic}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-[0_0_16px_rgba(37,99,235,0.3)] cursor-pointer flex items-center gap-1.5"
            >
              <span>View Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Search Modal */}
        {showSearchModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowSearchModal(false)}
          >
            <div
              className="w-full max-w-lg rounded-2xl bg-[#0b0b12] border border-white/15 p-4 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-zinc-900 border border-white/10">
                <Search className="w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type to jump to any CMS section..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
                />
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="text-zinc-500 hover:text-white text-xs font-mono"
                >
                  ESC
                </button>
              </div>

              <div className="space-y-1 max-h-72 overflow-y-auto">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setShowSearchModal(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-white/10 text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-zinc-400 group-hover:text-blue-400" />
                        <span className="text-sm font-semibold text-white">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500 group-hover:text-blue-400">
                        Jump →
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Viewport Content */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderActiveSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
