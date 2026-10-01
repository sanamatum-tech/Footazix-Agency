/**
 * FOOTAZIX — Portfolio Service
 * 
 * Clean abstraction for portfolio projects.
 * Prepared for future Supabase table: `portfolio_projects`
 */

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

export const portfolioService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async getProjects(): Promise<Project[]> {
    await new Promise((r) => setTimeout(r, 60));
    return getStoredProjects().sort((a, b) => a.displayOrder - b.displayOrder);
  },

  async getProjectById(id: string): Promise<Project | null> {
    const projects = getStoredProjects();
    return projects.find((p) => p.id === id) || null;
  },

  async createProject(data: Omit<Project, 'id'>): Promise<Project> {
    await new Promise((r) => setTimeout(r, 120));
    const projects = getStoredProjects();
    const newProject: Project = {
      ...data,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      displayOrder: projects.length + 1,
    };
    const updated = [...projects, newProject];
    saveStoredProjects(updated);
    return newProject;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    await new Promise((r) => setTimeout(r, 100));
    const projects = getStoredProjects();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Project not found');
    const updatedProject = { ...projects[index], ...updates };
    projects[index] = updatedProject;
    saveStoredProjects([...projects]);
    return updatedProject;
  },

  async deleteProject(id: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 100));
    const projects = getStoredProjects();
    const filtered = projects.filter((p) => p.id !== id);
    saveStoredProjects(filtered);
    return true;
  },

  async reorderProjects(orderedIds: string[]): Promise<Project[]> {
    await new Promise((r) => setTimeout(r, 80));
    const projects = getStoredProjects();
    const reordered = orderedIds
      .map((id, index) => {
        const found = projects.find((p) => p.id === id);
        return found ? { ...found, displayOrder: index + 1 } : null;
      })
      .filter((p): p is Project => p !== null);

    saveStoredProjects(reordered);
    return reordered;
  },

  async resetProjects(): Promise<Project[]> {
    saveStoredProjects(INITIAL_PROJECTS);
    return INITIAL_PROJECTS;
  },
};
