/**
 * FOOTAZIX — Services Service
 * 
 * Clean abstraction for agency services.
 * Prepared for future Supabase table: `agency_services`
 */

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

export const servicesService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async getServices(): Promise<Service[]> {
    await new Promise((r) => setTimeout(r, 60));
    return getStoredServices().sort((a, b) => a.order - b.order);
  },

  async createService(data: Omit<Service, 'id'>): Promise<Service> {
    await new Promise((r) => setTimeout(r, 120));
    const services = getStoredServices();
    const newService: Service = {
      ...data,
      id: `srv-${Date.now()}`,
      order: services.length + 1,
    };
    const updated = [...services, newService];
    saveStoredServices(updated);
    return newService;
  },

  async updateService(id: string, updates: Partial<Service>): Promise<Service> {
    await new Promise((r) => setTimeout(r, 100));
    const services = getStoredServices();
    const index = services.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Service not found');
    const updated = { ...services[index], ...updates };
    services[index] = updated;
    saveStoredServices([...services]);
    return updated;
  },

  async deleteService(id: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 100));
    const services = getStoredServices();
    const filtered = services.filter((s) => s.id !== id);
    saveStoredServices(filtered);
    return true;
  },

  async reorderServices(orderedIds: string[]): Promise<Service[]> {
    await new Promise((r) => setTimeout(r, 80));
    const services = getStoredServices();
    const reordered = orderedIds
      .map((id, index) => {
        const found = services.find((s) => s.id === id);
        return found ? { ...found, order: index + 1 } : null;
      })
      .filter((s): s is Service => s !== null);

    saveStoredServices(reordered);
    return reordered;
  },

  async resetServices(): Promise<Service[]> {
    saveStoredServices(INITIAL_SERVICES);
    return INITIAL_SERVICES;
  },
};
