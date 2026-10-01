/**
 * FOOTAZIX — Inquiry Service
 * 
 * Clean abstraction for client project requests.
 * Prepared for future Supabase table: `project_inquiries`
 */

import { Inquiry, InquiryStatus } from '../types';
import { INITIAL_INQUIRIES } from '../data/mockData';

const STORAGE_KEY = 'footazix_inquiries';

type Listener = (inquiries: Inquiry[]) => void;
const listeners: Set<Listener> = new Set();

function getStoredInquiries(): Inquiry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_INQUIRIES;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed reading inquiries from localStorage:', err);
    return INITIAL_INQUIRIES;
  }
}

function saveStoredInquiries(inquiries: Inquiry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inquiries));
    listeners.forEach((fn) => fn(inquiries));
  } catch (err) {
    console.error('Failed saving inquiries to localStorage:', err);
  }
}

export const inquiryService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async getInquiries(): Promise<Inquiry[]> {
    await new Promise((r) => setTimeout(r, 60));
    return getStoredInquiries();
  },

  async createInquiry(
    data: Omit<Inquiry, 'id' | 'status' | 'createdAt'>
  ): Promise<Inquiry> {
    await new Promise((r) => setTimeout(r, 120));
    const inquiries = getStoredInquiries();
    const newInquiry: Inquiry = {
      ...data,
      id: `inq-${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    const updated = [newInquiry, ...inquiries];
    saveStoredInquiries(updated);
    return newInquiry;
  },

  async updateInquiryStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
    await new Promise((r) => setTimeout(r, 80));
    const inquiries = getStoredInquiries();
    const index = inquiries.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Inquiry not found');
    const updated = { ...inquiries[index], status };
    inquiries[index] = updated;
    saveStoredInquiries([...inquiries]);
    return updated;
  },

  async updateInquiryNotes(id: string, notes: string): Promise<Inquiry> {
    await new Promise((r) => setTimeout(r, 80));
    const inquiries = getStoredInquiries();
    const index = inquiries.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Inquiry not found');
    const updated = { ...inquiries[index], notes };
    inquiries[index] = updated;
    saveStoredInquiries([...inquiries]);
    return updated;
  },

  async deleteInquiry(id: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 80));
    const inquiries = getStoredInquiries();
    const filtered = inquiries.filter((i) => i.id !== id);
    saveStoredInquiries(filtered);
    return true;
  },

  async resetInquiries(): Promise<Inquiry[]> {
    saveStoredInquiries(INITIAL_INQUIRIES);
    return INITIAL_INQUIRIES;
  },
};
