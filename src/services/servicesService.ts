/**
 * FOOTAZIX — Services Service
 * 
 * Interacts with Supabase `services` table with Row Level Security.
 * Public visitors view visible services; admins manage full catalog.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Service } from '../types';
import { INITIAL_SERVICES } from '../data/mockData';

const STORAGE_KEY = 'footazix_services';

type Listener = (services: Service[]) => void;
const listeners: Set<Listener> = new Set();

function getStoredServices(): Service[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_SERVICES;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed reading services from localStorage:', err);
    return INITIAL_SERVICES;
  }
}

function saveStoredServices(services: Service[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
    listeners.forEach((fn) => fn(services));
  } catch (err) {
    console.error('Failed saving services to localStorage:', err);
  }
}

function mapRowToService(row: any): Service {
  return {
    id: row.id,
    number: row.number,
    title: row.title,
    description: row.description,
    features: row.features || [],
    ctaText: row.cta_text || 'REQUEST THIS SERVICE →',
    highlighted: Boolean(row.highlighted),
    visible: row.visible ?? true,
    order: row.display_order ?? 1,
  };
}

export const servicesService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async getServices(): Promise<Service[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data) {
          const mapped = data.map(mapRowToService);
          saveStoredServices(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Failed fetching services from Supabase, using cache:', err);
      }
    }

    return getStoredServices().sort((a, b) => a.order - b.order);
  },

  async createService(data: Omit<Service, 'id'>): Promise<Service> {
    const services = getStoredServices();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from('services')
          .insert([
            {
              number: data.number,
              title: data.title,
              description: data.description,
              features: data.features,
              cta_text: data.ctaText,
              highlighted: data.highlighted,
              visible: data.visible,
              display_order: data.order || services.length + 1,
            },
          ])
          .select()
          .single();

        if (!error && inserted) {
          const newService = mapRowToService(inserted);
          const updated = [...services, newService];
          saveStoredServices(updated);
          return newService;
        }
      } catch (err) {
        console.error('Failed creating service in Supabase:', err);
      }
    }

    const fallbackService: Service = {
      ...data,
      id: `srv-${Date.now()}`,
      order: services.length + 1,
    };
    const updated = [...services, fallbackService];
    saveStoredServices(updated);
    return fallbackService;
  },

  async updateService(id: string, updates: Partial<Service>): Promise<Service> {
    const services = getStoredServices();
    const index = services.findIndex((s) => s.id === id);

    if (isSupabaseConfigured() && supabase) {
      try {
        const payload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (updates.number !== undefined) payload.number = updates.number;
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.features !== undefined) payload.features = updates.features;
        if (updates.ctaText !== undefined) payload.cta_text = updates.ctaText;
        if (updates.highlighted !== undefined) payload.highlighted = updates.highlighted;
        if (updates.visible !== undefined) payload.visible = updates.visible;
        if (updates.order !== undefined) payload.display_order = updates.order;

        const { data: updatedRow, error } = await supabase
          .from('services')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (!error && updatedRow) {
          const mapped = mapRowToService(updatedRow);
          if (index !== -1) {
            services[index] = mapped;
          }
          saveStoredServices([...services]);
          return mapped;
        }
      } catch (err) {
        console.error('Failed updating service in Supabase:', err);
      }
    }

    if (index === -1) throw new Error('Service not found');
    const updated = { ...services[index], ...updates };
    services[index] = updated;
    saveStoredServices([...services]);
    return updated;
  },

  async deleteService(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('services').delete().eq('id', id);
      } catch (err) {
        console.error('Failed deleting service in Supabase:', err);
      }
    }

    const services = getStoredServices();
    const filtered = services.filter((s) => s.id !== id);
    saveStoredServices(filtered);
    return true;
  },

  async reorderServices(orderedIds: string[]): Promise<Service[]> {
    const services = getStoredServices();
    const reordered = orderedIds
      .map((id, index) => {
        const found = services.find((s) => s.id === id);
        return found ? { ...found, order: index + 1 } : null;
      })
      .filter((s): s is Service => s !== null);

    saveStoredServices(reordered);

    if (isSupabaseConfigured() && supabase) {
      const client = supabase;
      try {
        await Promise.all(
          reordered.map((srv) =>
            client
              .from('services')
              .update({ display_order: srv.order })
              .eq('id', srv.id)
          )
        );
      } catch (err) {
        console.warn('Error syncing reordered services to Supabase:', err);
      }
    }

    return reordered;
  },

  async resetServices(): Promise<Service[]> {
    saveStoredServices(INITIAL_SERVICES);
    return INITIAL_SERVICES;
  },
};
