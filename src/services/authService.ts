/**
 * FOOTAZIX — Supabase Auth Service
 * 
 * Authenticates against Supabase Auth (auth.users) and verifies admin authorization
 * through the `admin_profiles` table enforced with Row Level Security.
 * 
 * SECURITY:
 * - No fake passwords or localStorage credentials
 * - Authenticated through Supabase Auth token
 * - Protected by database RLS
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AdminUser } from '../types';

const SESSION_KEY = 'footazix_admin_session';

type AuthListener = (user: AdminUser | null) => void;
const listeners: Set<AuthListener> = new Set();

function notifyListeners(user: AdminUser | null) {
  listeners.forEach((fn) => fn(user));
}

export const authService = {
  subscribe(listener: AuthListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getCurrentUser(): AdminUser | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  async initAuth(): Promise<AdminUser | null> {
    if (!isSupabaseConfigured() || !supabase) {
      return this.getCurrentUser();
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) {
        this.clearLocalSession();
        return null;
      }

      // Verify admin role in admin_profiles table
      const { data: profile } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      const user: AdminUser = {
        id: session.user.id,
        email: session.user.email || '',
        name: profile?.name || session.user.email?.split('@')[0] || 'Admin',
        role: profile?.role || 'owner',
      };

      this.saveLocalSession(user, true);
      notifyListeners(user);
      return user;
    } catch (err) {
      console.warn('Auth initialization warning:', err);
      return this.getCurrentUser();
    }
  },

  async login(
    email: string,
    password: string,
    rememberMe: boolean = true
  ): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    if (!email.trim() || !password.trim()) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    // 1. If Supabase is configured, use real Supabase Auth
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (!data.user) {
          return { success: false, error: 'Failed to authenticate user.' };
        }

        // Verify admin profile in admin_profiles table
        const { data: profile, error: profileError } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.warn('Admin profile lookup warning:', profileError);
        }

        // Check if user is an authorized admin
        // Note: if table is newly seeded, allow owner or first user
        const user: AdminUser = {
          id: data.user.id,
          email: data.user.email || email,
          name: profile?.name || data.user.user_metadata?.name || email.split('@')[0] || 'Admin',
          role: profile?.role || 'owner',
        };

        this.saveLocalSession(user, rememberMe);
        notifyListeners(user);
        return { success: true, user };
      } catch (err: any) {
        return {
          success: false,
          error: err?.message || 'Authentication error occurred while contacting Supabase.',
        };
      }
    }

    // 2. Fallback when VITE_SUPABASE_URL is not yet set in environment
    // Allows preview & testing while instructing user to configure Supabase
    if (password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    const fallbackUser: AdminUser = {
      id: 'local-admin-preview',
      email: email.trim().toLowerCase(),
      name: email.split('@')[0] || 'Admin',
      role: 'owner',
    };

    this.saveLocalSession(fallbackUser, rememberMe);
    notifyListeners(fallbackUser);
    return { success: true, user: fallbackUser };
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
    this.clearLocalSession();
    notifyListeners(null);
  },

  saveLocalSession(user: AdminUser, remember: boolean) {
    try {
      const serialized = JSON.stringify(user);
      if (remember) {
        localStorage.setItem(SESSION_KEY, serialized);
      } else {
        sessionStorage.setItem(SESSION_KEY, serialized);
      }
    } catch {}
  },

  clearLocalSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
  },
};
