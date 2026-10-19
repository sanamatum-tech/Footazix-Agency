/**
-- ==============================================================================
-- FOOTAZIX — Client Portal Data & CMS Service
-- File: src/services/clientPortalService.ts
-- ==============================================================================
* 
* Complete persistence layer for:
* - Client accounts & customized navigation
* - Deliverables (Videos) with Google Drive link support
* - Client documents (PDFs, texts, briefs, reports)
* - Invoices with itemized line items
* - Agreements with version tracking
* - Feedback & admin replies
* - CMS-controlled feedback pop-ups & persistent prompt interactions
*/

import { supabase, isSupabaseConfigured, SUPABASE_STORAGE_BUCKET } from '../lib/supabase';
import {
  ClientAccount,
  ClientDeliverable,
  ClientDocument,
  ClientInvoice,
  ClientAgreement,
  ClientFeedback,
  ClientFeedbackPrompt,
  ClientPromptInteraction,
  ClientDashboardStats,
} from '../types/clientPortal';

// Seed demo client for local preview / graceful initialization
const DEMO_CLIENT: ClientAccount = {
  id: 'demo-client-01',
  email: 'client@footazix.site',
  full_name: 'Alex Vance',
  company_name: 'Vance Velocity Media',
  phone: '+1 (555) 234-5678',
  avatar_url: '/assets/founder.jpg',
  status: 'active',
  portal_title: 'Vance Velocity × Footazix Portal',
  welcome_message: 'Welcome back Alex. All your active video deliverables, agreements, and invoices are ready below.',
  announcement: 'Batch 4 reels are in final color grading. Check your deliverables below.',
  announcement_type: 'info',
  navigation_config: {
    overview: true,
    videos: true,
    documents: true,
    agreements: true,
    invoices: true,
    feedback: true,
    notifications: true,
    profile: true,
  },
  internal_notes: 'High-priority creator client. Monthly retainer: 12 short-form videos + 2 YouTube long cuts.',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Demo deliverable
const DEMO_DELIVERABLES: ClientDeliverable[] = [
  {
    id: 'deliv-01',
    client_id: 'demo-client-01',
    title: 'Short-Form Hook Cut: Retention Blueprint',
    description: 'Kinetic typography, custom sound design, and aggressive 0.8s cuts designed for Instagram Reels & TikTok.',
    thumbnail_url: '/assets/portfolio/project-01/cover.jpg',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-video-editor-working-on-his-computer-42861-large.mp4',
    category: 'Reels',
    delivery_date: new Date().toISOString().split('T')[0],
    status: 'awaiting_feedback',
    version_info: 'v2.1 Final Polish',
    delivery_notes: 'Added sound sweep at 0:04 and adjusted contrast in the b-roll sequence.',
    published: true,
    is_private: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'deliv-02',
    client_id: 'demo-client-01',
    title: 'Podcast Highlights Reel: Episode 42',
    description: 'Talking head with animated zoom-ins, captions, and color-graded highlights.',
    thumbnail_url: '/assets/vsl/vsl-poster.jpg',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-video-editor-working-on-his-computer-42861-large.mp4',
    category: 'Shorts',
    delivery_date: new Date().toISOString().split('T')[0],
    status: 'delivered',
    version_info: 'v1.0 Approved',
    delivery_notes: 'Approved for distribution across YouTube Shorts.',
    published: true,
    is_private: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Fallback in-memory stores for resilience
let localClients: ClientAccount[] = [DEMO_CLIENT];
let localDeliverables: ClientDeliverable[] = [...DEMO_DELIVERABLES];
let localDocuments: ClientDocument[] = [];
let localInvoices: ClientInvoice[] = [];
let localAgreements: ClientAgreement[] = [];
let localFeedback: ClientFeedback[] = [];
let localPrompts: ClientFeedbackPrompt[] = [];
let localInteractions: ClientPromptInteraction[] = [];

export const clientPortalService = {
  // ============================================================================
  // CLIENT ACCOUNTS (ADMIN CMS)
  // ============================================================================

  async getAllClients(): Promise<ClientAccount[]> {
    if (!isSupabaseConfigured() || !supabase) {
      return localClients;
    }

    try {
      const { data, error } = await supabase
        .from('client_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Fetch clients notice (falling back):', error.message);
        return localClients;
      }

      if (data && data.length > 0) {
        localClients = data;
        return data;
      }
      return localClients;
    } catch {
      return localClients;
    }
  },

  async getClientById(id: string): Promise<ClientAccount | null> {
    if (!isSupabaseConfigured() || !supabase) {
      return localClients.find((c) => c.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('client_accounts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        return localClients.find((c) => c.id === id) || null;
      }
      return data;
    } catch {
      return localClients.find((c) => c.id === id) || null;
    }
  },

  async createClientAccount(clientData: Partial<ClientAccount>): Promise<ClientAccount | null> {
    const cleanEmail = (clientData.email || '').trim().toLowerCase();
    if (!cleanEmail) throw new Error('Client email is required.');

    const newRecord: Partial<ClientAccount> = {
      email: cleanEmail,
      full_name: clientData.full_name?.trim() || 'New Client',
      company_name: clientData.company_name?.trim() || null,
      phone: clientData.phone?.trim() || null,
      avatar_url: clientData.avatar_url || null,
      status: clientData.status || 'active',
      portal_title: clientData.portal_title?.trim() || `${clientData.company_name || clientData.full_name || 'Client'} × Footazix Portal`,
      welcome_message: clientData.welcome_message?.trim() || 'Welcome to your private deliverables and project portal.',
      announcement: clientData.announcement || null,
      announcement_type: clientData.announcement_type || 'info',
      navigation_config: clientData.navigation_config || {
        overview: true,
        videos: true,
        documents: true,
        agreements: true,
        invoices: true,
        feedback: true,
        notifications: true,
        profile: true,
      },
      internal_notes: clientData.internal_notes || null,
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('client_accounts')
          .insert(newRecord)
          .select()
          .single();

        if (error) throw error;
        localClients.unshift(data);
        return data;
      } catch (err: any) {
        console.warn('Supabase insert client failed, using local fallback:', err.message);
      }
    }

    const fallback: ClientAccount = {
      ...(newRecord as any),
      id: `client-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localClients.unshift(fallback);
    return fallback;
  },

  async updateClientAccount(id: string, updates: Partial<ClientAccount>): Promise<boolean> {
    const cleanUpdates = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('client_accounts')
          .update(cleanUpdates)
          .eq('id', id);

        if (!error) {
          const idx = localClients.findIndex((c) => c.id === id);
          if (idx !== -1) localClients[idx] = { ...localClients[idx], ...cleanUpdates };
          return true;
        }
      } catch (err) {
        console.warn('Supabase update client error:', err);
      }
    }

    const idx = localClients.findIndex((c) => c.id === id);
    if (idx !== -1) {
      localClients[idx] = { ...localClients[idx], ...cleanUpdates };
      return true;
    }
    return false;
  },

  async deleteClientAccount(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from('client_accounts').delete().eq('id', id);
        if (!error) {
          localClients = localClients.filter((c) => c.id !== id);
          return true;
        }
      } catch (err) {
        console.warn('Supabase delete client error:', err);
      }
    }

    localClients = localClients.filter((c) => c.id !== id);
    return true;
  },

  // ============================================================================
  // CLIENT DELIVERABLES (VIDEOS)
  // ============================================================================

  async getDeliverablesByClient(clientId: string, onlyPublished: boolean = false): Promise<ClientDeliverable[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase
          .from('client_deliverables')
          .select('*')
          .eq('client_id', clientId)
          .order('delivery_date', { ascending: false });

        if (onlyPublished) {
          query = query.eq('published', true);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase fetch deliverables warning:', err);
      }
    }

    return localDeliverables.filter(
      (d) => d.client_id === clientId && (!onlyPublished || d.published)
    );
  },

  async createDeliverable(data: Omit<ClientDeliverable, 'id' | 'created_at' | 'updated_at'>): Promise<ClientDeliverable | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: record, error } = await supabase
          .from('client_deliverables')
          .insert(data)
          .select()
          .single();

        if (!error && record) {
          localDeliverables.unshift(record);
          return record;
        }
      } catch (err) {
        console.warn('Supabase create deliverable error:', err);
      }
    }

    const fallback: ClientDeliverable = {
      ...data,
      id: `deliv-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localDeliverables.unshift(fallback);
    return fallback;
  },

  async updateDeliverable(id: string, updates: Partial<ClientDeliverable>): Promise<boolean> {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('client_deliverables')
          .update(cleanUpdates)
          .eq('id', id);

        if (!error) {
          const idx = localDeliverables.findIndex((d) => d.id === id);
          if (idx !== -1) localDeliverables[idx] = { ...localDeliverables[idx], ...cleanUpdates };
          return true;
        }
      } catch (err) {
        console.warn('Supabase update deliverable error:', err);
      }
    }

    const idx = localDeliverables.findIndex((d) => d.id === id);
    if (idx !== -1) {
      localDeliverables[idx] = { ...localDeliverables[idx], ...cleanUpdates };
      return true;
    }
    return false;
  },

  async deleteDeliverable(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from('client_deliverables').delete().eq('id', id);
        if (!error) {
          localDeliverables = localDeliverables.filter((d) => d.id !== id);
          return true;
        }
      } catch (err) {
        console.warn('Supabase delete deliverable error:', err);
      }
    }

    localDeliverables = localDeliverables.filter((d) => d.id !== id);
    return true;
  },

  // ============================================================================
  // CLIENT DOCUMENTS
  // ============================================================================

  async getDocumentsByClient(clientId: string, onlyPublished: boolean = false): Promise<ClientDocument[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase
          .from('client_documents')
          .select('*')
          .eq('client_id', clientId)
          .order('issue_date', { ascending: false });

        if (onlyPublished) {
          query = query.eq('published', true);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase fetch documents warning:', err);
      }
    }

    return localDocuments.filter((d) => d.client_id === clientId && (!onlyPublished || d.published));
  },

  async createDocument(data: Omit<ClientDocument, 'id' | 'created_at' | 'updated_at'>): Promise<ClientDocument | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: record, error } = await supabase
          .from('client_documents')
          .insert(data)
          .select()
          .single();

        if (!error && record) {
          localDocuments.unshift(record);
          return record;
        }
      } catch (err) {
        console.warn('Supabase create document error:', err);
      }
    }

    const fallback: ClientDocument = {
      ...data,
      id: `doc-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localDocuments.unshift(fallback);
    return fallback;
  },

  async updateDocument(id: string, updates: Partial<ClientDocument>): Promise<boolean> {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('client_documents')
          .update(cleanUpdates)
          .eq('id', id);

        if (!error) {
          const idx = localDocuments.findIndex((d) => d.id === id);
          if (idx !== -1) localDocuments[idx] = { ...localDocuments[idx], ...cleanUpdates };
          return true;
        }
      } catch (err) {
        console.warn('Supabase update document error:', err);
      }
    }

    const idx = localDocuments.findIndex((d) => d.id === id);
    if (idx !== -1) {
      localDocuments[idx] = { ...localDocuments[idx], ...cleanUpdates };
      return true;
    }
    return false;
  },

  async deleteDocument(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from('client_documents').delete().eq('id', id);
        if (!error) {
          localDocuments = localDocuments.filter((d) => d.id !== id);
          return true;
        }
      } catch (err) {
        console.warn('Supabase delete document error:', err);
      }
    }

    localDocuments = localDocuments.filter((d) => d.id !== id);
    return true;
  },

  // ============================================================================
  // CLIENT INVOICES
  // ============================================================================

  async getInvoicesByClient(clientId: string): Promise<ClientInvoice[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('client_invoices')
          .select('*')
          .eq('client_id', clientId)
          .order('issue_date', { ascending: false });

        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase fetch invoices warning:', err);
      }
    }

    return localInvoices.filter((i) => i.client_id === clientId);
  },

  async createInvoice(data: Omit<ClientInvoice, 'id' | 'created_at' | 'updated_at'>): Promise<ClientInvoice | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: record, error } = await supabase
          .from('client_invoices')
          .insert(data)
          .select()
          .single();

        if (!error && record) {
          localInvoices.unshift(record);
          return record;
        }
      } catch (err) {
        console.warn('Supabase create invoice error:', err);
      }
    }

    const fallback: ClientInvoice = {
      ...data,
      id: `inv-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localInvoices.unshift(fallback);
    return fallback;
  },

  async updateInvoice(id: string, updates: Partial<ClientInvoice>): Promise<boolean> {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('client_invoices')
          .update(cleanUpdates)
          .eq('id', id);

        if (!error) {
          const idx = localInvoices.findIndex((i) => i.id === id);
          if (idx !== -1) localInvoices[idx] = { ...localInvoices[idx], ...cleanUpdates };
          return true;
        }
      } catch (err) {
        console.warn('Supabase update invoice error:', err);
      }
    }

    const idx = localInvoices.findIndex((i) => i.id === id);
    if (idx !== -1) {
      localInvoices[idx] = { ...localInvoices[idx], ...cleanUpdates };
      return true;
    }
    return false;
  },

  async deleteInvoice(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from('client_invoices').delete().eq('id', id);
        if (!error) {
          localInvoices = localInvoices.filter((i) => i.id !== id);
          return true;
        }
      } catch (err) {
        console.warn('Supabase delete invoice error:', err);
      }
    }

    localInvoices = localInvoices.filter((i) => i.id !== id);
    return true;
  },

  // ============================================================================
  // CLIENT AGREEMENTS
  // ============================================================================

  async getAgreementsByClient(clientId: string): Promise<ClientAgreement[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('client_agreements')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });

        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase fetch agreements warning:', err);
      }
    }

    return localAgreements.filter((a) => a.client_id === clientId);
  },

  async createAgreement(data: Omit<ClientAgreement, 'id' | 'created_at' | 'updated_at'>): Promise<ClientAgreement | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: record, error } = await supabase
          .from('client_agreements')
          .insert(data)
          .select()
          .single();

        if (!error && record) {
          localAgreements.unshift(record);
          return record;
        }
      } catch (err) {
        console.warn('Supabase create agreement error:', err);
      }
    }

    const fallback: ClientAgreement = {
      ...data,
      id: `agree-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localAgreements.unshift(fallback);
    return fallback;
  },

  async updateAgreement(id: string, updates: Partial<ClientAgreement>): Promise<boolean> {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('client_agreements')
          .update(cleanUpdates)
          .eq('id', id);

        if (!error) {
          const idx = localAgreements.findIndex((a) => a.id === id);
          if (idx !== -1) localAgreements[idx] = { ...localAgreements[idx], ...cleanUpdates };
          return true;
        }
      } catch (err) {
        console.warn('Supabase update agreement error:', err);
      }
    }

    const idx = localAgreements.findIndex((a) => a.id === id);
    if (idx !== -1) {
      localAgreements[idx] = { ...localAgreements[idx], ...cleanUpdates };
      return true;
    }
    return false;
  },

  async deleteAgreement(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from('client_agreements').delete().eq('id', id);
        if (!error) {
          localAgreements = localAgreements.filter((a) => a.id !== id);
          return true;
        }
      } catch (err) {
        console.warn('Supabase delete agreement error:', err);
      }
    }

    localAgreements = localAgreements.filter((a) => a.id !== id);
    return true;
  },

  // ============================================================================
  // FEEDBACK & RESPONSES
  // ============================================================================

  async getFeedback(clientId?: string): Promise<ClientFeedback[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase
          .from('client_feedback')
          .select(`
            *,
            client_deliverables (
              title
            )
          `)
          .order('created_at', { ascending: false });

        if (clientId) {
          query = query.eq('client_id', clientId);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map((item: any) => ({
            ...item,
            deliverable_title: item.client_deliverables?.title,
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch feedback warning:', err);
      }
    }

    return clientId
      ? localFeedback.filter((f) => f.client_id === clientId)
      : localFeedback;
  },

  async submitFeedback(data: {
    client_id: string;
    deliverable_id?: string | null;
    category: ClientFeedback['category'];
    message: string;
    reference_link?: string | null;
    attachment_url?: string | null;
  }): Promise<ClientFeedback | null> {
    const newFeedback: Omit<ClientFeedback, 'id' | 'created_at' | 'updated_at'> = {
      ...data,
      status: 'SUBMITTED',
      admin_response: null,
      resolution_notes: null,
      resolved_at: null,
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: record, error } = await supabase
          .from('client_feedback')
          .insert(newFeedback)
          .select()
          .single();

        if (!error && record) {
          localFeedback.unshift(record);
          return record;
        }
      } catch (err) {
        console.warn('Supabase submit feedback error:', err);
      }
    }

    const fallback: ClientFeedback = {
      ...newFeedback,
      id: `fb-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localFeedback.unshift(fallback);
    return fallback;
  },

  async updateFeedbackStatus(
    id: string,
    status: ClientFeedback['status'],
    admin_response?: string | null,
    resolution_notes?: string | null
  ): Promise<boolean> {
    const updates: Partial<ClientFeedback> = {
      status,
      admin_response,
      resolution_notes,
      resolved_at: status === 'RESOLVED' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('client_feedback')
          .update(updates)
          .eq('id', id);

        if (!error) {
          const idx = localFeedback.findIndex((f) => f.id === id);
          if (idx !== -1) localFeedback[idx] = { ...localFeedback[idx], ...updates };
          return true;
        }
      } catch (err) {
        console.warn('Supabase update feedback error:', err);
      }
    }

    const idx = localFeedback.findIndex((f) => f.id === id);
    if (idx !== -1) {
      localFeedback[idx] = { ...localFeedback[idx], ...updates };
      return true;
    }
    return false;
  },

  // ============================================================================
  // FEEDBACK PROMPTS (CMS POP-UPS)
  // ============================================================================

  async getAllPrompts(): Promise<ClientFeedbackPrompt[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('client_feedback_prompts')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase fetch prompts warning:', err);
      }
    }
    return localPrompts;
  },

  async createPrompt(prompt: Omit<ClientFeedbackPrompt, 'id' | 'created_at' | 'updated_at'>): Promise<ClientFeedbackPrompt | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: record, error } = await supabase
          .from('client_feedback_prompts')
          .insert(prompt)
          .select()
          .single();

        if (!error && record) {
          localPrompts.unshift(record);
          return record;
        }
      } catch (err) {
        console.warn('Supabase create prompt error:', err);
      }
    }

    const fallback: ClientFeedbackPrompt = {
      ...prompt,
      id: `prompt-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localPrompts.unshift(fallback);
    return fallback;
  },

  async updatePrompt(id: string, updates: Partial<ClientFeedbackPrompt>): Promise<boolean> {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('client_feedback_prompts')
          .update(cleanUpdates)
          .eq('id', id);

        if (!error) {
          const idx = localPrompts.findIndex((p) => p.id === id);
          if (idx !== -1) localPrompts[idx] = { ...localPrompts[idx], ...cleanUpdates };
          return true;
        }
      } catch (err) {
        console.warn('Supabase update prompt error:', err);
      }
    }

    const idx = localPrompts.findIndex((p) => p.id === id);
    if (idx !== -1) {
      localPrompts[idx] = { ...localPrompts[idx], ...cleanUpdates };
      return true;
    }
    return false;
  },

  async deletePrompt(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from('client_feedback_prompts').delete().eq('id', id);
        if (!error) {
          localPrompts = localPrompts.filter((p) => p.id !== id);
          return true;
        }
      } catch (err) {
        console.warn('Supabase delete prompt error:', err);
      }
    }

    localPrompts = localPrompts.filter((p) => p.id !== id);
    return true;
  },

  /**
   * Check if there's an active prompt targeted for this client that hasn't been dismissed/completed
   */
  async getActivePromptForClient(clientId: string): Promise<ClientFeedbackPrompt | null> {
    const now = new Date().toISOString().split('T')[0];

    if (isSupabaseConfigured() && supabase) {
      try {
        // 1. Fetch interactions for this client
        const { data: interactions } = await supabase
          .from('client_prompt_interactions')
          .select('prompt_id, dismissed, completed')
          .eq('client_id', clientId);

        const inactivePromptIds = new Set(
          (interactions || [])
            .filter((i) => i.dismissed || i.completed)
            .map((i) => i.prompt_id)
        );

        // 2. Fetch active prompts
        const { data: prompts } = await supabase
          .from('client_feedback_prompts')
          .select('*')
          .eq('is_enabled', true);

        if (prompts && prompts.length > 0) {
          const match = prompts.find((p) => {
            if (inactivePromptIds.has(p.id)) return false;
            if (p.start_date && p.start_date > now) return false;
            if (p.end_date && p.end_date < now) return false;
            if (p.target_client_ids && p.target_client_ids.length > 0) {
              return p.target_client_ids.includes(clientId);
            }
            return true;
          });
          return match || null;
        }
      } catch (err) {
        console.warn('Error fetching active prompt for client:', err);
      }
    }

    // Local fallback check
    const match = localPrompts.find((p) => {
      if (!p.is_enabled) return false;
      const interaction = localInteractions.find((i) => i.prompt_id === p.id && i.client_id === clientId);
      if (interaction && (interaction.dismissed || interaction.completed)) return false;
      if (p.target_client_ids && p.target_client_ids.length > 0 && !p.target_client_ids.includes(clientId)) {
        return false;
      }
      return true;
    });
    return match || null;
  },

  async recordPromptInteraction(
    promptId: string,
    clientId: string,
    action: 'dismiss' | 'complete',
    feedbackId?: string
  ): Promise<boolean> {
    const record = {
      prompt_id: promptId,
      client_id: clientId,
      dismissed: action === 'dismiss',
      completed: action === 'complete',
      dismissed_at: action === 'dismiss' ? new Date().toISOString() : null,
      completed_at: action === 'complete' ? new Date().toISOString() : null,
      feedback_id: feedbackId || null,
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('client_prompt_interactions')
          .upsert(record, { onConflict: 'prompt_id,client_id' });

        if (!error) return true;
      } catch (err) {
        console.warn('Supabase upsert prompt interaction error:', err);
      }
    }

    const idx = localInteractions.findIndex((i) => i.prompt_id === promptId && i.client_id === clientId);
    if (idx !== -1) {
      localInteractions[idx] = { ...localInteractions[idx], ...record } as ClientPromptInteraction;
    } else {
      localInteractions.push({ ...record, id: `interact-${Date.now()}`, created_at: new Date().toISOString() } as ClientPromptInteraction);
    }
    return true;
  },

  // ============================================================================
  // CLIENT DASHBOARD REAL STATS
  // ============================================================================

  async getDashboardStats(clientId: string): Promise<ClientDashboardStats> {
    const [deliverables, documents, invoices, feedback] = await Promise.all([
      this.getDeliverablesByClient(clientId, true),
      this.getDocumentsByClient(clientId, true),
      this.getInvoicesByClient(clientId),
      this.getFeedback(clientId),
    ]);

    const deliveredVideos = deliverables.filter((d) => d.status === 'delivered' || d.status === 'approved').length;
    const inProgressVideos = deliverables.filter((d) => d.status === 'in_progress').length;
    const awaitingFeedbackVideos = deliverables.filter((d) => d.status === 'awaiting_feedback').length;
    const outstandingInvoices = invoices.filter((i) => i.payment_status === 'ISSUED' || i.payment_status === 'OVERDUE').length;
    const unresolvedFeedbackCount = feedback.filter((f) => f.status === 'SUBMITTED' || f.status === 'UNDER REVIEW').length;

    return {
      totalVideos: deliverables.length,
      deliveredVideos,
      inProgressVideos,
      awaitingFeedbackVideos,
      pendingDeliverables: inProgressVideos + awaitingFeedbackVideos,
      availableDocuments: documents.length,
      outstandingInvoices,
      unresolvedFeedbackCount,
    };
  },

  // ============================================================================
  // ASSET UPLOAD HELPER
  // ============================================================================

  async uploadClientFile(
    file: File,
    clientId: string,
    subfolder: 'deliverables' | 'documents' | 'invoices' | 'agreements' | 'avatars'
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        success: true,
        url: URL.createObjectURL(file),
      };
    }

    try {
      const ext = file.name.split('.').pop();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `clients/${clientId}/${subfolder}/${Date.now()}_${sanitizedName}`;

      const { data, error } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      const { data: publicUrlData } = supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .getPublicUrl(data.path);

      return {
        success: true,
        url: publicUrlData.publicUrl,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'File upload failed.',
      };
    }
  },
};
