/**
 * FOOTAZIX — Portfolio Service
 * 
 * Interacts with Supabase `projects` table with Row Level Security.
 * Provides complete data flow from CMS → Supabase → Public Website.
 * Supabase is the single source of truth for all portfolio projects.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Project, AspectRatioType } from '../types';
import { INITIAL_PROJECTS } from '../data/mockData';

const STORAGE_KEY = 'footazix_portfolio_projects';

type Listener = (projects: Project[]) => void;
const listeners: Set<Listener> = new Set();
let memoryProjects: Project[] | null = null;

function getStoredProjects(): Project[] {
  if (memoryProjects && memoryProjects.length > 0) {
    return memoryProjects;
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        memoryProjects = JSON.parse(raw);
        return memoryProjects!;
      }
    }
  } catch (err) {
    console.warn('Failed reading projects cache:', err);
  }
  memoryProjects = INITIAL_PROJECTS;
  return INITIAL_PROJECTS;
}

function saveStoredProjects(projects: Project[]): void {
  memoryProjects = projects;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  } catch (err) {
    console.error('Failed saving projects to storage cache:', err);
  }
  listeners.forEach((fn) => fn(projects));
}

// Map database record to Project interface
function mapRowToProject(row: any): Project {
  // Normalize cover image if it has redundant prefix /https://
  let cover = row.cover_image || '';
  if (cover.startsWith('/http://') || cover.startsWith('/https://')) {
    cover = cover.substring(1);
  }

  return {
    id: String(row.id),
    title: row.title || 'Untitled Project',
    category: row.category || 'Reels',
    description: row.description || '',
    coverImage: cover || '/assets/portfolio/project-01/cover.jpg',
    videoUrl: row.video_url || undefined,
    projectUrl: row.project_url || undefined,
    client: row.client_name || undefined,
    displayOrder: Number(row.display_order ?? 1),
    status: (row.status === 'draft' ? 'draft' : 'published') as 'published' | 'draft',
    visible: row.visible !== false,
    videoAspectRatio: (row.video_aspect_ratio || '16:9') as AspectRatioType,
    thumbnailAspectRatio: (row.thumbnail_aspect_ratio || '16:9') as AspectRatioType,
    createdAt: row.created_at ? row.created_at.split('T')[0] : undefined,
  };
}

export interface SupabaseHealthStatus {
  connected: boolean;
  hasColumns: boolean;
  canManage: boolean;
  error?: string;
}

export const portfolioService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /**
   * Diagnostic check to verify Supabase projects table, columns and RLS readiness
   */
  async checkSupabaseStatus(): Promise<SupabaseHealthStatus> {
    if (!isSupabaseConfigured() || !supabase) {
      return { connected: false, hasColumns: false, canManage: false, error: 'Supabase URL/Key not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, video_aspect_ratio, thumbnail_aspect_ratio, visible')
        .limit(1);

      if (error) {
        if (error.code === '42703') {
          // Columns do not exist yet
          return { connected: true, hasColumns: false, canManage: false, error: 'Columns missing. Run the SQL migration in Supabase SQL editor.' };
        }
        return { connected: true, hasColumns: false, canManage: false, error: error.message };
      }

      return { connected: true, hasColumns: true, canManage: true };
    } catch (err: any) {
      return { connected: false, hasColumns: false, canManage: false, error: err?.message };
    }
  },

  async getProjects(): Promise<Project[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped = data.map(mapRowToProject);
          saveStoredProjects(mapped);
          return mapped;
        } else if (error) {
          console.warn('Supabase getProjects notice:', error.message);
        }
      } catch (err) {
        console.warn('Failed fetching projects from Supabase, using cache:', err);
      }
    }

    return getStoredProjects().sort((a, b) => a.displayOrder - b.displayOrder);
  },

  async getPublicProjects(): Promise<Project[]> {
    const all = await this.getProjects();
    return all.filter((p) => p.status === 'published' && p.visible !== false);
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
    const displayOrder = data.displayOrder ?? projects.length + 1;

    if (isSupabaseConfigured() && supabase) {
      // 1. Attempt insert with all extended columns
      const fullInsertPayload = {
        title: data.title,
        category: data.category,
        description: data.description,
        cover_image: data.coverImage,
        video_url: data.videoUrl || null,
        project_url: data.projectUrl || null,
        client_name: data.client || null,
        display_order: displayOrder,
        status: data.status || 'published',
        visible: data.visible !== false,
        video_aspect_ratio: data.videoAspectRatio || '16:9',
        thumbnail_aspect_ratio: data.thumbnailAspectRatio || '16:9',
      };

      try {
        const { data: inserted, error } = await supabase
          .from('projects')
          .insert([fullInsertPayload])
          .select()
          .single();

        if (!error && inserted) {
          const newProject = mapRowToProject(inserted);
          const updated = [...projects, newProject];
          saveStoredProjects(updated);
          return newProject;
        }

        // Handle specific Supabase schema error 42703 (missing columns if migration not run yet)
        if (error && error.code === '42703') {
          console.warn('Extended columns missing in projects table, falling back to base columns:', error.message);
          const baseInsertPayload = {
            title: data.title,
            category: data.category,
            description: data.description,
            cover_image: data.coverImage,
            video_url: data.videoUrl || null,
            client_name: data.client || null,
            display_order: displayOrder,
            status: data.status || 'published',
          };

          const { data: baseInserted, error: baseError } = await supabase
            .from('projects')
            .insert([baseInsertPayload])
            .select()
            .single();

          if (!baseError && baseInserted) {
            const newProject: Project = {
              ...mapRowToProject(baseInserted),
              visible: data.visible !== false,
              videoAspectRatio: data.videoAspectRatio || '16:9',
              thumbnailAspectRatio: data.thumbnailAspectRatio || '16:9',
              projectUrl: data.projectUrl || undefined,
            };
            const updated = [...projects, newProject];
            saveStoredProjects(updated);
            return newProject;
          } else if (baseError) {
            throw new Error(`Supabase Insert Error (${baseError.code}): ${baseError.message}`);
          }
        }

        if (error) {
          throw new Error(`Supabase Error (${error.code}): ${error.message}`);
        }
      } catch (err: any) {
        console.error('Failed to create project in Supabase:', err);
        throw err;
      }
    }

    // Fallback only if Supabase credentials are completely unconfigured
    const fallbackProject: Project = {
      ...data,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `proj-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      displayOrder,
      visible: data.visible !== false,
      videoAspectRatio: data.videoAspectRatio || '16:9',
      thumbnailAspectRatio: data.thumbnailAspectRatio || '16:9',
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
        const fullPayload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (updates.title !== undefined) fullPayload.title = updates.title;
        if (updates.category !== undefined) fullPayload.category = updates.category;
        if (updates.description !== undefined) fullPayload.description = updates.description;
        if (updates.coverImage !== undefined) fullPayload.cover_image = updates.coverImage;
        if (updates.videoUrl !== undefined) fullPayload.video_url = updates.videoUrl;
        if (updates.projectUrl !== undefined) fullPayload.project_url = updates.projectUrl;
        if (updates.client !== undefined) fullPayload.client_name = updates.client;
        if (updates.displayOrder !== undefined) fullPayload.display_order = updates.displayOrder;
        if (updates.status !== undefined) fullPayload.status = updates.status;
        if (updates.visible !== undefined) fullPayload.visible = updates.visible;
        if (updates.videoAspectRatio !== undefined) fullPayload.video_aspect_ratio = updates.videoAspectRatio;
        if (updates.thumbnailAspectRatio !== undefined) fullPayload.thumbnail_aspect_ratio = updates.thumbnailAspectRatio;

        const { data: updatedRow, error } = await supabase
          .from('projects')
          .update(fullPayload)
          .eq('id', id)
          .select()
          .maybeSingle();

        if (!error && updatedRow) {
          const mapped = mapRowToProject(updatedRow);
          if (index !== -1) {
            projects[index] = mapped;
          }
          saveStoredProjects([...projects]);
          return mapped;
        }

        // If error is missing column 42703, strip extended columns and retry
        if (error && error.code === '42703') {
          const basePayload: Record<string, any> = {
            updated_at: new Date().toISOString(),
          };
          if (updates.title !== undefined) basePayload.title = updates.title;
          if (updates.category !== undefined) basePayload.category = updates.category;
          if (updates.description !== undefined) basePayload.description = updates.description;
          if (updates.coverImage !== undefined) basePayload.cover_image = updates.coverImage;
          if (updates.videoUrl !== undefined) basePayload.video_url = updates.videoUrl;
          if (updates.client !== undefined) basePayload.client_name = updates.client;
          if (updates.displayOrder !== undefined) basePayload.display_order = updates.displayOrder;
          if (updates.status !== undefined) basePayload.status = updates.status;

          const { data: baseRow, error: baseErr } = await supabase
            .from('projects')
            .update(basePayload)
            .eq('id', id)
            .select()
            .maybeSingle();

          if (!baseErr && baseRow) {
            const mapped: Project = {
              ...mapRowToProject(baseRow),
              visible: updates.visible ?? projects[index]?.visible ?? true,
              videoAspectRatio: updates.videoAspectRatio ?? projects[index]?.videoAspectRatio ?? '16:9',
              thumbnailAspectRatio: updates.thumbnailAspectRatio ?? projects[index]?.thumbnailAspectRatio ?? '16:9',
              projectUrl: updates.projectUrl ?? projects[index]?.projectUrl,
            };
            if (index !== -1) {
              projects[index] = mapped;
            }
            saveStoredProjects([...projects]);
            return mapped;
          }
        }

        if (error) {
          throw new Error(`Supabase Update Error (${error.code}): ${error.message}`);
        }
      } catch (err: any) {
        console.error('Failed updating project in Supabase:', err);
        throw err;
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
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) {
          throw new Error(`Supabase Delete Error (${error.code}): ${error.message}`);
        }
      } catch (err) {
        console.error('Failed deleting project in Supabase:', err);
        throw err;
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
