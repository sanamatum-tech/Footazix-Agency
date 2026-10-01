/**
 * FOOTAZIX — Supabase Media & Storage Service
 * 
 * Uploads media assets to Supabase Storage bucket: `footazix-media`
 * Generates public URLs for portfolio covers, team photos, and VSL posters.
 * Falls back to local preview when credentials are not yet configured.
 */

import { supabase, isSupabaseConfigured, SUPABASE_STORAGE_BUCKET } from '../lib/supabase';
import { MediaAsset, MediaCategory } from '../types';
import { INITIAL_MEDIA } from '../data/mockData';

const STORAGE_KEY = 'footazix_media_assets';

type Listener = (assets: MediaAsset[]) => void;
const listeners: Set<Listener> = new Set();

function getStoredMedia(): MediaAsset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_MEDIA;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed reading media from localStorage:', err);
    return INITIAL_MEDIA;
  }
}

function saveStoredMedia(assets: MediaAsset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
    listeners.forEach((fn) => fn(assets));
  } catch (err) {
    console.error('Failed saving media to localStorage:', err);
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const mediaService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async getMedia(category?: MediaCategory): Promise<MediaAsset[]> {
    const local = getStoredMedia();

    // If Supabase is configured, try listing files from storage bucket
    if (isSupabaseConfigured() && supabase) {
      try {
        const folder = category || '';
        const { data: files, error } = await supabase.storage
          .from(SUPABASE_STORAGE_BUCKET)
          .list(folder, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

        if (!error && files && files.length > 0) {
          const storageAssets: MediaAsset[] = files
            .filter((f) => f.name && !f.name.startsWith('.'))
            .map((f) => {
              const filePath = folder ? `${folder}/${f.name}` : f.name;
              const { data: { publicUrl } } = supabase!.storage
                .from(SUPABASE_STORAGE_BUCKET)
                .getPublicUrl(filePath);

              return {
                id: `sp-${f.id || f.name}`,
                name: f.name,
                url: publicUrl,
                category: category || 'images',
                size: formatBytes(f.metadata?.size || 0),
                uploadedAt: f.created_at ? f.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
              };
            });

          // Merge storage assets with local cache without duplicates
          const existingUrls = new Set(storageAssets.map((a) => a.url));
          const merged = [...storageAssets, ...local.filter((a) => !existingUrls.has(a.url))];
          saveStoredMedia(merged);
          return category ? merged.filter((a) => a.category === category) : merged;
        }
      } catch (err) {
        console.warn('Storage listing notice:', err);
      }
    }

    if (category) {
      return local.filter((a) => a.category === category);
    }
    return local;
  },

  async uploadMedia(file: File, category: MediaCategory): Promise<MediaAsset> {
    // 1. If Supabase is configured, upload directly to Supabase Storage
    if (isSupabaseConfigured() && supabase) {
      try {
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `${category}/${Date.now()}_${cleanName}`;

        const { data, error } = await supabase.storage
          .from(SUPABASE_STORAGE_BUCKET)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          console.error('Supabase storage upload error:', error);
          throw new Error(error.message);
        }

        const { data: { publicUrl } } = supabase.storage
          .from(SUPABASE_STORAGE_BUCKET)
          .getPublicUrl(data.path);

        const asset: MediaAsset = {
          id: `media-${Date.now()}`,
          name: file.name,
          url: publicUrl,
          category,
          size: formatBytes(file.size),
          uploadedAt: new Date().toISOString().split('T')[0],
        };

        const current = getStoredMedia();
        const updated = [asset, ...current];
        saveStoredMedia(updated);
        return asset;
      } catch (err: any) {
        console.warn('Supabase storage upload failed, falling back to local object URL:', err.message);
      }
    }

    // 2. Fallback to local object URL preview
    await new Promise((r) => setTimeout(r, 300));
    const objectUrl = URL.createObjectURL(file);
    const media: MediaAsset = {
      id: `media-${Date.now()}`,
      name: file.name,
      url: objectUrl,
      category,
      size: formatBytes(file.size),
      uploadedAt: new Date().toISOString().split('T')[0],
    };

    const current = getStoredMedia();
    const updated = [media, ...current];
    saveStoredMedia(updated);
    return media;
  },

  async deleteMedia(id: string): Promise<boolean> {
    const current = getStoredMedia();
    const target = current.find((m) => m.id === id);

    if (isSupabaseConfigured() && supabase && target && target.url.includes(SUPABASE_STORAGE_BUCKET)) {
      try {
        // Extract relative path from URL
        const parts = target.url.split(`${SUPABASE_STORAGE_BUCKET}/`);
        if (parts[1]) {
          await supabase.storage.from(SUPABASE_STORAGE_BUCKET).remove([decodeURIComponent(parts[1])]);
        }
      } catch (err) {
        console.warn('Storage delete error:', err);
      }
    }

    const filtered = current.filter((m) => m.id !== id);
    saveStoredMedia(filtered);
    return true;
  },

  async resetMedia(): Promise<MediaAsset[]> {
    saveStoredMedia(INITIAL_MEDIA);
    return INITIAL_MEDIA;
  },
};
