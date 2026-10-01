/**
 * FOOTAZIX — Team Service
 * 
 * Interacts with Supabase `team_members` table with Row Level Security.
 * Public visitors view visible members; admins manage full team.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TeamMember } from '../types';
import { INITIAL_TEAM } from '../data/mockData';

const STORAGE_KEY = 'footazix_team_members';

type Listener = (team: TeamMember[]) => void;
const listeners: Set<Listener> = new Set();

function getStoredTeam(): TeamMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_TEAM;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed reading team from localStorage:', err);
    return INITIAL_TEAM;
  }
}

function saveStoredTeam(team: TeamMember[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
    listeners.forEach((fn) => fn(team));
  } catch (err) {
    console.error('Failed saving team to localStorage:', err);
  }
}

function mapRowToTeamMember(row: any): TeamMember {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    description: row.description,
    photo: row.photo,
    socialLink: row.social_link || undefined,
    email: row.email || undefined,
    displayOrder: row.display_order ?? 1,
    visible: row.visible ?? true,
  };
}

export const teamService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async getTeam(): Promise<TeamMember[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data) {
          const mapped = data.map(mapRowToTeamMember);
          saveStoredTeam(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Failed fetching team from Supabase, using cache:', err);
      }
    }

    return getStoredTeam().sort((a, b) => a.displayOrder - b.displayOrder);
  },

  async createTeamMember(data: Omit<TeamMember, 'id'>): Promise<TeamMember> {
    const team = getStoredTeam();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from('team_members')
          .insert([
            {
              name: data.name,
              role: data.role,
              description: data.description,
              photo: data.photo,
              social_link: data.socialLink || null,
              email: data.email || null,
              display_order: data.displayOrder || team.length + 1,
              visible: data.visible,
            },
          ])
          .select()
          .single();

        if (!error && inserted) {
          const newMember = mapRowToTeamMember(inserted);
          const updated = [...team, newMember];
          saveStoredTeam(updated);
          return newMember;
        }
      } catch (err) {
        console.error('Failed creating team member in Supabase:', err);
      }
    }

    const fallbackMember: TeamMember = {
      ...data,
      id: `team-${Date.now()}`,
      displayOrder: team.length + 1,
    };
    const updated = [...team, fallbackMember];
    saveStoredTeam(updated);
    return fallbackMember;
  },

  async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    const team = getStoredTeam();
    const index = team.findIndex((t) => t.id === id);

    if (isSupabaseConfigured() && supabase) {
      try {
        const payload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.role !== undefined) payload.role = updates.role;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.photo !== undefined) payload.photo = updates.photo;
        if (updates.socialLink !== undefined) payload.social_link = updates.socialLink;
        if (updates.email !== undefined) payload.email = updates.email;
        if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
        if (updates.visible !== undefined) payload.visible = updates.visible;

        const { data: updatedRow, error } = await supabase
          .from('team_members')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (!error && updatedRow) {
          const mapped = mapRowToTeamMember(updatedRow);
          if (index !== -1) {
            team[index] = mapped;
          }
          saveStoredTeam([...team]);
          return mapped;
        }
      } catch (err) {
        console.error('Failed updating team member in Supabase:', err);
      }
    }

    if (index === -1) throw new Error('Team member not found');
    const updated = { ...team[index], ...updates };
    team[index] = updated;
    saveStoredTeam([...team]);
    return updated;
  },

  async deleteTeamMember(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('team_members').delete().eq('id', id);
      } catch (err) {
        console.error('Failed deleting team member in Supabase:', err);
      }
    }

    const team = getStoredTeam();
    const filtered = team.filter((t) => t.id !== id);
    saveStoredTeam(filtered);
    return true;
  },

  async reorderTeam(orderedIds: string[]): Promise<TeamMember[]> {
    const team = getStoredTeam();
    const reordered = orderedIds
      .map((id, index) => {
        const found = team.find((t) => t.id === id);
        return found ? { ...found, displayOrder: index + 1 } : null;
      })
      .filter((t): t is TeamMember => t !== null);

    saveStoredTeam(reordered);

    if (isSupabaseConfigured() && supabase) {
      const client = supabase;
      try {
        await Promise.all(
          reordered.map((member) =>
            client
              .from('team_members')
              .update({ display_order: member.displayOrder })
              .eq('id', member.id)
          )
        );
      } catch (err) {
        console.warn('Error syncing reordered team to Supabase:', err);
      }
    }

    return reordered;
  },

  async resetTeam(): Promise<TeamMember[]> {
    saveStoredTeam(INITIAL_TEAM);
    return INITIAL_TEAM;
  },
};
