import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Project, ProjectCategory, AspectRatioType } from '../../types';
import { portfolioService, SupabaseHealthStatus } from '../../services/portfolioService';
import { mediaService } from '../../services/mediaService';
import {
  FolderKanban,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Eye,
  EyeOff,
  LayoutGrid,
  List,
  Search,
  CheckCircle2,
  X,
  Play,
  Upload,
  Loader2,
  Database,
  Copy,
  Check,
  Film,
  Image as ImageIcon,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES: ProjectCategory[] = ['Reels', 'Shorts', 'YouTube', 'Brand', 'Motion', 'Other'];

const ASPECT_RATIO_OPTIONS: { id: AspectRatioType; label: string; sub: string }[] = [
  { id: '16:9', label: '16:9', sub: 'YouTube / Landscape' },
  { id: '9:16', label: '9:16', sub: 'Reels / Shorts / TikTok' },
  { id: '1:1', label: '1:1', sub: 'Square' },
  { id: '4:5', label: '4:5', sub: 'Instagram Portrait' },
  { id: '4:3', label: '4:3', sub: 'Standard' },
  { id: 'auto', label: 'Auto', sub: 'Original Ratio' },
];

function getAspectClass(ratio: AspectRatioType): string {
  switch (ratio) {
    case '9:16':
      return 'aspect-[9/16]';
    case '1:1':
      return 'aspect-square';
    case '4:5':
      return 'aspect-[4/5]';
    case '4:3':
      return 'aspect-[4/3]';
    case 'auto':
      return 'aspect-[16/10]';
    case '16:9':
    default:
      return 'aspect-[16/9]';
  }
}

export const AdminPortfolio: React.FC = () => {
  const { projects } = useApp();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [hasCopiedSql, setHasCopiedSql] = useState(false);
  const [uploadingField, setUploadingField] = useState<'cover' | 'video' | null>(null);
  const [supabaseHealth, setSupabaseHealth] = useState<SupabaseHealthStatus | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Reels');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('/assets/portfolio/project-01/cover.jpg');
  const [videoUrl, setVideoUrl] = useState('');
  const [client, setClient] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [visible, setVisible] = useState<boolean>(true);
  const [videoAspectRatio, setVideoAspectRatio] = useState<AspectRatioType>('16:9');
  const [thumbnailAspectRatio, setThumbnailAspectRatio] = useState<AspectRatioType>('16:9');
  const [previewTab, setPreviewTab] = useState<'thumbnail' | 'video'>('thumbnail');

  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Check health on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await portfolioService.checkSupabaseStatus();
      setSupabaseHealth(res);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const openAddModal = () => {
    setTitle('');
    setCategory('Reels');
    setDescription('');
    setCoverImage('/assets/portfolio/project-01/cover.jpg');
    setVideoUrl('');
    setClient('');
    setProjectUrl('');
    setDisplayOrder(projects.length + 1);
    setStatus('published');
    setVisible(true);
    setVideoAspectRatio('9:16');
    setThumbnailAspectRatio('9:16');
    setEditingProject(null);
    setPreviewTab('thumbnail');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setTitle(p.title);
    setCategory(p.category);
    setDescription(p.description);
    setCoverImage(p.coverImage);
    setVideoUrl(p.videoUrl || '');
    setClient(p.client || '');
    setProjectUrl(p.projectUrl || '');
    setDisplayOrder(p.displayOrder);
    setStatus(p.status);
    setVisible(p.visible !== false);
    setVideoAspectRatio(p.videoAspectRatio || '16:9');
    setThumbnailAspectRatio(p.thumbnailAspectRatio || '16:9');
    setPreviewTab('thumbnail');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingField('cover');
      const asset = await mediaService.uploadMedia(file, 'images');
      setCoverImage(asset.url);
      setStatusMessage({ type: 'success', text: `Uploaded thumbnail: ${file.name}` });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Upload failed: ${err.message}` });
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setUploadingField(null);
      e.target.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingField('video');
      const asset = await mediaService.uploadMedia(file, 'videos');
      setVideoUrl(asset.url);
      setStatusMessage({ type: 'success', text: `Uploaded video: ${file.name}` });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Upload failed: ${err.message}` });
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setUploadingField(null);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSaving(true);
    try {
      if (editingProject) {
        await portfolioService.updateProject(editingProject.id, {
          title: title.trim(),
          category,
          description: description.trim(),
          coverImage: coverImage.trim(),
          videoUrl: videoUrl.trim() || undefined,
          client: client.trim() || undefined,
          projectUrl: projectUrl.trim() || undefined,
          displayOrder: Number(displayOrder),
          status,
          visible,
          videoAspectRatio,
          thumbnailAspectRatio,
        });
        setStatusMessage({ type: 'success', text: 'Project saved directly to Supabase!' });
      } else {
        await portfolioService.createProject({
          title: title.trim(),
          category,
          description: description.trim(),
          coverImage: coverImage.trim(),
          videoUrl: videoUrl.trim() || undefined,
          client: client.trim() || undefined,
          projectUrl: projectUrl.trim() || undefined,
          displayOrder: Number(displayOrder),
          status,
          visible,
          videoAspectRatio,
          thumbnailAspectRatio,
        });
        setStatusMessage({ type: 'success', text: 'New project created in Supabase!' });
      }

      closeModal();
      checkHealth();
    } catch (err: any) {
      console.error('Portfolio save error:', err);
      setStatusMessage({
        type: 'error',
        text: `Error saving: ${err.message || 'Check database permissions.'}`,
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      await portfolioService.deleteProject(id);
      setIsDeletingId(null);
      setStatusMessage({ type: 'success', text: 'Project deleted from Supabase.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Delete failed: ${err.message}` });
    }
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleTogglePublish = async (p: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = p.status === 'published' ? 'draft' : 'published';
    try {
      await portfolioService.updateProject(p.id, { status: newStatus });
      setStatusMessage({ type: 'success', text: `Project status set to ${newStatus}.` });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Update error: ${err.message}` });
    }
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleToggleVisible = async (p: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const newVisible = p.visible === false;
    try {
      await portfolioService.updateProject(p.id, { visible: newVisible });
      setStatusMessage({ type: 'success', text: `Project marked as ${newVisible ? 'Visible' : 'Hidden'}.` });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Update error: ${err.message}` });
    }
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const newProjects = [...projects];
    const temp = newProjects[index];
    newProjects[index] = newProjects[targetIndex];
    newProjects[targetIndex] = temp;

    const orderedIds = newProjects.map((p) => p.id);
    try {
      await portfolioService.reorderProjects(orderedIds);
      setStatusMessage({ type: 'success', text: 'Display order updated in Supabase.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Reorder error: ${err.message}` });
    }
    setTimeout(() => setStatusMessage(null), 2000);
  };

  const copySqlToClipboard = () => {
    const sql = `-- FOOTAZIX PORTFOLIO CMS UPGRADE SQL
ALTER TABLE IF EXISTS public.projects
  ADD COLUMN IF NOT EXISTS video_aspect_ratio TEXT DEFAULT '16:9',
  ADD COLUMN IF NOT EXISTS thumbnail_aspect_ratio TEXT DEFAULT '16:9',
  ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS project_url TEXT;

UPDATE public.projects
SET 
  video_aspect_ratio = COALESCE(video_aspect_ratio, '16:9'),
  thumbnail_aspect_ratio = COALESCE(thumbnail_aspect_ratio, '16:9'),
  visible = COALESCE(visible, true);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;
CREATE POLICY "Public can view published projects"
  ON public.projects FOR SELECT
  TO anon, authenticated
  USING (
    (status = 'published' AND COALESCE(visible, true) = true)
    OR auth.role() = 'authenticated'
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;
DROP POLICY IF EXISTS "CMS can manage projects" ON public.projects;
CREATE POLICY "CMS can manage projects"
  ON public.projects FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO public.admin_profiles (id, email, name, role)
VALUES ('598e1422-47f6-460b-995e-0b520ebb6f91', 'footazix@gmail.com', 'Footazix Owner', 'owner')
ON CONFLICT (id) DO UPDATE SET role = 'owner';`;

    navigator.clipboard.writeText(sql);
    setHasCopiedSql(true);
    setTimeout(() => setHasCopiedSql(false), 3000);
  };

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.client && p.client.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const publishedCount = projects.filter((p) => p.status === 'published' && p.visible !== false).length;
  const draftCount = projects.filter((p) => p.status === 'draft').length;
  const hiddenCount = projects.filter((p) => p.visible === false).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#090910] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">
              PORTFOLIO CMS CONTROL
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-display font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Portfolio Projects</span>
            <span className="text-xs font-mono font-normal text-zinc-400">
              ({projects.length} total)
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage video edits, custom aspect ratios (9:16, 16:9, etc.), and publishing states.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Supabase Health Check & Migration SQL Button */}
          <button
            type="button"
            onClick={() => setIsSqlModalOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#12121c] border border-white/10 hover:border-blue-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Supabase Database & RLS Settings"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Supabase SQL</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#12121c] border border-white/10">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Create Button */}
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-[0_0_16px_rgba(37,99,235,0.3)] cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#090910] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">Total Work</span>
            <span className="text-base font-bold text-white tabular-nums">{projects.length}</span>
          </div>
          <FolderKanban className="w-4 h-4 text-blue-400" />
        </div>
        <div className="p-3.5 rounded-xl bg-[#090910] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">Live & Visible</span>
            <span className="text-base font-bold text-emerald-400 tabular-nums">{publishedCount}</span>
          </div>
          <Eye className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="p-3.5 rounded-xl bg-[#090910] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">Drafts</span>
            <span className="text-base font-bold text-amber-400 tabular-nums">{draftCount}</span>
          </div>
          <EyeOff className="w-4 h-4 text-amber-400" />
        </div>
        <div className="p-3.5 rounded-xl bg-[#090910] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">Hidden</span>
            <span className="text-base font-bold text-zinc-400 tabular-nums">{hiddenCount}</span>
          </div>
          <EyeOff className="w-4 h-4 text-zinc-500" />
        </div>
      </div>

      {/* Status Alert Notification */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium ${
              statusMessage.type === 'success'
                ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                : 'bg-red-950/40 border-red-500/40 text-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#090910] border border-white/10">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, client, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#12121c] border border-white/10 text-white text-xs placeholder-zinc-500 outline-none focus:border-blue-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-white bg-[#12121c] border border-white/5'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-white bg-[#12121c] border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List/Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#090910] border border-white/10 space-y-3">
          <FolderKanban className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No portfolio projects found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {searchQuery || categoryFilter !== 'all'
              ? 'Try adjusting your search query or category filter.'
              : 'Add your first video project edit to showcase on the public website.'}
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer"
          >
            + Create First Project
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-2.5">
          {filteredProjects.map((project, idx) => {
            const videoRatio = project.videoAspectRatio || '16:9';
            const thumbRatio = project.thumbnailAspectRatio || '16:9';
            const isLive = project.status === 'published' && project.visible !== false;

            return (
              <div
                key={project.id}
                className="p-4 rounded-xl bg-[#090910] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Reorder Up/Down */}
                  <div className="flex flex-col gap-0.5 text-zinc-500 shrink-0">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className="p-1 rounded hover:text-white hover:bg-zinc-800 disabled:opacity-20 cursor-pointer"
                      title="Move up"
                      aria-label="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={idx === filteredProjects.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className="p-1 rounded hover:text-white hover:bg-zinc-800 disabled:opacity-20 cursor-pointer"
                      title="Move down"
                      aria-label="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail with selected Aspect Ratio Preview */}
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-zinc-900 shrink-0 border border-white/10 relative">
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {project.videoUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="w-3.5 h-3.5 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  {/* Info & Aspect Ratio Tags */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono uppercase text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30">
                        {project.category}
                      </span>
                      <h3 className="text-sm font-bold text-white truncate">
                        {project.title}
                      </h3>
                      {project.client && (
                        <span className="text-xs text-zinc-400 truncate hidden md:inline">
                          · {project.client}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/5 font-mono text-[10px]">
                        Video: {videoRatio}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/5 font-mono text-[10px]">
                        Thumb: {thumbRatio}
                      </span>
                      <span className="text-zinc-500 line-clamp-1 max-w-xs hidden lg:inline">
                        {project.description}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
                  {/* Publish State */}
                  <button
                    onClick={(e) => handleTogglePublish(project, e)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      project.status === 'published'
                        ? 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                        : 'bg-zinc-900 text-zinc-400 border border-white/10'
                    }`}
                    title="Toggle Published / Draft"
                  >
                    {project.status === 'published' ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span>Published</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                        <span>Draft</span>
                      </>
                    )}
                  </button>

                  {/* Visibility Toggle */}
                  <button
                    onClick={(e) => handleToggleVisible(project, e)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      project.visible !== false
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-900 text-zinc-500 border border-white/10'
                    }`}
                    title="Toggle Visible / Hidden on public site"
                  >
                    {project.visible !== false ? (
                      <>
                        <Eye className="w-3 h-3 text-emerald-400" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 text-zinc-500" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => openEditModal(project)}
                    className="p-2 rounded-lg text-zinc-300 hover:text-white bg-[#12121c] border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                    title="Edit project"
                    aria-label="Edit project"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setIsDeletingId(project.id)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-red-400 bg-[#12121c] border border-white/10 hover:border-red-500/30 transition-colors cursor-pointer"
                    title="Delete project"
                    aria-label="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const thumbAspectClass = getAspectClass(project.thumbnailAspectRatio || '16:9');
            const videoRatio = project.videoAspectRatio || '16:9';

            return (
              <div
                key={project.id}
                className="rounded-xl bg-[#090910] border border-white/10 hover:border-white/20 overflow-hidden transition-all flex flex-col justify-between group"
              >
                <div className={`relative ${thumbAspectClass} w-full overflow-hidden bg-zinc-900`}>
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono uppercase text-blue-400 font-semibold px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm border border-blue-500/40">
                      {project.category}
                    </span>
                    <span className="text-[9px] font-mono uppercase text-zinc-300 px-1.5 py-0.5 rounded bg-black/75 border border-white/10">
                      {videoRatio}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        project.status === 'published'
                          ? 'bg-blue-600 text-white'
                          : 'bg-black/75 text-zinc-400'
                      }`}
                    >
                      {project.status}
                    </span>
                    {project.visible === false && (
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/40">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-1">
                      {project.title}
                    </h3>
                    {project.client && (
                      <span className="text-[11px] text-zinc-400 block font-mono">
                        Client: {project.client}
                      </span>
                    )}
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleTogglePublish(project, e)}
                        className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                      >
                        {project.status === 'published' ? 'Draft' : 'Publish'}
                      </button>
                      <span className="text-zinc-600">·</span>
                      <button
                        onClick={(e) => handleToggleVisible(project, e)}
                        className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                      >
                        {project.visible !== false ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(project)}
                        className="p-1.5 rounded-lg text-zinc-300 hover:text-white bg-[#12121c] border border-white/10 cursor-pointer"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setIsDeletingId(project.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 bg-[#12121c] border border-white/10 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Project Modal with Live Aspect Ratio Previews */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto"
        >
          <div
            className="w-full max-w-4xl bg-[#0b0b14] border border-white/15 rounded-2xl p-5 sm:p-7 space-y-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase text-blue-400 tracking-wider font-bold">
                  PROJECT SPECIFICATION
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {editingProject ? 'Edit Portfolio Project' : 'Create New Portfolio Project'}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-[#12121c] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Form Fields (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. High-Retention Creator Reel"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Category & Client */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm outline-none focus:border-blue-500 cursor-pointer"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Client / Creator Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Modern Creator"
                        value={client}
                        onChange={(e) => setClient(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Description *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe the editing mechanics, pacing, visual resets, sound design..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs leading-relaxed outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  {/* Video URL & Video Upload */}
                  <div className="p-3.5 rounded-xl bg-[#12121c] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-blue-400" />
                        <span>Video Source (YouTube / Shorts / MP4)</span>
                      </label>

                      {/* Video File Upload */}
                      <input
                        type="file"
                        ref={videoFileInputRef}
                        accept="video/mp4,video/webm,video/quicktime"
                        className="hidden"
                        onChange={handleVideoUpload}
                      />
                      <button
                        type="button"
                        disabled={uploadingField === 'video'}
                        onClick={() => videoFileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:text-white bg-blue-950/40 border border-blue-500/30 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {uploadingField === 'video' ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3 h-3" />
                            <span>Upload Video MP4</span>
                          </>
                        )}
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="https://youtube.com/shorts/... or https://...mp4"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-black border border-white/10 text-white text-xs font-mono outline-none focus:border-blue-500"
                    />
                    <span className="text-[10px] text-zinc-500 block">
                      Supports YouTube standard, YouTube Shorts, Vimeo, or direct MP4 links from Supabase storage.
                    </span>
                  </div>

                  {/* Thumbnail Cover & Thumbnail Upload */}
                  <div className="p-3.5 rounded-xl bg-[#12121c] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span>Cover Thumbnail URL *</span>
                      </label>

                      {/* Thumbnail File Upload */}
                      <input
                        type="file"
                        ref={thumbnailFileInputRef}
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleThumbnailUpload}
                      />
                      <button
                        type="button"
                        disabled={uploadingField === 'cover'}
                        onClick={() => thumbnailFileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:text-white bg-blue-950/40 border border-blue-500/30 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {uploadingField === 'cover' ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3 h-3" />
                            <span>Upload Image</span>
                          </>
                        )}
                      </button>
                    </div>

                    <input
                      type="text"
                      required
                      placeholder="/assets/portfolio/project-01/cover.jpg or https://..."
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-black border border-white/10 text-white text-xs font-mono outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* 1. VIDEO ASPECT RATIO SELECTOR */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between">
                      <span>Video Aspect Ratio (Public Player)</span>
                      <span className="text-[10px] font-mono text-blue-400">{videoAspectRatio}</span>
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {ASPECT_RATIO_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setVideoAspectRatio(opt.id)}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                            videoAspectRatio === opt.id
                              ? 'bg-blue-600 border-blue-400 text-white shadow-sm'
                              : 'bg-[#12121c] border-white/10 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <span className="text-xs font-bold block">{opt.label}</span>
                          <span className="text-[9px] block truncate opacity-70">{opt.sub.split('/')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. THUMBNAIL ASPECT RATIO SELECTOR */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between">
                      <span>Thumbnail Aspect Ratio (Public Card)</span>
                      <span className="text-[10px] font-mono text-blue-400">{thumbnailAspectRatio}</span>
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {ASPECT_RATIO_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setThumbnailAspectRatio(opt.id)}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                            thumbnailAspectRatio === opt.id
                              ? 'bg-blue-600 border-blue-400 text-white shadow-sm'
                              : 'bg-[#12121c] border-white/10 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <span className="text-xs font-bold block">{opt.label}</span>
                          <span className="text-[9px] block truncate opacity-70">{opt.sub.split('/')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status, Visibility & Display Order */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-white/10">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-3 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                        Status (Published / Draft)
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                        className="w-full px-3 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                        Visibility (Visible / Hidden)
                      </label>
                      <select
                        value={visible ? 'true' : 'false'}
                        onChange={(e) => setVisible(e.target.value === 'true')}
                        className="w-full px-3 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="true">Visible on website</option>
                        <option value="false">Hidden from website</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Thumbnail & Video Aspect Ratio Preview (5 cols) */}
                <div className="lg:col-span-5 space-y-4 bg-[#07070d] p-4 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>Live Aspect Preview</span>
                    </span>

                    <div className="flex items-center p-0.5 rounded-lg bg-[#12121c] border border-white/10 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setPreviewTab('thumbnail')}
                        className={`px-2.5 py-1 rounded cursor-pointer ${
                          previewTab === 'thumbnail' ? 'bg-blue-600 text-white' : 'text-zinc-400'
                        }`}
                      >
                        Thumbnail ({thumbnailAspectRatio})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab('video')}
                        className={`px-2.5 py-1 rounded cursor-pointer ${
                          previewTab === 'video' ? 'bg-blue-600 text-white' : 'text-zinc-400'
                        }`}
                      >
                        Video ({videoAspectRatio})
                      </button>
                    </div>
                  </div>

                  {/* Stage Display Container */}
                  <div className="p-3 bg-black rounded-xl border border-white/5 flex flex-col items-center justify-center min-h-[300px]">
                    {previewTab === 'thumbnail' ? (
                      <div className="w-full max-w-[260px] mx-auto text-center space-y-2">
                        <div
                          className={`relative w-full ${getAspectClass(
                            thumbnailAspectRatio
                          )} rounded-lg overflow-hidden bg-zinc-900 border border-white/15 shadow-xl mx-auto`}
                        >
                          <img
                            src={coverImage || '/assets/portfolio/project-01/cover.jpg'}
                            alt={title || 'Preview'}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-black/80 text-white border border-white/20">
                              {category}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 block">
                          Card thumbnail will display in <strong className="text-white">{thumbnailAspectRatio}</strong>
                        </span>
                      </div>
                    ) : (
                      <div className="w-full max-w-[260px] mx-auto text-center space-y-2">
                        <div
                          className={`relative w-full ${getAspectClass(
                            videoAspectRatio
                          )} rounded-lg overflow-hidden bg-zinc-950 border border-blue-500/40 shadow-xl flex items-center justify-center mx-auto`}
                        >
                          {videoUrl ? (
                            <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-zinc-900">
                              <Play className="w-8 h-8 text-blue-500 fill-blue-500/20 mb-1" />
                              <span className="text-[10px] font-mono text-white truncate max-w-[180px]">
                                {videoUrl}
                              </span>
                            </div>
                          ) : (
                            <div className="p-4 text-center">
                              <Film className="w-8 h-8 text-zinc-600 mx-auto mb-1" />
                              <span className="text-[10px] font-mono text-zinc-500 block">
                                Enter Video URL to preview
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 block">
                          Lightbox player will format in <strong className="text-white">{videoAspectRatio}</strong> without cropping
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Summary Card Preview */}
                  <div className="p-3 rounded-lg bg-[#12121c] border border-white/5 space-y-1 text-xs">
                    <span className="text-[10px] font-mono uppercase text-blue-400 block font-bold">CARD PREVIEW SUMMARY</span>
                    <h4 className="text-white font-bold truncate">{title || 'Untitled Project'}</h4>
                    <span className="text-[11px] text-zinc-400 block truncate">{client || 'Client Name'}</span>
                    <p className="text-[11px] text-zinc-500 line-clamp-2">{description || 'Project description preview.'}</p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#12121c] border border-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 shadow-[0_0_16px_rgba(37,99,235,0.3)] transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <span>{editingProject ? 'Save Project' : 'Create Project'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeletingId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        >
          <div className="w-full max-w-md bg-[#0b0b14] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Delete Portfolio Project?</h3>
            <p className="text-xs text-zinc-400">
              Are you sure you want to delete this project? This will permanently delete the record from Supabase.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeletingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#12121c] border border-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(isDeletingId)}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-500 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supabase SQL Migration Helper Modal */}
      {isSqlModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        >
          <div
            className="w-full max-w-2xl bg-[#0b0b14] border border-white/15 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">SUPABASE DATABASE SETUP</span>
                <h3 className="text-base font-bold text-white">Portfolio Aspect Ratios & RLS Migration</h3>
              </div>
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-[#12121c] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              To allow seamless additions and edits to the <span className="font-mono text-blue-400">projects</span> table directly in Supabase with custom video & thumbnail aspect ratios and visibility flags, run this migration in your Supabase SQL Editor.
            </p>

            <div className="relative">
              <pre className="p-4 rounded-xl bg-black border border-white/10 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-60 leading-relaxed scrollbar-none">
{`-- 1. ADD COLUMNS FOR ASPECT RATIOS & VISIBILITY
ALTER TABLE IF EXISTS public.projects
  ADD COLUMN IF NOT EXISTS video_aspect_ratio TEXT DEFAULT '16:9',
  ADD COLUMN IF NOT EXISTS thumbnail_aspect_ratio TEXT DEFAULT '16:9',
  ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS project_url TEXT;

-- 2. UPDATE RLS POLICIES FOR FULL CMS PERSISTENCE
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;
CREATE POLICY "Public can view published projects"
  ON public.projects FOR SELECT
  TO anon, authenticated
  USING (
    (status = 'published' AND COALESCE(visible, true) = true)
    OR auth.role() = 'authenticated'
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;
DROP POLICY IF EXISTS "CMS can manage projects" ON public.projects;
CREATE POLICY "CMS can manage projects"
  ON public.projects FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 3. LINK OWNER PROFILE
INSERT INTO public.admin_profiles (id, email, name, role)
VALUES ('598e1422-47f6-460b-995e-0b520ebb6f91', 'footazix@gmail.com', 'Footazix Owner', 'owner')
ON CONFLICT (id) DO UPDATE SET role = 'owner';`}
              </pre>

              <button
                onClick={copySqlToClipboard}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                {hasCopiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
              <a
                href="https://supabase.com/dashboard/project/gdwlkqrzcixjajzvcwvg/sql"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5"
              >
                <span>Open Supabase SQL Editor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => {
                  checkHealth();
                  setIsSqlModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
