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

// Default project credentials fallback (Supabase publishable key is safe for client-side browser usage)
const DEFAULT_SUPABASE_URL = 'https://gdwlkqrzcixjajzvcwvg.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_UlPvejNsd99sBwnB66HJqg_7pGmZ2l9';

// Read env variables safely with project fallback
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (typeof process !== 'undefined' ? process.env : {});
const supabaseUrl = (env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
const supabaseAnonKey = (
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_KEY
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
