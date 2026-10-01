/**
 * FOOTAZIX — Supabase Client Configuration
 * 
 * Safely initializes Supabase client using environment variables:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY)
 * 
 * SECURITY:
 * Never hardcode credentials. Never use secret/service role keys in client code.
 */

import { createClient } from '@supabase/supabase-js';

// Read env variables safely
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    supabaseAnonKey.length > 10
  );
};

// Create client instance. When env vars are not set, create a dummy or null client
// and provide graceful fallback in services so the app never throws on load.
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const SUPABASE_STORAGE_BUCKET = 'footazix-media';
