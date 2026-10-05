/**
 * FOOTAZIX — Production Inquiry Service
 * 
 * Interacts directly with the Supabase `inquiries` table with Row Level Security (RLS).
 * - Anonymous / public visitors on ANY browser (Chrome, Safari, iOS, Instagram webview)
 *   perform a direct HTTPS INSERT into `inquiries`.
 * - Public visitors do NOT select / read back other people's inquiries (enforced by RLS).
 * - Authenticated admins in /secureadmin perform SELECT, UPDATE status, UPDATE notes, and DELETE.
 * - Zero dependency on localStorage, sessionStorage, cookies, or mock data for inquiry persistence.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Inquiry, InquiryStatus } from '../types';

type Listener = (inquiries: Inquiry[]) => void;
const listeners: Set<Listener> = new Set();
let cachedInquiries: Inquiry[] = [];

function notifyListeners(items: Inquiry[]) {
  cachedInquiries = items;
  listeners.forEach((fn) => {
    try {
      fn(items);
    } catch (err) {
      console.error('Error in inquiry listener:', err);
    }
  });
}

function mapRowToInquiry(row: any): Inquiry {
  let servicesArr: string[] = [];
  if (Array.isArray(row.service)) {
    servicesArr = row.service;
  } else if (typeof row.service === 'string') {
    servicesArr = row.service.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  return {
    id: row.id,
    name: row.name || 'Anonymous',
    email: row.email || '',
    phone: row.phone || undefined,
    company: row.company || undefined,
    services: servicesArr.length > 0 ? servicesArr : ['Video Editing'],
    details: row.project_details || '',
    budget: row.budget_range || undefined,
    status: (row.status as InquiryStatus) || 'new',
    notes: row.notes || undefined,
    createdAt: row.created_at
      ? row.created_at.replace('T', ' ').substring(0, 16)
      : new Date().toISOString().replace('T', ' ').substring(0, 16),
  };
}

export const inquiryService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    // Immediately emit current in-memory cache to new subscriber
    listener(cachedInquiries);
    return () => listeners.delete(listener);
  },

  /**
   * Get all inquiries from Supabase.
   * Only accessible to authenticated admins via Supabase RLS.
   */
  async getInquiries(): Promise<Inquiry[]> {
    if (!isSupabaseConfigured() || !supabase) {
      return cachedInquiries;
    }

    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Expected for unauthenticated public visitors due to strict RLS
        console.warn('Supabase inquiry fetch status (RLS enforced):', error.message);
        return cachedInquiries;
      }

      if (data) {
        const mapped = data.map(mapRowToInquiry);
        notifyListeners(mapped);
        return mapped;
      }
    } catch (err) {
      console.error('Failed fetching inquiries from Supabase:', err);
    }

    return cachedInquiries;
  },

  /**
   * Submit a new inquiry from ANY public visitor or device.
   * Direct HTTPS INSERT into Supabase `inquiries` table without relying on client sessions or cookies.
   * 
   * CRITICAL:
   * Do NOT chain `.select()` here. Public visitors have RLS permission to INSERT,
   * but NOT SELECT. Chaining `.select()` triggers a Postgres RLS violation and rolls back the INSERT!
   */
  async createInquiry(
    data: Omit<Inquiry, 'id' | 'status' | 'createdAt'>
  ): Promise<{ success: boolean }> {
    // 1. Rigorous Data Validation
    const name = data.name?.trim();
    const email = data.email?.trim().toLowerCase();
    const details = data.details?.trim();
    const services = Array.isArray(data.services) && data.services.length > 0
      ? data.services
      : ['Video Editing'];
    const budget = data.budget?.trim() || null;
    const phone = data.phone?.trim() || null;
    const company = data.company?.trim() || null;

    if (!name || name.length < 2) {
      throw new Error('Please enter your full name (minimum 2 characters).');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new Error('Please enter a valid email address.');
    }
    if (phone && !/^[\d\s+\-().]{6,25}$/.test(phone)) {
      throw new Error('Please enter a valid phone or WhatsApp number.');
    }
    if (!details || details.length < 5) {
      throw new Error('Please share a few details about your project (minimum 5 characters).');
    }

    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Database connection is not configured. Please contact footazix@gmail.com.');
    }

    // 2. Direct HTTPS insert to Supabase 'inquiries' table
    const { error, status } = await supabase
      .from('inquiries')
      .insert([
        {
          name,
          email,
          phone,
          company,
          service: services,
          project_details: details,
          budget_range: budget,
          status: 'new',
        },
      ]);

    if (error) {
      console.error('Supabase inquiry insert error:', error);
      throw new Error(error.message || 'Failed to submit inquiry to database. Please try again.');
    }

    if (status !== 201 && status !== 200) {
      throw new Error(`Unexpected server response code (${status}). Please try again.`);
    }

    return { success: true };
  },

  /**
   * Update inquiry workflow status (Admin only)
   */
  async updateInquiryStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase client is not available.');
    }

    const { data: updatedRow, error } = await supabase
      .from('inquiries')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed updating inquiry status in Supabase:', error);
      throw new Error(error.message);
    }

    const mapped = mapRowToInquiry(updatedRow);
    const updated = cachedInquiries.map((item) => (item.id === id ? mapped : item));
    notifyListeners(updated);
    return mapped;
  },

  /**
   * Update internal admin notes on an inquiry (Admin only)
   */
  async updateInquiryNotes(id: string, notes: string): Promise<Inquiry> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase client is not available.');
    }

    const { data: updatedRow, error } = await supabase
      .from('inquiries')
      .update({
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed updating inquiry notes in Supabase:', error);
      throw new Error(error.message);
    }

    const mapped = mapRowToInquiry(updatedRow);
    const updated = cachedInquiries.map((item) => (item.id === id ? mapped : item));
    notifyListeners(updated);
    return mapped;
  },

  /**
   * Delete an inquiry (Admin only)
   */
  async deleteInquiry(id: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase client is not available.');
    }

    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed deleting inquiry in Supabase:', error);
      throw new Error(error.message);
    }

    const updated = cachedInquiries.filter((item) => item.id !== id);
    notifyListeners(updated);
    return true;
  },

  /**
   * Reset in-memory cache
   */
  async resetInquiries(): Promise<Inquiry[]> {
    notifyListeners([]);
    return [];
  },
};
