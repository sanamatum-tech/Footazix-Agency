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

type AdminSection =
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

interface NavItem {
  id: AdminSection;
  label: string;
  icon: string;
  badge?: number;
}

export const AdminLayout: React.FC = () => {
  const { content, inquiries, currentUser, logout, navigateToPublic, saveStatus, saveMessage } =
    useApp();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const newInquiriesCount = inquiries.filter((i) => i.status === 'new').length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'website', label: 'Website Editor', icon: '🌐' },
    { id: 'hero', label: 'Hero CMS', icon: '⚡' },
    { id: 'vsl', label: 'VSL Settings', icon: '🎬' },
    { id: 'portfolio', label: 'Portfolio', icon: '📁' },
    { id: 'services', label: 'Services', icon: '🛠' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'inquiries', label: 'Inquiries', icon: '📥', badge: newInquiriesCount },
    { id: 'media', label: 'Media Library', icon: '🖼' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

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

  return (
    <div className="min-h-screen bg-[#07070a] text-zinc-100 flex flex-col lg:flex-row selection:bg-blue-600 selection:text-white">
      {/* Mobile Top Navigation Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#050508] border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-white/10"
            aria-label="Toggle Navigation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-display font-extrabold text-white text-base tracking-tight">
            {content.brand.name} CMS
          </span>
        </div>

        <button
          onClick={navigateToPublic}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500"
        >
          View Live Site
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#050508] border-r border-white/10 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand header in sidebar */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-lg text-white tracking-tight">
                {content.brand.name}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-500/30 text-blue-300">
                CMS
              </span>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Nav items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.35)]'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User details, View Site, Logout */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <button
            onClick={navigateToPublic}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-zinc-200 bg-zinc-900 hover:text-white hover:bg-zinc-800 border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>View Live Website</span>
          </button>

          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
            <div className="truncate max-w-[130px]">
              <span className="font-bold text-white block truncate">
                {currentUser?.email || 'Owner'}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                Prototype Mode
              </span>
            </div>

            <button
              onClick={logout}
              className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer"
              title="Sign Out"
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile menu */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Desktop Topbar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-5 border-b border-white/10 bg-[#050508]/60 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
              {content.brand.name} CMS /
            </span>
            <span className="text-sm font-bold text-white capitalize">
              {activeSection}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Save Status Indicator */}
            {saveStatus !== 'idle' && (
              <div
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
                  saveStatus === 'saving'
                    ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                    : saveStatus === 'saved'
                    ? 'bg-blue-950/40 text-blue-300 border border-blue-500/30'
                    : 'bg-red-950/40 text-red-300 border border-red-500/30'
                }`}
              >
                {saveStatus === 'saving' && (
                  <div className="w-2.5 h-2.5 border-2 border-amber-300/40 border-t-amber-300 rounded-full animate-spin" />
                )}
                <span>{saveMessage || (saveStatus === 'saved' ? 'Saved' : 'Saving...')}</span>
              </div>
            )}

            <button
              onClick={navigateToPublic}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all glow-blue-sm cursor-pointer flex items-center gap-2"
            >
              <span>VIEW LIVE SITE</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
        </header>

        {/* Viewport Content */}
        <div className="p-6 sm:p-8 lg:p-10 flex-1">
          {renderActiveSection()}
        </div>
      </main>
    </div>
  );
};
