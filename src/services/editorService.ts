/**
 * FOOTAZIX — Editor & Assignment Management Service
 * 
 * Manages post-production video editing workflow:
 * - Editor roster & profiles
 * - Video assignments, deadlines, formats, and briefs
 * - Raw footage links & draft review submissions
 * - Agency toolkit assets (LUTs, SFX, Motion Presets)
 * - Synchronizes with Supabase with localStorage fallback
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Editor,
  EditorAssignment,
  EditorAssignmentStatus,
  EditorAsset,
} from '../types';

const STORAGE_KEY_EDITORS = 'footazix_editors_roster';
const STORAGE_KEY_ASSIGNMENTS = 'footazix_editor_assignments';
const STORAGE_KEY_ASSETS = 'footazix_editor_assets';

// Initial production-grade editors roster
export const INITIAL_EDITORS: Editor[] = [
  {
    id: 'editor-alex-01',
    name: 'Alex Rivera',
    email: 'alex@footazix.com',
    role: 'lead_editor',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    specialties: ['High-Retention Reels', 'Sound Design', 'Pacing & Hooks'],
    software: ['Premiere Pro', 'After Effects', 'DaVinci Resolve'],
    bio: 'Lead Post-Production Editor specializing in fast-paced founder reels and YouTube hooks.',
    phone: '+1 (555) 234-8891',
    turnaroundHoursAvg: 24,
    assignedTasksCount: 2,
    completedTasksCount: 48,
    createdAt: '2026-08-15T10:00:00Z',
    lastActive: 'Just now',
  },
  {
    id: 'editor-maya-02',
    name: 'Maya Chen',
    email: 'maya@footazix.com',
    role: 'editor',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    specialties: ['Motion Graphics', 'Typography Animations', 'Brand Stories'],
    software: ['After Effects', 'Premiere Pro', 'Illustrator'],
    bio: 'Visual effects and kinetic typography specialist for luxury tech & creator brands.',
    phone: '+1 (555) 789-4412',
    turnaroundHoursAvg: 36,
    assignedTasksCount: 1,
    completedTasksCount: 34,
    createdAt: '2026-09-01T12:30:00Z',
    lastActive: '2 hours ago',
  },
  {
    id: 'editor-david-03',
    name: 'David Vance',
    email: 'david@footazix.com',
    role: 'editor',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    specialties: ['YouTube Long-Form', 'Color Grading', 'Documentary Pacing'],
    software: ['DaVinci Resolve Studio', 'Premiere Pro'],
    bio: 'Colorist and long-form storytelling editor with deep narrative pacing expertise.',
    phone: '+1 (555) 912-3341',
    turnaroundHoursAvg: 48,
    assignedTasksCount: 1,
    completedTasksCount: 29,
    createdAt: '2026-09-10T14:15:00Z',
    lastActive: '1 day ago',
  },
];

// Initial realistic editing tasks
export const INITIAL_ASSIGNMENTS: EditorAssignment[] = [
  {
    id: 'assign-001',
    title: 'Fintech Founder Viral Hook Reel',
    clientName: 'Apex Capital / Julian Hayes',
    editorId: 'editor-alex-01',
    editorName: 'Alex Rivera',
    format: '9:16 Reel',
    status: 'in_progress',
    priority: 'urgent',
    dueDate: '2026-10-18T18:00:00Z',
    targetDuration: '35 - 45s',
    rawFootageUrl: 'https://drive.google.com/drive/folders/demo-footazix-apex-raw',
    assetFolderUrl: 'https://drive.google.com/drive/folders/demo-footazix-apex-branding',
    brief: 'Cut the 12-minute interview into a punchy 40-second hook reel. Emphasize the controversial claim at 03:14 ("Venture debt is dead"). Use snappy sound accents on every card reveal.',
    styleNotes: 'High-contrast monochrome background with Footazix electric cobalt accents for key stats.',
    createdAt: '2026-10-12T09:00:00Z',
    updatedAt: '2026-10-13T14:20:00Z',
  },
  {
    id: 'assign-002',
    title: 'SaaS Launch Cinematic Reel & Teaser',
    clientName: 'Kinetix AI',
    editorId: 'editor-alex-01',
    editorName: 'Alex Rivera',
    format: '9:16 Reel',
    status: 'review_needed',
    priority: 'high',
    dueDate: '2026-10-17T12:00:00Z',
    targetDuration: '30s',
    rawFootageUrl: 'https://drive.google.com/drive/folders/demo-kinetix-teaser-raw',
    brief: 'Product UI demo overlaid with founder commentary. Speed ramps on screen captures and clean sound fx.',
    styleNotes: 'Tech-forward sound design, deep bass drops, clean subtitling with white text and blue key highlights.',
    draftVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-video-editor-working-on-his-computer-42861-large.mp4',
    editorNotes: 'First cut uploaded. Kept it tight at 28 seconds. Let me know if the intro audio level is balanced.',
    submissionDate: '2026-10-14T16:45:00Z',
    createdAt: '2026-10-11T11:30:00Z',
    updatedAt: '2026-10-14T16:45:00Z',
  },
  {
    id: 'assign-003',
    title: 'Kinetic Typography & 3D Logo Intro',
    clientName: 'Solaria Energy',
    editorId: 'editor-maya-02',
    editorName: 'Maya Chen',
    format: 'Motion / VFX',
    status: 'in_progress',
    priority: 'normal',
    dueDate: '2026-10-20T20:00:00Z',
    targetDuration: '15s Stinger',
    rawFootageUrl: 'https://drive.google.com/drive/folders/demo-solaria-brand-pack',
    brief: 'Create a reusable 10-second opening stinger for their new YouTube series. Clean geometric motion graphics.',
    styleNotes: 'Clean, modern lines. Avoid cheesy glitter. Match 4K ProRes 422 delivery.',
    createdAt: '2026-10-13T15:00:00Z',
    updatedAt: '2026-10-13T15:00:00Z',
  },
  {
    id: 'assign-004',
    title: 'Founder Story: From $0 to $10M Breakdown',
    clientName: 'The Modern Executive',
    editorId: 'editor-david-03',
    editorName: 'David Vance',
    format: '16:9 YouTube',
    status: 'approved',
    priority: 'normal',
    dueDate: '2026-10-14T18:00:00Z',
    targetDuration: '8 - 10 min',
    rawFootageUrl: 'https://drive.google.com/drive/folders/demo-founder-ep04-raw',
    brief: 'Full 8-minute episodic cut. Chapter cards, B-roll integration, and subtle documentary score throughout.',
    draftVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-video-editor-working-on-his-computer-42861-large.mp4',
    feedbackNotes: 'Approved! Client loved the documentary color grade. Ready for scheduled publish.',
    submissionDate: '2026-10-13T18:00:00Z',
    createdAt: '2026-10-08T10:00:00Z',
    updatedAt: '2026-10-14T09:30:00Z',
  },
];

// Agency Toolkits & Downloadable Assets for Editors
export const INITIAL_EDITOR_ASSETS: EditorAsset[] = [
  {
    id: 'asset-01',
    title: 'Footazix Cobalt Cinema LUT Pack (v2.4)',
    category: 'Presets & LUTs',
    description: 'Custom .cube LUTs engineered for Sony S-Log3, Canon C-Log, and iPhone ProRes Log to achieve the signature Footazix high-contrast film look.',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-video-editor-working-on-his-computer-42861-large.mp4',
    fileSize: '42 MB (.cube zip)',
    fileType: 'LUTs Pack',
    updatedAt: '2026-10-01',
  },
  {
    id: 'asset-02',
    title: 'Footazix Retention SFX Vault — 250+ Sounds',
    category: 'Sound Effects',
    description: 'High-impact risers, cinematic whooshes, analog mouse clicks, punchy bass drops, keyboard taps, and notification accents.',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-video-editor-working-on-his-computer-42861-large.mp4',
    fileSize: '185 MB (.wav 24-bit)',
    fileType: 'Audio Pack',
    updatedAt: '2026-10-05',
  },
  {
    id: 'asset-03',
    title: 'Kinetic Subtitles & Text Pop Mogrt Pack',
    category: 'Motion Graphics',
    description: '100% customizable Premiere Pro MOGRT templates for animated word-by-word captions, key stat counters, and tweet pop-ups.',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-video-editor-working-on-his-computer-42861-large.mp4',
    fileSize: '68 MB (.mogrt)',
    fileType: 'MOGRT Pack',
    updatedAt: '2026-10-08',
  },
  {
    id: 'asset-04',
    title: 'Official Footazix Vector Logos & Brand Watermarks',
    category: 'Brand Assets',
    description: 'SVG, AI, and Transparent PNGs of the official Footazix wordmark and icon mark for outro placement and verified badges.',
    url: '/assets/branding/footazix-og-default.png',
    fileSize: '12 MB (Vector .svg / .png)',
    fileType: 'Vector Graphics',
    updatedAt: '2026-10-10',
  },
];

type EditorChangeListener = () => void;
const listeners = new Set<EditorChangeListener>();

function notify() {
  listeners.forEach((fn) => fn());
}

export const editorService = {
  subscribe(fn: EditorChangeListener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  // -------------------------------------------------------------
  // EDITORS
  // -------------------------------------------------------------
  async getEditors(): Promise<Editor[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('editors')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            name: d.name,
            email: d.email,
            role: d.role || 'editor',
            status: d.status || 'active',
            avatar: d.avatar,
            specialties: Array.isArray(d.specialties) ? d.specialties : (d.specialties ? JSON.parse(d.specialties) : []),
            software: Array.isArray(d.software) ? d.software : (d.software ? JSON.parse(d.software) : []),
            bio: d.bio,
            phone: d.phone,
            turnaroundHoursAvg: d.turnaround_hours_avg || 24,
            assignedTasksCount: d.assigned_tasks_count || 0,
            completedTasksCount: d.completed_tasks_count || 0,
            createdAt: d.created_at || new Date().toISOString(),
            lastActive: d.last_active || 'Recently',
          }));
        }
      } catch (err) {
        console.warn('Supabase getEditors error, using local storage:', err);
      }
    }

    // LocalStorage fallback
    try {
      const raw = localStorage.getItem(STORAGE_KEY_EDITORS);
      if (raw) return JSON.parse(raw);
    } catch {}

    // Initial default
    try {
      localStorage.setItem(STORAGE_KEY_EDITORS, JSON.stringify(INITIAL_EDITORS));
    } catch {}
    return INITIAL_EDITORS;
  },

  async createEditor(data: Omit<Editor, 'id' | 'assignedTasksCount' | 'completedTasksCount' | 'createdAt'>): Promise<Editor> {
    const newEditor: Editor = {
      ...data,
      id: `editor-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      assignedTasksCount: 0,
      completedTasksCount: 0,
      createdAt: new Date().toISOString(),
      lastActive: 'Just invited',
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('editors').insert({
          id: newEditor.id,
          name: newEditor.name,
          email: newEditor.email,
          role: newEditor.role,
          status: newEditor.status,
          avatar: newEditor.avatar,
          specialties: newEditor.specialties,
          software: newEditor.software,
          bio: newEditor.bio,
          phone: newEditor.phone,
          turnaround_hours_avg: newEditor.turnaroundHoursAvg || 24,
        });
      } catch (err) {
        console.warn('Supabase createEditor warning:', err);
      }
    }

    const current = await this.getEditors();
    const updated = [newEditor, ...current];
    try {
      localStorage.setItem(STORAGE_KEY_EDITORS, JSON.stringify(updated));
    } catch {}

    notify();
    return newEditor;
  },

  async updateEditor(id: string, partial: Partial<Editor>): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const payload: any = {};
        if (partial.name !== undefined) payload.name = partial.name;
        if (partial.email !== undefined) payload.email = partial.email;
        if (partial.role !== undefined) payload.role = partial.role;
        if (partial.status !== undefined) payload.status = partial.status;
        if (partial.specialties !== undefined) payload.specialties = partial.specialties;
        if (partial.bio !== undefined) payload.bio = partial.bio;
        if (partial.phone !== undefined) payload.phone = partial.phone;

        await supabase.from('editors').update(payload).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateEditor warning:', err);
      }
    }

    const current = await this.getEditors();
    const updated = current.map((e) => (e.id === id ? { ...e, ...partial } : e));
    try {
      localStorage.setItem(STORAGE_KEY_EDITORS, JSON.stringify(updated));
    } catch {}

    notify();
    return true;
  },

  async deleteEditor(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('editors').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteEditor warning:', err);
      }
    }

    const current = await this.getEditors();
    const updated = current.filter((e) => e.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY_EDITORS, JSON.stringify(updated));
    } catch {}

    notify();
    return true;
  },

  // -------------------------------------------------------------
  // ASSIGNMENTS
  // -------------------------------------------------------------
  async getAssignments(editorId?: string): Promise<EditorAssignment[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('editor_assignments').select('*').order('created_at', { ascending: false });
        if (editorId) {
          query = query.eq('editor_id', editorId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            title: d.title,
            clientName: d.client_name,
            editorId: d.editor_id,
            editorName: d.editor_name,
            format: d.format || '9:16 Reel',
            status: d.status || 'assigned',
            priority: d.priority || 'normal',
            dueDate: d.due_date,
            targetDuration: d.target_duration,
            rawFootageUrl: d.raw_footage_url,
            assetFolderUrl: d.asset_folder_url,
            brief: d.brief,
            styleNotes: d.style_notes,
            draftVideoUrl: d.draft_video_url,
            feedbackNotes: d.feedback_notes,
            editorNotes: d.editor_notes,
            submissionDate: d.submission_date,
            createdAt: d.created_at || new Date().toISOString(),
            updatedAt: d.updated_at || new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn('Supabase getAssignments warning, using local storage:', err);
      }
    }

    // LocalStorage fallback
    let all: EditorAssignment[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
      if (raw) {
        all = JSON.parse(raw);
      } else {
        all = INITIAL_ASSIGNMENTS;
        localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(all));
      }
    } catch {
      all = INITIAL_ASSIGNMENTS;
    }

    if (editorId) {
      return all.filter((a) => a.editorId === editorId);
    }
    return all;
  },

  async createAssignment(data: Omit<EditorAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<EditorAssignment> {
    const newAssignment: EditorAssignment = {
      ...data,
      id: `assign-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('editor_assignments').insert({
          id: newAssignment.id,
          title: newAssignment.title,
          client_name: newAssignment.clientName,
          editor_id: newAssignment.editorId,
          editor_name: newAssignment.editorName,
          format: newAssignment.format,
          status: newAssignment.status,
          priority: newAssignment.priority,
          due_date: newAssignment.dueDate,
          target_duration: newAssignment.targetDuration,
          raw_footage_url: newAssignment.rawFootageUrl,
          asset_folder_url: newAssignment.assetFolderUrl,
          brief: newAssignment.brief,
          style_notes: newAssignment.styleNotes,
        });
      } catch (err) {
        console.warn('Supabase createAssignment warning:', err);
      }
    }

    const current = await this.getAssignments();
    const updated = [newAssignment, ...current];
    try {
      localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(updated));
    } catch {}

    // Also update editor assigned count
    await this.recalculateEditorCounts();

    notify();
    return newAssignment;
  },

  async updateAssignment(id: string, partial: Partial<EditorAssignment>): Promise<boolean> {
    const updatedAt = new Date().toISOString();
    const partialWithDate = { ...partial, updatedAt };

    if (isSupabaseConfigured() && supabase) {
      try {
        const payload: any = { updated_at: updatedAt };
        if (partial.title !== undefined) payload.title = partial.title;
        if (partial.clientName !== undefined) payload.client_name = partial.clientName;
        if (partial.editorId !== undefined) payload.editor_id = partial.editorId;
        if (partial.editorName !== undefined) payload.editor_name = partial.editorName;
        if (partial.status !== undefined) payload.status = partial.status;
        if (partial.priority !== undefined) payload.priority = partial.priority;
        if (partial.dueDate !== undefined) payload.due_date = partial.dueDate;
        if (partial.targetDuration !== undefined) payload.target_duration = partial.targetDuration;
        if (partial.rawFootageUrl !== undefined) payload.raw_footage_url = partial.rawFootageUrl;
        if (partial.assetFolderUrl !== undefined) payload.asset_folder_url = partial.assetFolderUrl;
        if (partial.brief !== undefined) payload.brief = partial.brief;
        if (partial.styleNotes !== undefined) payload.style_notes = partial.styleNotes;
        if (partial.draftVideoUrl !== undefined) payload.draft_video_url = partial.draftVideoUrl;
        if (partial.feedbackNotes !== undefined) payload.feedback_notes = partial.feedbackNotes;
        if (partial.editorNotes !== undefined) payload.editor_notes = partial.editorNotes;
        if (partial.submissionDate !== undefined) payload.submission_date = partial.submissionDate;

        await supabase.from('editor_assignments').update(payload).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateAssignment warning:', err);
      }
    }

    const current = await this.getAssignments();
    const updated = current.map((a) => (a.id === id ? { ...a, ...partialWithDate } : a));
    try {
      localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(updated));
    } catch {}

    await this.recalculateEditorCounts();
    notify();
    return true;
  },

  async submitDraft(id: string, draftVideoUrl: string, editorNotes?: string): Promise<boolean> {
    return this.updateAssignment(id, {
      draftVideoUrl,
      editorNotes,
      submissionDate: new Date().toISOString(),
      status: 'review_needed',
    });
  },

  async updateAssignmentStatus(
    id: string,
    status: EditorAssignmentStatus,
    feedbackNotes?: string
  ): Promise<boolean> {
    const updatePayload: Partial<EditorAssignment> = { status };
    if (feedbackNotes !== undefined) {
      updatePayload.feedbackNotes = feedbackNotes;
    }
    return this.updateAssignment(id, updatePayload);
  },

  async deleteAssignment(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('editor_assignments').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteAssignment warning:', err);
      }
    }

    const current = await this.getAssignments();
    const updated = current.filter((a) => a.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(updated));
    } catch {}

    await this.recalculateEditorCounts();
    notify();
    return true;
  },

  async recalculateEditorCounts(): Promise<void> {
    const assignments = await this.getAssignments();
    const editors = await this.getEditors();

    const updatedEditors = editors.map((editor) => {
      const editorTasks = assignments.filter((a) => a.editorId === editor.id);
      const activeTasks = editorTasks.filter((a) => a.status === 'assigned' || a.status === 'in_progress' || a.status === 'review_needed');
      const completedTasks = editorTasks.filter((a) => a.status === 'approved' || a.status === 'completed');

      return {
        ...editor,
        assignedTasksCount: activeTasks.length,
        completedTasksCount: completedTasks.length,
      };
    });

    try {
      localStorage.setItem(STORAGE_KEY_EDITORS, JSON.stringify(updatedEditors));
    } catch {}
  },

  // -------------------------------------------------------------
  // TOOLKIT & ASSETS
  // -------------------------------------------------------------
  async getAssets(): Promise<EditorAsset[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ASSETS);
      if (raw) return JSON.parse(raw);
    } catch {}

    try {
      localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(INITIAL_EDITOR_ASSETS));
    } catch {}
    return INITIAL_EDITOR_ASSETS;
  },
};
