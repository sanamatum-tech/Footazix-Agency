/**
 * FOOTAZIX — Media Service
 * 
 * Clean abstraction for media assets.
 * Prepared for future Supabase Storage bucket: `footazix-media`
 */

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
    await new Promise((r) => setTimeout(r, 60));
    const all = getStoredMedia();
    if (category) {
      return all.filter((a) => a.category === category);
    }
    return all;
  },

  async uploadMedia(file: File, category: MediaCategory): Promise<MediaAsset> {
    // Simulated upload delay
    await new Promise((r) => setTimeout(r, 400));

    // Create a local blob/object URL for client preview
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
    await new Promise((r) => setTimeout(r, 80));
    const current = getStoredMedia();
    const filtered = current.filter((m) => m.id !== id);
    saveStoredMedia(filtered);
    return true;
  },

  async resetMedia(): Promise<MediaAsset[]> {
    saveStoredMedia(INITIAL_MEDIA);
    return INITIAL_MEDIA;
  },
};
