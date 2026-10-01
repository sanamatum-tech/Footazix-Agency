/**
 * FOOTAZIX — Portfolio Service
 * 
 * Interacts with Supabase `projects` table with Row Level Security.
 * Public visitors can view published projects; admins can perform full CRUD.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Project } from '../types';
import { INITIAL_PROJECTS } from '../data/mockData';

const STORAGE_KEY = 'footazix_portfolio_projects';

type Listener = (projects: Project[]) => void;
const listeners: Set<Listener> = new Set();

function getStoredProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_PROJECTS;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed reading projects from localStorage:', err);
    return INITIAL_PROJECTS;
  }
}

function saveStoredProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    listeners.forEach((fn) => fn(projects));
  } catch (err) {
    console.error('Failed saving projects to localStorage:', err);
  }
}

// Map database record to Project interface
function mapRowToProject(row: any): Project {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    coverImage: row.cover_image,
    videoUrl: row.video_url || undefined,
    client: row.client_name || undefined,
    displayOrder: row.display_order ?? 1,
    status: row.status || 'published',
    createdAt: row.created_at ? row.created_at.split('T')[0] : undefined,
  };
}

export const portfolioService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async getProjects(): Promise<Project[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data) {
          const mapped = data.map(mapRowToProject);
          saveStoredProjects(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Failed fetching projects from Supabase, using cache:', err);
      }
    }

    return getStoredProjects().sort((a, b) => a.displayOrder - b.displayOrder);
  },

  async getProjectById(id: string): Promise<Project | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) return mapRowToProject(data);
      } catch (err) {
        console.warn('Failed fetching project by id from Supabase:', err);
      }
    }

    const projects = getStoredProjects();
    return projects.find((p) => p.id === id) || null;
  },

  async createProject(data: Omit<Project, 'id'>): Promise<Project> {
    const projects = getStoredProjects();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from('projects')
          .insert([
            {
              title: data.title,
              category: data.category,
              description: data.description,
              cover_image: data.coverImage,
              video_url: data.videoUrl || null,
              client_name: data.client || null,
              display_order: data.displayOrder || projects.length + 1,
              status: data.status || 'published',
            },
          ])
          .select()
          .single();

        if (!error && inserted) {
          const newProject = mapRowToProject(inserted);
          const updated = [...projects, newProject];
          saveStoredProjects(updated);
          return newProject;
        } else if (error) {
          console.error('Supabase project creation error:', error);
        }
      } catch (err) {
        console.error('Failed to create project in Supabase:', err);
      }
    }

    const fallbackProject: Project = {
      ...data,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      displayOrder: projects.length + 1,
    };
    const updated = [...projects, fallbackProject];
    saveStoredProjects(updated);
    return fallbackProject;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const projects = getStoredProjects();
    const index = projects.findIndex((p) => p.id === id);

    if (isSupabaseConfigured() && supabase) {
      try {
        const payload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.category !== undefined) payload.category = updates.category;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.coverImage !== undefined) payload.cover_image = updates.coverImage;
        if (updates.videoUrl !== undefined) payload.video_url = updates.videoUrl;
        if (updates.client !== undefined) payload.client_name = updates.client;
        if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
        if (updates.status !== undefined) payload.status = updates.status;

        const { data: updatedRow, error } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (!error && updatedRow) {
          const mapped = mapRowToProject(updatedRow);
          if (index !== -1) {
            projects[index] = mapped;
          }
          saveStoredProjects([...projects]);
          return mapped;
        }
      } catch (err) {
        console.error('Failed updating project in Supabase:', err);
      }
    }

    if (index === -1) throw new Error('Project not found');
    const updatedProject = { ...projects[index], ...updates };
    projects[index] = updatedProject;
    saveStoredProjects([...projects]);
    return updatedProject;
  },

  async deleteProject(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('projects').delete().eq('id', id);
      } catch (err) {
        console.error('Failed deleting project in Supabase:', err);
      }
    }

    const projects = getStoredProjects();
    const filtered = projects.filter((p) => p.id !== id);
    saveStoredProjects(filtered);
    return true;
  },

  async reorderProjects(orderedIds: string[]): Promise<Project[]> {
    const projects = getStoredProjects();
    const reordered = orderedIds
      .map((id, index) => {
        const found = projects.find((p) => p.id === id);
        return found ? { ...found, displayOrder: index + 1 } : null;
      })
      .filter((p): p is Project => p !== null);

    saveStoredProjects(reordered);

    if (isSupabaseConfigured() && supabase) {
      const client = supabase;
      try {
        await Promise.all(
          reordered.map((proj) =>
            client
              .from('projects')
              .update({ display_order: proj.displayOrder })
              .eq('id', proj.id)
          )
        );
      } catch (err) {
        console.warn('Error syncing reordered projects to Supabase:', err);
      }
    }

    return reordered;
  },

  async resetProjects(): Promise<Project[]> {
    saveStoredProjects(INITIAL_PROJECTS);
    return INITIAL_PROJECTS;
  },
};
