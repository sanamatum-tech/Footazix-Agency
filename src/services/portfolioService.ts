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
const METADATA_REGEX = /<!--aspect:(\{[^}]+\})-->/;

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

function extractMetadata(description?: string): {
  cleanDescription: string;
  videoAspectRatio?: AspectRatioType;
  thumbnailAspectRatio?: AspectRatioType;
  visible?: boolean;
  projectUrl?: string;
} {
  if (!description) return { cleanDescription: '' };
  const match = description.match(METADATA_REGEX);
  if (!match) return { cleanDescription: description };
  try {
    const parsed = JSON.parse(match[1]);
    const cleanDescription = description.replace(match[0], '').trim();
    return {
      cleanDescription,
      videoAspectRatio: parsed.video,
      thumbnailAspectRatio: parsed.thumb,
      visible: parsed.vis,
      projectUrl: parsed.url,
    };
  } catch {
    return { cleanDescription: description };
  }
}

function injectMetadata(
  description: string,
  meta: {
    videoAspectRatio?: AspectRatioType;
    thumbnailAspectRatio?: AspectRatioType;
    visible?: boolean;
    projectUrl?: string;
  }
): string {
  const clean = (description || '').replace(METADATA_REGEX, '').trim();
  const metaObj: any = {};
  if (meta.videoAspectRatio) metaObj.video = meta.videoAspectRatio;
  if (meta.thumbnailAspectRatio) metaObj.thumb = meta.thumbnailAspectRatio;
  if (meta.visible !== undefined) metaObj.vis = meta.visible;
  if (meta.projectUrl) metaObj.url = meta.projectUrl;
  return `${clean} <!--aspect:${JSON.stringify(metaObj)}-->`;
}

// Map database record to Project interface
function mapRowToProject(row: any): Project {
  // Normalize cover image if it has redundant prefix /https://
  let cover = row.cover_image || '';
  if (cover.startsWith('/http://') || cover.startsWith('/https://')) {
    cover = cover.substring(1);
  }

  const meta = extractMetadata(row.description);
  const isVertical = row.category === 'Reels' || row.category === 'Shorts';
  const defaultRatio: AspectRatioType = isVertical ? '9:16' : '16:9';

  return {
    id: String(row.id),
    title: row.title || 'Untitled Project',
    category: row.category || 'Reels',
    description: meta.cleanDescription,
    coverImage: cover || '/assets/portfolio/project-01/cover.jpg',
    videoUrl: row.video_url || undefined,
    projectUrl: row.project_url || meta.projectUrl || undefined,
    client: row.client_name || undefined,
    displayOrder: Number(row.display_order ?? 1),
    status: (row.status === 'draft' ? 'draft' : 'published') as 'published' | 'draft',
    visible: row.visible !== undefined ? Boolean(row.visible) : (meta.visible !== undefined ? Boolean(meta.visible) : true),
    videoAspectRatio: (row.video_aspect_ratio || meta.videoAspectRatio || defaultRatio) as AspectRatioType,
    thumbnailAspectRatio: (row.thumbnail_aspect_ratio || meta.thumbnailAspectRatio || defaultRatio) as AspectRatioType,
    createdAt: row.created_at ? row.created_at.split('T')[0] : undefined,
  };
}

export interface SupabaseHealthStatus {
  connected: boolean;
  hasColumns: boolean;
  canManage: boolean;
  error?: string;
  hasVideoAspect?: boolean;
  hasThumbAspect?: boolean;
}

interface SchemaCapabilities {
  video_aspect_ratio: boolean;
  thumbnail_aspect_ratio: boolean;
  visible: boolean;
  project_url: boolean;
  checkedAt: number;
}

let cachedCapabilities: SchemaCapabilities | null = null;

async function getCapabilities(forceRefresh: boolean = false): Promise<SchemaCapabilities> {
  const now = Date.now();
  if (!forceRefresh && cachedCapabilities && (now - cachedCapabilities.checkedAt < 60000)) {
    return cachedCapabilities;
  }
  if (!isSupabaseConfigured() || !supabase) {
    return {
      video_aspect_ratio: false,
      thumbnail_aspect_ratio: false,
      visible: false,
      project_url: false,
      checkedAt: now,
    };
  }

  try {
    const [vRes, tRes, visRes, urlRes] = await Promise.all([
      supabase.from('projects').select('video_aspect_ratio').limit(0),
      supabase.from('projects').select('thumbnail_aspect_ratio').limit(0),
      supabase.from('projects').select('visible').limit(0),
      supabase.from('projects').select('project_url').limit(0),
    ]);

    cachedCapabilities = {
      video_aspect_ratio: !vRes.error,
      thumbnail_aspect_ratio: !tRes.error,
      visible: !visRes.error,
      project_url: !urlRes.error,
      checkedAt: now,
    };
  } catch (err) {
    console.warn('Capability probe notice:', err);
    cachedCapabilities = {
      video_aspect_ratio: false,
      thumbnail_aspect_ratio: false,
      visible: false,
      project_url: false,
      checkedAt: now,
    };
  }

  return cachedCapabilities;
}

export const portfolioService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /**
   * Diagnostic check to verify Supabase projects table connection and column readiness
   * NEVER throws or displays unhandled PGRST204 errors
   */
  async checkSupabaseStatus(forceRefresh: boolean = false): Promise<SupabaseHealthStatus> {
    if (!isSupabaseConfigured() || !supabase) {
      return { connected: false, hasColumns: false, canManage: false, error: 'Supabase URL/Key not configured' };
    }

    try {
      const caps = await getCapabilities(forceRefresh);

      // Verify general connectivity via limit(1)
      const { error } = await supabase
        .from('projects')
        .select('*')
        .limit(1);

      if (error) {
        return { connected: false, hasColumns: false, canManage: false, error: error.message };
      }

      const hasColumns = caps.video_aspect_ratio && caps.thumbnail_aspect_ratio;

      return {
        connected: true,
        hasColumns,
        hasVideoAspect: caps.video_aspect_ratio,
        hasThumbAspect: caps.thumbnail_aspect_ratio,
        canManage: true,
      };
    } catch (err: any) {
      return { connected: false, hasColumns: false, canManage: false, error: err?.message };
    }
  },

  /**
   * Force reload schema capabilities and PostgREST status
   */
  async reloadSchemaCache(): Promise<SupabaseHealthStatus> {
    return this.checkSupabaseStatus(true);
  },

  async getProjects(): Promise<Project[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        // Query with select('*') so PostgREST never errors if a column is missing
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
    const vRatio = data.videoAspectRatio || (data.category === 'Reels' || data.category === 'Shorts' ? '9:16' : '16:9');
    const tRatio = data.thumbnailAspectRatio || (data.category === 'Reels' || data.category === 'Shorts' ? '9:16' : '16:9');
    const isVisible = data.visible !== false;

    if (isSupabaseConfigured() && supabase) {
      const caps = await getCapabilities();

      // Encode aspect ratios & visibility into description metadata safely so it's ALWAYS preserved
      // across all devices and browsers regardless of whether physical columns exist yet
      const enrichedDesc = injectMetadata(data.description, {
        videoAspectRatio: vRatio,
        thumbnailAspectRatio: tRatio,
        visible: isVisible,
        projectUrl: data.projectUrl,
      });

      const insertPayload: Record<string, any> = {
        title: data.title,
        category: data.category,
        description: enrichedDesc,
        cover_image: data.coverImage,
        video_url: data.videoUrl || null,
        client_name: data.client || null,
        display_order: displayOrder,
        status: data.status || 'published',
      };

      // ONLY include physical columns if the Supabase schema cache actually has them
      if (caps.video_aspect_ratio) {
        insertPayload.video_aspect_ratio = vRatio;
      }
      if (caps.thumbnail_aspect_ratio) {
        insertPayload.thumbnail_aspect_ratio = tRatio;
      }
      if (caps.visible) {
        insertPayload.visible = isVisible;
      }
      if (caps.project_url && data.projectUrl) {
        insertPayload.project_url = data.projectUrl;
      }

      try {
        const { data: inserted, error } = await supabase
          .from('projects')
          .insert([insertPayload])
          .select()
          .maybeSingle();

        if (error) {
          // If error is PGRST204 or missing column, invalidate capabilities cache and retry once with pure base columns
          const isMissingCol =
            error.code === 'PGRST204' ||
            error.code === '42703' ||
            error.message.includes('schema cache') ||
            error.message.includes('column');

          if (isMissingCol) {
            console.warn('Physical column pending in schema cache. Preserving in metadata:', error.message);
            cachedCapabilities = {
              video_aspect_ratio: false,
              thumbnail_aspect_ratio: false,
              visible: false,
              project_url: false,
              checkedAt: Date.now(),
            };

            const basePayload = {
              title: data.title,
              category: data.category,
              description: enrichedDesc,
              cover_image: data.coverImage,
              video_url: data.videoUrl || null,
              client_name: data.client || null,
              display_order: displayOrder,
              status: data.status || 'published',
            };

            const { data: retryInserted, error: retryError } = await supabase
              .from('projects')
              .insert([basePayload])
              .select()
              .maybeSingle();

            if (retryError) {
              throw new Error(`Supabase Insert Error (${retryError.code}): ${retryError.message}`);
            }

            const newProject = retryInserted
              ? mapRowToProject(retryInserted)
              : {
                  ...data,
                  id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `proj-${Date.now()}`,
                  displayOrder,
                  visible: isVisible,
                  videoAspectRatio: vRatio,
                  thumbnailAspectRatio: tRatio,
                };

            const updated = [...projects, newProject];
            saveStoredProjects(updated);
            return newProject;
          }

          throw new Error(`Supabase Error (${error.code}): ${error.message}`);
        }

        const newProject = inserted
          ? mapRowToProject(inserted)
          : {
              ...data,
              id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `proj-${Date.now()}`,
              displayOrder,
              visible: isVisible,
              videoAspectRatio: vRatio,
              thumbnailAspectRatio: tRatio,
            };

        const updated = [...projects, newProject];
        saveStoredProjects(updated);
        return newProject;
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
      visible: isVisible,
      videoAspectRatio: vRatio,
      thumbnailAspectRatio: tRatio,
    };
    const updated = [...projects, fallbackProject];
    saveStoredProjects(updated);
    return fallbackProject;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const projects = getStoredProjects();
    const index = projects.findIndex((p) => p.id === id);
    const existing = index !== -1 ? projects[index] : null;

    const mergedTitle = updates.title !== undefined ? updates.title : existing?.title;
    const mergedCategory = updates.category !== undefined ? updates.category : existing?.category;
    const mergedDesc = updates.description !== undefined ? updates.description : existing?.description || '';
    const mergedCover = updates.coverImage !== undefined ? updates.coverImage : existing?.coverImage;
    const mergedVideo = updates.videoUrl !== undefined ? updates.videoUrl : existing?.videoUrl;
    const mergedProjectUrl = updates.projectUrl !== undefined ? updates.projectUrl : existing?.projectUrl;
    const mergedClient = updates.client !== undefined ? updates.client : existing?.client;
    const mergedOrder = updates.displayOrder !== undefined ? updates.displayOrder : existing?.displayOrder;
    const mergedStatus = updates.status !== undefined ? updates.status : existing?.status;
    const mergedVisible = updates.visible !== undefined ? updates.visible : (existing?.visible !== false);
    const mergedVRatio = updates.videoAspectRatio !== undefined ? updates.videoAspectRatio : existing?.videoAspectRatio;
    const mergedTRatio = updates.thumbnailAspectRatio !== undefined ? updates.thumbnailAspectRatio : existing?.thumbnailAspectRatio;

    if (isSupabaseConfigured() && supabase) {
      const caps = await getCapabilities();

      const enrichedDesc = injectMetadata(mergedDesc, {
        videoAspectRatio: mergedVRatio,
        thumbnailAspectRatio: mergedTRatio,
        visible: mergedVisible,
        projectUrl: mergedProjectUrl,
      });

      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
        description: enrichedDesc,
      };
      if (mergedTitle !== undefined) updatePayload.title = mergedTitle;
      if (mergedCategory !== undefined) updatePayload.category = mergedCategory;
      if (mergedCover !== undefined) updatePayload.cover_image = mergedCover;
      if (mergedVideo !== undefined) updatePayload.video_url = mergedVideo;
      if (mergedClient !== undefined) updatePayload.client_name = mergedClient;
      if (mergedOrder !== undefined) updatePayload.display_order = mergedOrder;
      if (mergedStatus !== undefined) updatePayload.status = mergedStatus;

      // Only include physical columns if Supabase schema actually has them
      if (caps.video_aspect_ratio && mergedVRatio !== undefined) {
        updatePayload.video_aspect_ratio = mergedVRatio;
      }
      if (caps.thumbnail_aspect_ratio && mergedTRatio !== undefined) {
        updatePayload.thumbnail_aspect_ratio = mergedTRatio;
      }
      if (caps.visible && mergedVisible !== undefined) {
        updatePayload.visible = mergedVisible;
      }
      if (caps.project_url && mergedProjectUrl !== undefined) {
        updatePayload.project_url = mergedProjectUrl;
      }

      try {
        const { data: updatedRow, error } = await supabase
          .from('projects')
          .update(updatePayload)
          .eq('id', id)
          .select()
          .maybeSingle();

        if (error) {
          // If error is PGRST204 or missing column, invalidate capabilities cache and retry with base columns
          const isMissingCol =
            error.code === 'PGRST204' ||
            error.code === '42703' ||
            error.message.includes('schema cache') ||
            error.message.includes('column');

          if (isMissingCol) {
            console.warn('Physical column not present in schema cache on update, retrying with base columns:', error.message);
            cachedCapabilities = {
              video_aspect_ratio: false,
              thumbnail_aspect_ratio: false,
              visible: false,
              project_url: false,
              checkedAt: Date.now(),
            };

            const basePayload: Record<string, any> = {
              updated_at: new Date().toISOString(),
              description: enrichedDesc,
            };
            if (mergedTitle !== undefined) basePayload.title = mergedTitle;
            if (mergedCategory !== undefined) basePayload.category = mergedCategory;
            if (mergedCover !== undefined) basePayload.cover_image = mergedCover;
            if (mergedVideo !== undefined) basePayload.video_url = mergedVideo;
            if (mergedClient !== undefined) basePayload.client_name = mergedClient;
            if (mergedOrder !== undefined) basePayload.display_order = mergedOrder;
            if (mergedStatus !== undefined) basePayload.status = mergedStatus;

            const { data: retryRow, error: retryError } = await supabase
              .from('projects')
              .update(basePayload)
              .eq('id', id)
              .select()
              .maybeSingle();

            if (retryError) {
              throw new Error(`Supabase Update Error (${retryError.code}): ${retryError.message}`);
            }

            const mapped = retryRow
              ? mapRowToProject(retryRow)
              : ({
                  ...(existing || {}),
                  ...updates,
                  id,
                  description: mergedDesc,
                  videoAspectRatio: mergedVRatio,
                  thumbnailAspectRatio: mergedTRatio,
                  visible: mergedVisible,
                } as Project);

            if (index !== -1) {
              projects[index] = mapped;
            }
            saveStoredProjects([...projects]);
            return mapped;
          }

          throw new Error(`Supabase Update Error (${error.code}): ${error.message}`);
        }

        const mapped = updatedRow
          ? mapRowToProject(updatedRow)
          : ({
              ...(existing || {}),
              ...updates,
              id,
              description: mergedDesc,
              videoAspectRatio: mergedVRatio,
              thumbnailAspectRatio: mergedTRatio,
              visible: mergedVisible,
            } as Project);

        if (index !== -1) {
          projects[index] = mapped;
        }
        saveStoredProjects([...projects]);
        return mapped;
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
