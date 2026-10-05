/**
 * FOOTAZIX — Unified App & CMS Context
 * 
 * Provides live, decoupled reactive state for both Public Website and Admin Panel.
 * Connected to Supabase (PostgreSQL, Auth, Storage, and Row Level Security)
 * with graceful local fallback.
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
  FAQ,
} from '../types';
import { contentService } from '../services/contentService';
import { portfolioService } from '../services/portfolioService';
import { servicesService } from '../services/servicesService';
import { teamService } from '../services/teamService';
import { inquiryService } from '../services/inquiryService';
import { mediaService } from '../services/mediaService';
import { faqService } from '../services/faqService';
import { authService } from '../services/authService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { INITIAL_WEBSITE_CONTENT } from '../data/mockData';

export type ActiveView = 'public' | 'admin' | 'terms' | 'privacy';

interface AppContextValue {
  // Navigation / View
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  navigateToAdmin: () => void;
  navigateToPublic: () => void;
  navigateToTerms: () => void;
  navigateToPrivacy: () => void;

  // Auth (Supabase Auth + admin_profiles)
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;

  // Supabase Status
  isSupabaseConnected: boolean;

  // Data
  content: WebsiteContent;
  projects: Project[];
  services: Service[];
  team: TeamMember[];
  faqs: FAQ[];
  inquiries: Inquiry[];
  media: MediaAsset[];
  isLoading: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  saveMessage: string;

  // Actions
  updateWebsiteContent: (partial: Partial<WebsiteContent>) => Promise<boolean>;
  resetWebsiteContent: () => Promise<boolean>;
  createInquiry: (data: Omit<Inquiry, 'id' | 'status' | 'createdAt'>) => Promise<boolean>;
  createFAQ: (data: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>) => Promise<FAQ | null>;
  updateFAQ: (id: string, partial: Partial<FAQ>) => Promise<boolean>;
  deleteFAQ: (id: string) => Promise<boolean>;
  reorderFAQs: (orderedIds: string[]) => Promise<boolean>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getInitialView = (): ActiveView => {
    if (typeof window === 'undefined') return 'public';
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/secureadmin') || window.location.hash === '#secureadmin' || window.location.search.includes('admin=true')) {
      return 'admin';
    }
    if (path.startsWith('/terms')) return 'terms';
    if (path.startsWith('/privacy')) return 'privacy';
    return 'public';
  };

  const [activeView, setActiveView] = useState<ActiveView>(getInitialView);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(authService.getCurrentUser());
  const [isSupabaseConnected] = useState<boolean>(isSupabaseConfigured());
  const [content, setContent] = useState<WebsiteContent>(INITIAL_WEBSITE_CONTENT);
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
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

  const navigateToTerms = useCallback(() => {
    setActiveView('terms');
    if (typeof window !== 'undefined' && window.location.pathname !== '/terms') {
      window.history.pushState({}, '', '/terms');
    }
  }, []);

  const navigateToPrivacy = useCallback(() => {
    setActiveView('privacy');
    if (typeof window !== 'undefined' && window.location.pathname !== '/privacy') {
      window.history.pushState({}, '', '/privacy');
    }
  }, []);

  // Sync browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/secureadmin')) {
        setActiveView('admin');
      } else if (path.startsWith('/terms')) {
        setActiveView('terms');
      } else if (path.startsWith('/privacy')) {
        setActiveView('privacy');
      } else {
        setActiveView('public');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Listen to Supabase auth state changes
  useEffect(() => {
    authService.initAuth().then((user) => {
      if (user) setCurrentUser(user);
    });

    const unsubAuth = authService.subscribe((user) => {
      setCurrentUser(user);
    });

    return () => unsubAuth();
  }, []);

  // Whenever currentUser is authenticated or restored, immediately fetch inquiries from Supabase
  useEffect(() => {
    if (currentUser) {
      inquiryService.getInquiries().then((inqs) => {
        if (inqs) setInquiries(inqs);
      });
    }
  }, [currentUser]);

  // Initial load from Supabase / data layer
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [c, p, s, t, f, i, m] = await Promise.all([
        contentService.getWebsiteContent(),
        portfolioService.getProjects(),
        servicesService.getServices(),
        teamService.getTeam(),
        faqService.getFAQs(),
        inquiryService.getInquiries(),
        mediaService.getMedia(),
      ]);
      setContent(c);
      setProjects(p);
      setServices(s);
      setTeam(t);
      setFaqs(f);
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

    // Subscribe to service changes
    const unsubContent = contentService.subscribe((c) => setContent(c));
    const unsubProjects = portfolioService.subscribe((p) => setProjects(p));
    const unsubServices = servicesService.subscribe((s) => setServices(s));
    const unsubTeam = teamService.subscribe((t) => setTeam(t));
    const unsubFaqs = faqService.subscribe((f) => setFaqs(f));
    const unsubInquiries = inquiryService.subscribe((i) => setInquiries(i));
    const unsubMedia = mediaService.subscribe((m) => setMedia(m));

    return () => {
      unsubContent();
      unsubProjects();
      unsubServices();
      unsubTeam();
      unsubFaqs();
      unsubInquiries();
      unsubMedia();
    };
  }, [loadData]);

  // Auth actions
  const login = async (email: string, password: string, remember: boolean = true) => {
    const res = await authService.login(email, password, remember);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      try {
        const inqs = await inquiryService.getInquiries();
        setInquiries(inqs);
      } catch (err) {
        console.warn('Error fetching inquiries after login:', err);
      }
      return { success: true };
    }
    return { success: false, error: res.error || 'Invalid credentials' };
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setInquiries([]);
  };

  // Content actions
  const updateWebsiteContent = async (partial: Partial<WebsiteContent>) => {
    try {
      setSaveStatus('saving');
      setSaveMessage('Saving changes to Supabase...');
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
      if (currentUser) {
        inquiryService.getInquiries().then((fresh) => setInquiries(fresh));
      }
      return true;
    } catch (err: any) {
      console.error('Failed creating inquiry in Supabase:', err);
      throw err;
    }
  };

  const createFAQ = async (data: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const created = await faqService.createFAQ(data);
      return created;
    } catch (err) {
      console.error('Failed creating FAQ:', err);
      return null;
    }
  };

  const updateFAQ = async (id: string, partial: Partial<FAQ>) => {
    try {
      return await faqService.updateFAQ(id, partial);
    } catch (err) {
      console.error('Failed updating FAQ:', err);
      return false;
    }
  };

  const deleteFAQ = async (id: string) => {
    try {
      return await faqService.deleteFAQ(id);
    } catch (err) {
      console.error('Failed deleting FAQ:', err);
      return false;
    }
  };

  const reorderFAQs = async (orderedIds: string[]) => {
    try {
      return await faqService.reorderFAQs(orderedIds);
    } catch (err) {
      console.error('Failed reordering FAQs:', err);
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
        navigateToTerms,
        navigateToPrivacy,
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        isSupabaseConnected,
        content,
        projects,
        services,
        team,
        faqs,
        inquiries,
        media,
        isLoading,
        saveStatus,
        saveMessage,
        updateWebsiteContent,
        resetWebsiteContent,
        createInquiry,
        createFAQ,
        updateFAQ,
        deleteFAQ,
        reorderFAQs,
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
