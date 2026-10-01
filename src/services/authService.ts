/**
 * FOOTAZIX — Prototype Auth Service
 * 
 * FRONTEND PROTOTYPE ONLY:
 * Clearly structured so it can be swapped 1:1 with Supabase Auth later:
 * `supabase.auth.signInWithPassword(...)`
 * 
 * NOTE: This prototype uses local browser session storage for development & testing.
 * Not real backend security.
 */

import { AdminUser } from '../types';

const SESSION_KEY = 'footazix_admin_session';

export const authService = {
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

  async login(
    email: string,
    password: string,
    rememberMe: boolean = true
  ): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    // Simulated auth delay
    await new Promise((r) => setTimeout(r, 350));

    // Prototype validation: accepts any standard credentials or demo credentials
    if (!email.trim() || !password.trim()) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    if (password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    const user: AdminUser = {
      id: 'admin-user-01',
      email: email.trim().toLowerCase(),
      name: email.split('@')[0] || 'Admin',
      role: 'owner',
    };

    try {
      const serialized = JSON.stringify(user);
      if (rememberMe) {
        localStorage.setItem(SESSION_KEY, serialized);
      } else {
        sessionStorage.setItem(SESSION_KEY, serialized);
      }
    } catch (err) {
      console.warn('Session write error:', err);
    }

    return { success: true, user };
  },

  async logout(): Promise<void> {
    await new Promise((r) => setTimeout(r, 100));
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
  },
};
