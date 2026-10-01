/**
 * FOOTAZIX — Team Service
 * 
 * Clean abstraction for team members.
 * Supports multiple team members, order, show/hide, edit, delete.
 * Prepared for future Supabase table: `team_members`
 */

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

export const teamService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async getTeam(): Promise<TeamMember[]> {
    await new Promise((r) => setTimeout(r, 60));
    return getStoredTeam().sort((a, b) => a.displayOrder - b.displayOrder);
  },

  async createTeamMember(data: Omit<TeamMember, 'id'>): Promise<TeamMember> {
    await new Promise((r) => setTimeout(r, 120));
    const team = getStoredTeam();
    const newMember: TeamMember = {
      ...data,
      id: `team-${Date.now()}`,
      displayOrder: team.length + 1,
    };
    const updated = [...team, newMember];
    saveStoredTeam(updated);
    return newMember;
  },

  async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    await new Promise((r) => setTimeout(r, 100));
    const team = getStoredTeam();
    const index = team.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Team member not found');
    const updated = { ...team[index], ...updates };
    team[index] = updated;
    saveStoredTeam([...team]);
    return updated;
  },

  async deleteTeamMember(id: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 100));
    const team = getStoredTeam();
    const filtered = team.filter((t) => t.id !== id);
    saveStoredTeam(filtered);
    return true;
  },

  async reorderTeam(orderedIds: string[]): Promise<TeamMember[]> {
    await new Promise((r) => setTimeout(r, 80));
    const team = getStoredTeam();
    const reordered = orderedIds
      .map((id, index) => {
        const found = team.find((t) => t.id === id);
        return found ? { ...found, displayOrder: index + 1 } : null;
      })
      .filter((t): t is TeamMember => t !== null);

    saveStoredTeam(reordered);
    return reordered;
  },

  async resetTeam(): Promise<TeamMember[]> {
    saveStoredTeam(INITIAL_TEAM);
    return INITIAL_TEAM;
  },
};
