/**
 * FOOTAZIX — Supabase Media & Storage Service
 * 
 * Uploads media assets to Supabase Storage bucket: `footazix-media`
 * Generates public URLs for logos, favicons, portfolio covers, team photos, and VSL posters.
 * Uses persistent base64 data URLs for offline fallback (NO temporary blob: URLs).
 */

import { supabase, isSupabaseConfigured, SUPABASE_STORAGE_BUCKET } from '../lib/supabase';
import { MediaAsset, MediaCategory } from '../types';
import { INITIAL_MEDIA } from '../data/mockData';

const STORAGE_KEY = 'footazix_media_assets';

type Listener = (assets: MediaAsset[]) => void;
const listeners: Set<Listener> = new Set();

function getStoredMedia(): MediaAsset[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return INITIAL_MEDIA;
    }
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
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
    }
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

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export function getImageDimensions(fileOrUrl: File | string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({ width: 1200, height: 630 });
      return;
    }
    const img = new Image();
    if (typeof fileOrUrl === 'string') {
      img.onload = () => {
        resolve({ width: img.naturalWidth || 1200, height: img.naturalHeight || 630 });
      };
      img.onerror = () => resolve({ width: 1200, height: 630 });
      img.src = fileOrUrl;
    } else {
      const blobUrl = URL.createObjectURL(fileOrUrl);
      img.onload = () => {
        const w = img.naturalWidth || 1200;
        const h = img.naturalHeight || 630;
        URL.revokeObjectURL(blobUrl);
        resolve({ width: w, height: h });
      };
      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        resolve({ width: 1200, height: 630 });
      };
      img.src = blobUrl;
    }
  });
}

export function getVideoMetadata(fileOrUrl: File | string): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({ duration: 0, width: 1920, height: 1080 });
      return;
    }
    const video = document.createElement('video');
    video.preload = 'metadata';
    let isCleaned = false;
    const cleanUp = () => {
      if (isCleaned) return;
      isCleaned = true;
      if (typeof fileOrUrl !== 'string') {
        URL.revokeObjectURL(video.src);
      }
    };
    video.onloadedmetadata = () => {
      const d = video.duration || 0;
      const w = video.videoWidth || 1920;
      const h = video.videoHeight || 1080;
      cleanUp();
      resolve({ duration: d, width: w, height: h });
    };
    video.onerror = () => {
      cleanUp();
      resolve({ duration: 0, width: 1920, height: 1080 });
    };
    if (typeof fileOrUrl === 'string') {
      video.src = fileOrUrl;
    } else {
      video.src = URL.createObjectURL(fileOrUrl);
    }
  });
}

export async function verifyMediaUrl(url: string): Promise<{
  accessible: boolean;
  status: number;
  contentType?: string;
  contentLength?: string;
  error?: string;
}> {
  if (!url || !url.trim()) {
    return { accessible: false, status: 0, error: 'Empty URL' };
  }
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    if (res.ok) {
      const ct = res.headers.get('content-type') || undefined;
      const cl = res.headers.get('content-length')
        ? formatBytes(parseInt(res.headers.get('content-length')!, 10))
        : undefined;
      return { accessible: true, status: res.status, contentType: ct, contentLength: cl };
    }
    // Try range GET fallback if HEAD returns 405
    const getRes = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-100' },
      cache: 'no-store',
    });
    if (getRes.ok || getRes.status === 206) {
      const ct = getRes.headers.get('content-type') || undefined;
      const cl = getRes.headers.get('content-length')
        ? formatBytes(parseInt(getRes.headers.get('content-length')!, 10))
        : undefined;
      return { accessible: true, status: getRes.status, contentType: ct, contentLength: cl };
    }
    return { accessible: false, status: getRes.status, error: `HTTP ${getRes.status} ${getRes.statusText}` };
  } catch (err: any) {
    return { accessible: false, status: 0, error: err?.message || 'Network check failed' };
  }
}

export const mediaService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async getMedia(category?: MediaCategory): Promise<MediaAsset[]> {
    const local = getStoredMedia();

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

              const isVideo =
                Boolean(f.name.match(/\.(mp4|webm|ogg|mov|m4v)$/i)) ||
                folder === 'videos' ||
                Boolean(f.metadata?.mimetype?.startsWith('video/'));

              return {
                id: `sp-${f.id || f.name}`,
                name: f.name,
                url: publicUrl,
                category: (folder as MediaCategory) || (isVideo ? 'videos' : 'images'),
                type: isVideo ? 'video' : 'image',
                size: formatBytes(f.metadata?.size || 0),
                uploadedAt: f.created_at ? f.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
              };
            });

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
    const isVideo =
      category === 'videos' ||
      file.type.startsWith('video/') ||
      Boolean(file.name.match(/\.(mp4|webm|ogg|mov|m4v)$/i));

    const targetCategory: MediaCategory = isVideo ? 'videos' : category;
    const contentType = file.type || (isVideo ? 'video/mp4' : undefined);

    // Extract video duration and dimensions dynamically
    let durationSec: number | undefined;
    let dimensionsStr: string | undefined;
    if (isVideo) {
      try {
        const meta = await getVideoMetadata(file);
        if (meta.duration > 0) durationSec = Math.round(meta.duration);
        if (meta.width > 0 && meta.height > 0) dimensionsStr = `${meta.width}x${meta.height}`;
      } catch {
        // Non-blocking
      }
    }

    // 1. If Supabase is configured, upload directly to Supabase Storage bucket
    if (isSupabaseConfigured() && supabase) {
      try {
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `${targetCategory}/${Date.now()}_${cleanName}`;

        const { data, error } = await supabase.storage
          .from(SUPABASE_STORAGE_BUCKET)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType,
          });

        if (error) {
          console.error('Supabase storage upload error:', error);
          throw new Error(`Storage upload error: ${error.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from(SUPABASE_STORAGE_BUCKET)
          .getPublicUrl(data.path);

        const asset: MediaAsset = {
          id: `media-${Date.now()}`,
          name: file.name,
          url: publicUrl,
          category: targetCategory,
          type: isVideo ? 'video' : 'image',
          size: formatBytes(file.size),
          duration: durationSec ? `${durationSec}s` : undefined,
          dimensions: dimensionsStr,
          uploadedAt: new Date().toISOString().split('T')[0],
          verified: true,
        };

        const current = getStoredMedia();
        const updated = [asset, ...current.filter((m) => m.url !== publicUrl)];
        saveStoredMedia(updated);
        return asset;
      } catch (err: any) {
        console.warn('Supabase storage upload failed:', err.message);
        if (isVideo) {
          throw new Error(`Failed to upload video to Supabase Storage: ${err?.message || 'Unknown error'}`);
        }
      }
    }

    // 2. Persistent fallback to base64 data URL for images only (never video)
    if (isVideo) {
      throw new Error('Supabase Storage is required to host direct video uploads. Please ensure Supabase credentials are configured.');
    }

    const dataUrl = await fileToDataUrl(file);
    const media: MediaAsset = {
      id: `media-${Date.now()}`,
      name: file.name,
      url: dataUrl,
      category: targetCategory,
      type: 'image',
      size: formatBytes(file.size),
      uploadedAt: new Date().toISOString().split('T')[0],
    };

    const current = getStoredMedia();
    const updated = [media, ...current];
    saveStoredMedia(updated);
    return media;
  },

  /**
   * Upload brand asset (Header Logo, Favicon, Footer Logo, OG Image)
   * Guaranteed to return a permanent Supabase Storage public URL or persistent data URL.
   */
  async uploadBrandAsset(
    file: File,
    folder: 'logos' | 'favicons' | 'branding' = 'branding'
  ): Promise<{ url: string; name: string; size: string; width: number; height: number; type: string }> {
    const asset = await this.uploadMedia(file, folder);
    const { width, height } = await getImageDimensions(file);
    return {
      url: asset.url,
      name: asset.name,
      size: asset.size,
      width,
      height,
      type: file.type || (asset.url.endsWith('.png') ? 'image/png' : 'image/jpeg'),
    };
  },

  async deleteMedia(id: string): Promise<boolean> {
    const current = getStoredMedia();
    const target = current.find((m) => m.id === id);

    if (isSupabaseConfigured() && supabase && target && target.url.includes(SUPABASE_STORAGE_BUCKET)) {
      try {
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
