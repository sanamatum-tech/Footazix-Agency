/**
 * FOOTAZIX — Inquiry Service
 * 
 * Interacts with Supabase `inquiries` table with Row Level Security.
 * - Anonymous / public visitors can INSERT new inquiries.
 * - Only authenticated admins can SELECT, UPDATE status, or DELETE inquiries.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
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

function mapRowToInquiry(row: any): Inquiry {
  // Handle services whether stored as PostgreSQL array or string
  let servicesArr: string[] = [];
  if (Array.isArray(row.service)) {
    servicesArr = row.service;
  } else if (typeof row.service === 'string') {
    servicesArr = row.service.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || undefined,
    company: row.company || undefined,
    services: servicesArr,
    details: row.project_details || '',
    budget: row.budget_range || undefined,
    status: row.status || 'new',
    notes: row.notes || undefined,
    createdAt: row.created_at
      ? row.created_at.replace('T', ' ').substring(0, 16)
      : new Date().toISOString().replace('T', ' ').substring(0, 16),
  };
}

export const inquiryService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async getInquiries(): Promise<Inquiry[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped = data.map(mapRowToInquiry);
          saveStoredInquiries(mapped);
          return mapped;
        } else if (error) {
          console.warn('Supabase inquiry fetch message (expected for unauthenticated public):', error.message);
        }
      } catch (err) {
        console.warn('Error fetching inquiries from Supabase, using cache:', err);
      }
    }

    return getStoredInquiries();
  },

  async createInquiry(
    data: Omit<Inquiry, 'id' | 'status' | 'createdAt'>
  ): Promise<Inquiry> {
    const inquiries = getStoredInquiries();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from('inquiries')
          .insert([
            {
              name: data.name,
              email: data.email,
              phone: data.phone || null,
              company: data.company || null,
              service: data.services || [],
              project_details: data.details,
              budget_range: data.budget || null,
              status: 'new',
            },
          ])
          .select()
          .maybeSingle();

        if (!error && inserted) {
          const newInq = mapRowToInquiry(inserted);
          const updated = [newInq, ...inquiries];
          saveStoredInquiries(updated);
          return newInq;
        } else if (error) {
          console.error('Supabase inquiry submission error:', error);
          // If select failed due to RLS (public insert allowed, but public select disallowed),
          // synthesize successful inquiry record:
          const fallbackAfterInsert: Inquiry = {
            ...data,
            id: `inq-sub-${Date.now()}`,
            status: 'new',
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          };
          const updated = [fallbackAfterInsert, ...inquiries];
          saveStoredInquiries(updated);
          return fallbackAfterInsert;
        }
      } catch (err) {
        console.error('Failed submitting inquiry to Supabase:', err);
      }
    }

    const fallbackInquiry: Inquiry = {
      ...data,
      id: `inq-${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    const updated = [fallbackInquiry, ...inquiries];
    saveStoredInquiries(updated);
    return fallbackInquiry;
  },

  async updateInquiryStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
    const inquiries = getStoredInquiries();
    const index = inquiries.findIndex((i) => i.id === id);

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: updatedRow, error } = await supabase
          .from('inquiries')
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (!error && updatedRow) {
          const mapped = mapRowToInquiry(updatedRow);
          if (index !== -1) {
            inquiries[index] = mapped;
          }
          saveStoredInquiries([...inquiries]);
          return mapped;
        }
      } catch (err) {
        console.error('Failed updating inquiry status in Supabase:', err);
      }
    }

    if (index === -1) throw new Error('Inquiry not found');
    const updated = { ...inquiries[index], status };
    inquiries[index] = updated;
    saveStoredInquiries([...inquiries]);
    return updated;
  },

  async updateInquiryNotes(id: string, notes: string): Promise<Inquiry> {
    const inquiries = getStoredInquiries();
    const index = inquiries.findIndex((i) => i.id === id);

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: updatedRow, error } = await supabase
          .from('inquiries')
          .update({
            notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (!error && updatedRow) {
          const mapped = mapRowToInquiry(updatedRow);
          if (index !== -1) {
            inquiries[index] = mapped;
          }
          saveStoredInquiries([...inquiries]);
          return mapped;
        }
      } catch (err) {
        console.error('Failed updating inquiry notes in Supabase:', err);
      }
    }

    if (index === -1) throw new Error('Inquiry not found');
    const updated = { ...inquiries[index], notes };
    inquiries[index] = updated;
    saveStoredInquiries([...inquiries]);
    return updated;
  },

  async deleteInquiry(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('inquiries').delete().eq('id', id);
      } catch (err) {
        console.error('Failed deleting inquiry in Supabase:', err);
      }
    }

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
