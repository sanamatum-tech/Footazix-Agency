/**
 * FOOTAZIX — Testimonial & Feedback Gallery Service
 * 
 * Manages client feedback screenshots (Instagram DMs, WhatsApp messages, client testimonials).
 * Source of truth: Supabase PostgreSQL `feedback_gallery` table with fallback to Supabase Storage
 * `config/extended_cms_content.json` and local cache.
 * Media Storage: Supabase Storage bucket `footazix-media/feedback/`.
 */

import { supabase, isSupabaseConfigured, SUPABASE_STORAGE_BUCKET } from '../lib/supabase';
import { FeedbackGalleryItem, FeedbackGallerySettings, AspectRatioType } from '../types';
import { INITIAL_WEBSITE_CONTENT } from '../data/mockData';

const STORAGE_KEY = 'footazix_feedback_gallery';

type Listener = (settings: FeedbackGallerySettings) => void;
const listeners: Set<Listener> = new Set();

const DEFAULT_SETTINGS: FeedbackGallerySettings = {
  enabled: true,
  aspectRatio: '1:1',
  autoScroll: true,
  scrollSpeed: 28,
  direction: 'left',
  pauseOnHover: true,
  cardGap: 20,
  cardRadius: 16,
  badge: 'CLIENT FEEDBACK',
  heading: 'CLIENT WORDS',
  subheading: 'Genuine feedback screenshots from creators and brands we edit for.',
  showSectionHeading: false,
  items: [],
};

let memorySettings: FeedbackGallerySettings | null = null;
let hasTableChecked = false;
let isTableAvailable = false;

function getStoredSettings(): FeedbackGallerySettings {
  if (memorySettings) return memorySettings;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        memorySettings = { ...DEFAULT_SETTINGS, ...parsed };
        return memorySettings!;
      }
    }
  } catch (err) {
    console.warn('Failed reading feedback gallery cache:', err);
  }
  memorySettings = INITIAL_WEBSITE_CONTENT.feedbackGallery || DEFAULT_SETTINGS;
  return memorySettings!;
}

function saveStoredSettings(settings: FeedbackGallerySettings): void {
  memorySettings = settings;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  } catch (err) {
    console.error('Failed saving feedback gallery cache:', err);
  }
  listeners.forEach((fn) => fn(settings));
}

async function probeTable(): Promise<boolean> {
  if (hasTableChecked) return isTableAvailable;
  if (!isSupabaseConfigured() || !supabase) {
    hasTableChecked = true;
    isTableAvailable = false;
    return false;
  }
  try {
    const { error } = await supabase.from('feedback_gallery').select('id').limit(0);
    hasTableChecked = true;
    isTableAvailable = !error;
    return isTableAvailable;
  } catch {
    hasTableChecked = true;
    isTableAvailable = false;
    return false;
  }
}

export const feedbackGalleryService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async getSettings(): Promise<FeedbackGallerySettings> {
    const local = getStoredSettings();
    if (!isSupabaseConfigured() || !supabase) {
      return local;
    }

    try {
      const tableReady = await probeTable();
      let tableItems: FeedbackGalleryItem[] | null = null;

      if (tableReady) {
        const { data, error } = await supabase
          .from('feedback_gallery')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data) {
          tableItems = data.map((row: any) => ({
            id: row.id,
            imageUrl: row.image_url,
            storagePath: row.storage_path,
            aspectRatio: (row.aspect_ratio as AspectRatioType) || local.aspectRatio || '1:1',
            displayOrder: row.display_order ?? 0,
            published: row.published !== false,
            visible: row.visible !== false,
            altText: row.alt_text || 'Client Feedback Screenshot',
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString(),
          }));
        }
      }

      // Read extended settings from Storage JSON config
      let storageGallery: Partial<FeedbackGallerySettings> | null = null;
      try {
        const { data: fileData, error: fileError } = await supabase.storage
          .from(SUPABASE_STORAGE_BUCKET)
          .download('config/extended_cms_content.json');

        if (!fileError && fileData) {
          const text = await fileData.text();
          const parsed = JSON.parse(text);
          if (parsed.feedbackGallery) {
            storageGallery = parsed.feedbackGallery;
          }
        }
      } catch {
        // Non-blocking
      }

      const merged: FeedbackGallerySettings = {
        ...local,
        ...(storageGallery || {}),
        items: tableItems !== null ? tableItems : (storageGallery?.items || local.items || []),
      };

      saveStoredSettings(merged);
      return merged;
    } catch (err) {
      console.warn('Feedback gallery sync notice:', err);
      return local;
    }
  },

  async updateSettings(partial: Partial<FeedbackGallerySettings>): Promise<FeedbackGallerySettings> {
    const current = getStoredSettings();
    const updated: FeedbackGallerySettings = {
      ...current,
      ...partial,
      items: partial.items !== undefined ? partial.items : current.items,
    };

    saveStoredSettings(updated);

    if (isSupabaseConfigured() && supabase) {
      try {
        // Sync to Supabase Storage config/extended_cms_content.json
        try {
          const { data: fileData } = await supabase.storage
            .from(SUPABASE_STORAGE_BUCKET)
            .download('config/extended_cms_content.json');

          let existingConfig: any = {};
          if (fileData) {
            const text = await fileData.text();
            existingConfig = JSON.parse(text);
          }

          existingConfig.feedbackGallery = updated;
          if (existingConfig.sectionVisibility) {
            existingConfig.sectionVisibility.feedbackGallery = updated.enabled;
          }

          const jsonBlob = new Blob([JSON.stringify(existingConfig, null, 2)], {
            type: 'application/json',
          });

          await supabase.storage
            .from(SUPABASE_STORAGE_BUCKET)
            .upload('config/extended_cms_content.json', jsonBlob, {
              upsert: true,
              contentType: 'application/json',
              cacheControl: '0',
            });
        } catch (storageErr) {
          console.warn('Storage JSON sync warning:', storageErr);
        }

        // Also sync items to public.feedback_gallery if table exists
        const tableReady = await probeTable();
        if (tableReady && partial.items) {
          const rows = partial.items.map((item, idx) => ({
            id: item.id,
            image_url: item.imageUrl,
            storage_path: item.storagePath || null,
            aspect_ratio: item.aspectRatio || updated.aspectRatio || '1:1',
            display_order: item.displayOrder ?? idx,
            published: item.published !== false,
            visible: item.visible !== false,
            alt_text: item.altText || 'Client Feedback Screenshot',
            updated_at: new Date().toISOString(),
          }));

          await supabase.from('feedback_gallery').upsert(rows);
        }
      } catch (err) {
        console.error('Failed syncing feedback gallery to Supabase:', err);
      }
    }

    return updated;
  },

  async addItem(data: {
    imageUrl: string;
    storagePath?: string;
    aspectRatio?: AspectRatioType;
    published?: boolean;
    visible?: boolean;
    altText?: string;
  }): Promise<FeedbackGalleryItem> {
    const current = getStoredSettings();
    const newItem: FeedbackGalleryItem = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      imageUrl: data.imageUrl,
      storagePath: data.storagePath,
      aspectRatio: data.aspectRatio || current.aspectRatio || '1:1',
      displayOrder: current.items.length,
      published: data.published !== false,
      visible: data.visible !== false,
      altText: data.altText || 'Client Feedback Screenshot',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedItems = [...current.items, newItem];
    await this.updateSettings({ items: updatedItems });

    // Directly insert into table if available
    const tableReady = await probeTable();
    if (tableReady && isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('feedback_gallery').insert({
          id: newItem.id,
          image_url: newItem.imageUrl,
          storage_path: newItem.storagePath || null,
          aspect_ratio: newItem.aspectRatio,
          display_order: newItem.displayOrder,
          published: newItem.published,
          visible: newItem.visible,
          alt_text: newItem.altText,
        });
      } catch (err) {
        console.warn('Direct table insert notice:', err);
      }
    }

    return newItem;
  },

  async updateItem(id: string, updates: Partial<FeedbackGalleryItem>): Promise<boolean> {
    const current = getStoredSettings();
    const idx = current.items.findIndex((item) => item.id === id);
    if (idx === -1) return false;

    const updatedItem = {
      ...current.items[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedItems = [...current.items];
    updatedItems[idx] = updatedItem;

    await this.updateSettings({ items: updatedItems });

    const tableReady = await probeTable();
    if (tableReady && isSupabaseConfigured() && supabase) {
      try {
        const rowUpdates: any = { updated_at: new Date().toISOString() };
        if (updates.imageUrl) rowUpdates.image_url = updates.imageUrl;
        if (updates.storagePath !== undefined) rowUpdates.storage_path = updates.storagePath;
        if (updates.aspectRatio) rowUpdates.aspect_ratio = updates.aspectRatio;
        if (updates.displayOrder !== undefined) rowUpdates.display_order = updates.displayOrder;
        if (updates.published !== undefined) rowUpdates.published = updates.published;
        if (updates.visible !== undefined) rowUpdates.visible = updates.visible;
        if (updates.altText !== undefined) rowUpdates.alt_text = updates.altText;

        await supabase.from('feedback_gallery').update(rowUpdates).eq('id', id);
      } catch (err) {
        console.warn('Direct table update notice:', err);
      }
    }

    return true;
  },

  async deleteItem(id: string): Promise<boolean> {
    const current = getStoredSettings();
    const targetItem = current.items.find((item) => item.id === id);
    const updatedItems = current.items
      .filter((item) => item.id !== id)
      .map((item, idx) => ({ ...item, displayOrder: idx }));

    await this.updateSettings({ items: updatedItems });

    const tableReady = await probeTable();
    if (tableReady && isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('feedback_gallery').delete().eq('id', id);
      } catch (err) {
        console.warn('Direct table delete notice:', err);
      }
    }

    // Safely delete from Storage if it was uploaded to feedback/
    if (targetItem?.storagePath && isSupabaseConfigured() && supabase) {
      try {
        await supabase.storage.from(SUPABASE_STORAGE_BUCKET).remove([targetItem.storagePath]);
      } catch {
        // Non-blocking
      }
    }

    return true;
  },

  async reorderItems(orderedIds: string[]): Promise<boolean> {
    const current = getStoredSettings();
    const itemMap = new Map(current.items.map((item) => [item.id, item]));
    const reordered: FeedbackGalleryItem[] = [];

    orderedIds.forEach((id, idx) => {
      const item = itemMap.get(id);
      if (item) {
        reordered.push({ ...item, displayOrder: idx, updatedAt: new Date().toISOString() });
        itemMap.delete(id);
      }
    });

    // Add any remaining items
    itemMap.forEach((item) => {
      reordered.push({ ...item, displayOrder: reordered.length });
    });

    await this.updateSettings({ items: reordered });
    return true;
  },

  /**
   * Upload image directly to Supabase Storage bucket `footazix-media/feedback/`
   */
  async uploadFeedbackImage(file: File): Promise<{
    url: string;
    path: string;
    name: string;
    size: number;
  }> {
    if (!file) throw new Error('No file provided');
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select a valid image file (PNG, JPG, WEBP)');
    }
    if (file.size > 20 * 1024 * 1024) {
      throw new Error('Image size must be under 20MB');
    }

    if (isSupabaseConfigured() && supabase) {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `feedback/${Date.now()}_${cleanName}`;

      const { data, error } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Storage upload failed: ${error.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .getPublicUrl(data.path);

      return {
        url: publicUrl,
        path: data.path,
        name: file.name,
        size: file.size,
      };
    }

    // Fallback base64 if Supabase is offline
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          path: '',
          name: file.name,
          size: file.size,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};
