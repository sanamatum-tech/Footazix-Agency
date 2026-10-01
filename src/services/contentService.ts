/**
 * FOOTAZIX — Content Service
 * 
 * Clean abstraction for website content operations.
 * Prepared for future Supabase table: `website_content`
 */

import { WebsiteContent } from '../types';
import { INITIAL_WEBSITE_CONTENT } from '../data/mockData';

const STORAGE_KEY = 'footazix_website_content';

// Simple pub-sub listener for real-time reactivity
type Listener = (content: WebsiteContent) => void;
const listeners: Set<Listener> = new Set();

function getStoredContent(): WebsiteContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_WEBSITE_CONTENT;
    return { ...INITIAL_WEBSITE_CONTENT, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Failed reading website content from localStorage, using fallback:', err);
    return INITIAL_WEBSITE_CONTENT;
  }
}

function saveStoredContent(content: WebsiteContent): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    listeners.forEach((fn) => fn(content));
  } catch (err) {
    console.error('Failed saving website content to localStorage:', err);
  }
}

export const contentService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async getWebsiteContent(): Promise<WebsiteContent> {
    // Simulated network latency for realistic async behavior (future Supabase)
    await new Promise((r) => setTimeout(r, 60));
    return getStoredContent();
  },

  async updateWebsiteContent(partial: Partial<WebsiteContent>): Promise<WebsiteContent> {
    await new Promise((r) => setTimeout(r, 120));
    const current = getStoredContent();
    const updated: WebsiteContent = {
      ...current,
      ...partial,
      brand: { ...current.brand, ...(partial.brand || {}) },
      hero: { ...current.hero, ...(partial.hero || {}) },
      vsl: { ...current.vsl, ...(partial.vsl || {}) },
      rawToReady: { ...current.rawToReady, ...(partial.rawToReady || {}) },
      sectionHeadings: { ...current.sectionHeadings, ...(partial.sectionHeadings || {}) },
      footer: { ...current.footer, ...(partial.footer || {}) },
    };
    saveStoredContent(updated);
    return updated;
  },

  async resetWebsiteContent(): Promise<WebsiteContent> {
    await new Promise((r) => setTimeout(r, 100));
    saveStoredContent(INITIAL_WEBSITE_CONTENT);
    return INITIAL_WEBSITE_CONTENT;
  },
};
