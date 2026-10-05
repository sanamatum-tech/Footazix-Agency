/**
 * FOOTAZIX — FAQ Service
 * 
 * Interacts with Supabase `faqs` table with Row Level Security.
 * Public visitors view published, visible FAQs.
 * Admins manage full FAQ lifecycle (create, edit, delete, reorder, publish/unpublish, feature).
 * Seamless local and storage fallback ensures zero downtime.
 */

import { supabase, isSupabaseConfigured, SUPABASE_STORAGE_BUCKET } from '../lib/supabase';
import { FAQ } from '../types';
import { INITIAL_FAQS } from '../data/mockData';

const STORAGE_KEY = 'footazix_faqs';

type Listener = (faqs: FAQ[]) => void;
const listeners: Set<Listener> = new Set();
let memoryCache: FAQ[] | null = null;

function getStoredFAQs(): FAQ[] {
  if (memoryCache && memoryCache.length > 0) {
    return memoryCache;
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        memoryCache = JSON.parse(raw);
        return memoryCache!;
      }
    }
  } catch (err) {
    console.warn('Failed reading FAQs from localStorage:', err);
  }
  memoryCache = INITIAL_FAQS;
  return INITIAL_FAQS;
}

function saveStoredFAQs(faqs: FAQ[]): void {
  memoryCache = faqs;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(faqs));
    }
  } catch (err) {
    console.error('Failed saving FAQs to localStorage:', err);
  }
  listeners.forEach((fn) => fn(faqs));
}

function mapRowToFAQ(row: any): FAQ {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category || 'General',
    order: row.display_order ?? row.order ?? 1,
    published: row.published !== false,
    visible: row.visible !== false,
    featured: Boolean(row.featured),
    lastReviewedDate: row.last_reviewed_date || row.lastReviewedDate || new Date().toISOString().split('T')[0],
    relatedService: row.related_service || row.relatedService,
    relatedProject: row.related_project || row.relatedProject,
    ctaText: row.cta_text || row.ctaText,
    ctaUrl: row.cta_url || row.ctaUrl,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
  };
}

export const faqService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async getFAQs(): Promise<FAQ[]> {
    const local = getStoredFAQs();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped = data.map(mapRowToFAQ);
          saveStoredFAQs(mapped);
          return mapped;
        }

        // If the table doesn't exist or is empty yet, check Supabase Storage config with cache-busting
        try {
          const publicUrl = `${supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl('config/extended_cms_content.json').data.publicUrl}?t=${Date.now()}`;
          const res = await fetch(publicUrl, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
            },
          });
          if (res.ok) {
            const parsed = await res.json();
            if (Array.isArray(parsed.faqs) && parsed.faqs.length > 0) {
              saveStoredFAQs(parsed.faqs);
              return parsed.faqs;
            }
          } else {
            const { data: fileData, error: fileError } = await supabase.storage
              .from(SUPABASE_STORAGE_BUCKET)
              .download('config/extended_cms_content.json');

            if (!fileError && fileData) {
              const text = await fileData.text();
              const parsed = JSON.parse(text);
              if (Array.isArray(parsed.faqs) && parsed.faqs.length > 0) {
                saveStoredFAQs(parsed.faqs);
                return parsed.faqs;
              }
            }
          }
        } catch {
          try {
            const { data: fileData, error: fileError } = await supabase.storage
              .from(SUPABASE_STORAGE_BUCKET)
              .download('config/extended_cms_content.json');

            if (!fileError && fileData) {
              const text = await fileData.text();
              const parsed = JSON.parse(text);
              if (Array.isArray(parsed.faqs) && parsed.faqs.length > 0) {
                saveStoredFAQs(parsed.faqs);
                return parsed.faqs;
              }
            }
          } catch {
            // Non-blocking storage fallback
          }
        }
      } catch (err) {
        console.warn('Supabase faqs query fallback:', err);
      }
    }

    return local;
  },

  async getPublicFAQs(): Promise<FAQ[]> {
    const all = await this.getFAQs();
    return all.filter((f) => f.published && f.visible);
  },

  async createFAQ(item: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>): Promise<FAQ> {
    const current = getStoredFAQs();
    const newId = `faq-${Date.now()}`;
    const now = new Date().toISOString();

    const newFAQ: FAQ = {
      ...item,
      id: newId,
      order: item.order || current.length + 1,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [...current, newFAQ];
    saveStoredFAQs(updated);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('faqs').insert([
          {
            id: newFAQ.id,
            question: newFAQ.question,
            answer: newFAQ.answer,
            category: newFAQ.category,
            display_order: newFAQ.order,
            published: newFAQ.published,
            visible: newFAQ.visible,
            featured: newFAQ.featured,
            last_reviewed_date: newFAQ.lastReviewedDate,
            related_service: newFAQ.relatedService,
            related_project: newFAQ.relatedProject,
            cta_text: newFAQ.ctaText,
            cta_url: newFAQ.ctaUrl,
            created_at: now,
            updated_at: now,
          },
        ]);

        // Also update storage snapshot
        this.syncToStorageSnapshot(updated);
      } catch (err) {
        console.warn('Supabase FAQ insert notice:', err);
      }
    }

    return newFAQ;
  },

  async updateFAQ(id: string, partial: Partial<FAQ>): Promise<boolean> {
    const current = getStoredFAQs();
    const index = current.findIndex((f) => f.id === id);
    if (index === -1) return false;

    const now = new Date().toISOString();
    const updatedFAQ: FAQ = {
      ...current[index],
      ...partial,
      updatedAt: now,
    };

    const updatedList = [...current];
    updatedList[index] = updatedFAQ;
    saveStoredFAQs(updatedList);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('faqs')
          .update({
            question: updatedFAQ.question,
            answer: updatedFAQ.answer,
            category: updatedFAQ.category,
            display_order: updatedFAQ.order,
            published: updatedFAQ.published,
            visible: updatedFAQ.visible,
            featured: updatedFAQ.featured,
            last_reviewed_date: updatedFAQ.lastReviewedDate,
            related_service: updatedFAQ.relatedService,
            related_project: updatedFAQ.relatedProject,
            cta_text: updatedFAQ.ctaText,
            cta_url: updatedFAQ.ctaUrl,
            updated_at: now,
          })
          .eq('id', id);

        this.syncToStorageSnapshot(updatedList);
      } catch (err) {
        console.warn('Supabase FAQ update notice:', err);
      }
    }

    return true;
  },

  async deleteFAQ(id: string): Promise<boolean> {
    const current = getStoredFAQs();
    const filtered = current.filter((f) => f.id !== id);
    saveStoredFAQs(filtered);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('faqs').delete().eq('id', id);
        this.syncToStorageSnapshot(filtered);
      } catch (err) {
        console.warn('Supabase FAQ delete notice:', err);
      }
    }

    return true;
  },

  async reorderFAQs(orderedIds: string[]): Promise<boolean> {
    const current = getStoredFAQs();
    const idMap = new Map(current.map((f) => [f.id, f]));
    const reordered: FAQ[] = [];

    orderedIds.forEach((id, index) => {
      const item = idMap.get(id);
      if (item) {
        reordered.push({ ...item, order: index + 1 });
      }
    });

    saveStoredFAQs(reordered);

    if (isSupabaseConfigured() && supabase) {
      const client = supabase;
      try {
        const promises = reordered.map((faq) =>
          client
            .from('faqs')
            .update({ display_order: faq.order })
            .eq('id', faq.id)
        );
        await Promise.all(promises);
        this.syncToStorageSnapshot(reordered);
      } catch (err) {
        console.warn('Supabase reorder notice:', err);
      }
    }

    return true;
  },

  async resetFAQs(): Promise<FAQ[]> {
    saveStoredFAQs(INITIAL_FAQS);
    if (isSupabaseConfigured() && supabase) {
      try {
        this.syncToStorageSnapshot(INITIAL_FAQS);
      } catch (err) {
        console.warn('Reset FAQ storage notice:', err);
      }
    }
    return INITIAL_FAQS;
  },

  async syncToStorageSnapshot(faqs: FAQ[]): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      // Download existing extended configuration and augment with faqs
      const { data: fileData } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .download('config/extended_cms_content.json');

      let configObj: any = {};
      if (fileData) {
        const text = await fileData.text();
        configObj = JSON.parse(text);
      }
      configObj.faqs = faqs;

      const blob = new Blob([JSON.stringify(configObj, null, 2)], {
        type: 'application/json',
      });
      await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .upload('config/extended_cms_content.json', blob, {
          upsert: true,
          contentType: 'application/json',
          cacheControl: '0',
        });
    } catch {
      // Non-blocking
    }
  },
};
