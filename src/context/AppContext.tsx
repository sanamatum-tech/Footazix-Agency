/**
 * FOOTAZIX — Unified App & CMS Context
 * 
 * Provides live, decoupled reactive state for both Public Website and Admin Panel.
 * Synchronizes with the local services layer (which later connects to Supabase).
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  WebsiteContent,
  Project,
  Service,
  TeamMember,
  Inquiry,
  MediaAsset,
  AdminUser,
} from '../types';
import { contentService } from '../services/contentService';
import { portfolioService } from '../services/portfolioService';
import { servicesService } from '../services/servicesService';
import { teamService } from '../services/teamService';
import { inquiryService } from '../services/inquiryService';
import { mediaService } from '../services/mediaService';
import { authService } from '../services/authService';
import { INITIAL_WEBSITE_CONTENT } from '../data/mockData';

export type ActiveView = 'public' | 'admin';

interface AppContextValue {
  // Navigation / View
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  navigateToAdmin: () => void;
  navigateToPublic: () => void;

  // Auth (Prototype)
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;

  // Data
  content: WebsiteContent;
  projects: Project[];
  services: Service[];
  team: TeamMember[];
  inquiries: Inquiry[];
  media: MediaAsset[];
  isLoading: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  saveMessage: string;

  // Actions
  updateWebsiteContent: (partial: Partial<WebsiteContent>) => Promise<boolean>;
  resetWebsiteContent: () => Promise<boolean>;
  createInquiry: (data: Omit<Inquiry, 'id' | 'status' | 'createdAt'>) => Promise<boolean>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Check initial URL to see if /secureadmin was requested
  const isInitialAdmin = typeof window !== 'undefined' && (
    window.location.pathname.startsWith('/secureadmin') ||
    window.location.hash === '#secureadmin' ||
    window.location.search.includes('admin=true')
  );

  const [activeView, setActiveView] = useState<ActiveView>(isInitialAdmin ? 'admin' : 'public');
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(authService.getCurrentUser());
  const [content, setContent] = useState<WebsiteContent>(INITIAL_WEBSITE_CONTENT);
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  // Handle URL history state
  const navigateToAdmin = useCallback(() => {
    setActiveView('admin');
    if (typeof window !== 'undefined' && window.location.pathname !== '/secureadmin') {
      window.history.pushState({}, '', '/secureadmin');
    }
  }, []);

  const navigateToPublic = useCallback(() => {
    setActiveView('public');
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
  }, []);

  // Sync browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/secureadmin')) {
        setActiveView('admin');
      } else {
        setActiveView('public');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initial load
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [c, p, s, t, i, m] = await Promise.all([
        contentService.getWebsiteContent(),
        portfolioService.getProjects(),
        servicesService.getServices(),
        teamService.getTeam(),
        inquiryService.getInquiries(),
        mediaService.getMedia(),
      ]);
      setContent(c);
      setProjects(p);
      setServices(s);
      setTeam(t);
      setInquiries(i);
      setMedia(m);
    } catch (err) {
      console.error('Error loading initial app state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Subscribe to real-time service changes
    const unsubContent = contentService.subscribe((c) => setContent(c));
    const unsubProjects = portfolioService.subscribe((p) => setProjects(p));
    const unsubServices = servicesService.subscribe((s) => setServices(s));
    const unsubTeam = teamService.subscribe((t) => setTeam(t));
    const unsubInquiries = inquiryService.subscribe((i) => setInquiries(i));
    const unsubMedia = mediaService.subscribe((m) => setMedia(m));

    return () => {
      unsubContent();
      unsubProjects();
      unsubServices();
      unsubTeam();
      unsubInquiries();
      unsubMedia();
    };
  }, [loadData]);

  // Auth actions
  const login = async (email: string, password: string, remember: boolean = true) => {
    const res = await authService.login(email, password, remember);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Invalid credentials' };
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  // Content actions
  const updateWebsiteContent = async (partial: Partial<WebsiteContent>) => {
    try {
      setSaveStatus('saving');
      setSaveMessage('Saving changes...');
      const updated = await contentService.updateWebsiteContent(partial);
      setContent(updated);
      setSaveStatus('saved');
      setSaveMessage('Saved successfully');
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 2500);
      return true;
    } catch (err) {
      setSaveStatus('error');
      setSaveMessage('Failed to save changes.');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return false;
    }
  };

  const resetWebsiteContent = async () => {
    try {
      setSaveStatus('saving');
      const reset = await contentService.resetWebsiteContent();
      setContent(reset);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      return true;
    } catch {
      setSaveStatus('error');
      return false;
    }
  };

  const createInquiry = async (data: Omit<Inquiry, 'id' | 'status' | 'createdAt'>) => {
    try {
      await inquiryService.createInquiry(data);
      return true;
    } catch (err) {
      console.error('Failed creating inquiry:', err);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        navigateToAdmin,
        navigateToPublic,
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        content,
        projects,
        services,
        team,
        inquiries,
        media,
        isLoading,
        saveStatus,
        saveMessage,
        updateWebsiteContent,
        resetWebsiteContent,
        createInquiry,
        refreshAll: loadData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
