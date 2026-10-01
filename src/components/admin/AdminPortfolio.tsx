import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Project, ProjectCategory } from '../../types';
import { portfolioService } from '../../services/portfolioService';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES: ProjectCategory[] = ['Reels', 'Shorts', 'YouTube', 'Brand', 'Motion', 'Other'];

export const AdminPortfolio: React.FC = () => {
  const { projects } = useApp();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Reels');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('/assets/portfolio/project-01/cover.jpg');
  const [videoUrl, setVideoUrl] = useState('');
  const [client, setClient] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const openAddModal = () => {
    setTitle('');
    setCategory('Reels');
    setDescription('');
    setCoverImage('/assets/portfolio/project-01/cover.jpg');
    setVideoUrl('');
    setClient('');
    setProjectUrl('');
    setStatus('published');
    setEditingProject(null);
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
    setStatus(p.status);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    if (editingProject) {
      await portfolioService.updateProject(editingProject.id, {
        title: title.trim(),
        category,
        description: description.trim(),
        coverImage,
        videoUrl: videoUrl.trim() || undefined,
        client: client.trim() || undefined,
        projectUrl: projectUrl.trim() || undefined,
        status,
      });
      setStatusMessage('Project updated successfully.');
    } else {
      await portfolioService.createProject({
        title: title.trim(),
        category,
        description: description.trim(),
        coverImage,
        videoUrl: videoUrl.trim() || undefined,
        client: client.trim() || undefined,
        projectUrl: projectUrl.trim() || undefined,
        status,
        displayOrder: projects.length + 1,
      });
      setStatusMessage('New project created.');
    }

    setTimeout(() => setStatusMessage(''), 2500);
    closeModal();
  };

  const confirmDelete = async (id: string) => {
    await portfolioService.deleteProject(id);
    setIsDeletingId(null);
    setStatusMessage('Project deleted.');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleTogglePublish = async (p: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = p.status === 'published' ? 'draft' : 'published';
    await portfolioService.updateProject(p.id, { status: newStatus });
    setStatusMessage(`Project marked as ${newStatus}.`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const newProjects = [...projects];
    const temp = newProjects[index];
    newProjects[index] = newProjects[targetIndex];
    newProjects[targetIndex] = temp;

    const orderedIds = newProjects.map((p) => p.id);
    await portfolioService.reorderProjects(orderedIds);
    setStatusMessage('Display order updated.');
    setTimeout(() => setStatusMessage(''), 2000);
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#090910] border border-white/10">
        <div>
          <h2 className="text-base sm:text-lg font-display font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Portfolio Projects</span>
            <span className="text-xs font-mono font-normal text-zinc-400">
              ({projects.length} total)
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage high-retention video edits showcased on the public website.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {statusMessage && (
            <span className="text-xs text-blue-400 font-medium animate-in fade-in">
              {statusMessage}
            </span>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#12121c] border border-white/10">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-[0_0_16px_rgba(37,99,235,0.3)] cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#090910] border border-white/10">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by title, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#12121c] border border-white/10 text-white text-xs placeholder-zinc-500 outline-none focus:border-blue-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
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
          <h3 className="text-sm font-bold text-white">No projects found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {searchQuery || categoryFilter !== 'all'
              ? 'Try adjusting your search query or category filter.'
              : 'Add your first high-retention video project showcase.'}
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            + Create First Project
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-2.5">
          {filteredProjects.map((project, idx) => (
            <div
              key={project.id}
              className="p-4 rounded-xl bg-[#090910] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Reorder Up/Down */}
                <div className="flex flex-col gap-0.5 text-zinc-500">
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

                {/* Thumbnail */}
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

                {/* Info */}
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30">
                      {project.category}
                    </span>
                    <h3 className="text-sm font-bold text-white truncate">
                      {project.title}
                    </h3>
                    {project.client && (
                      <span className="text-xs text-zinc-500 truncate hidden md:inline">
                        · {project.client}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1 max-w-xl">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
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
                      <Eye className="w-3 h-3 text-blue-400" />
                      <span>Live</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 text-zinc-400" />
                      <span>Draft</span>
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
          ))}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl bg-[#090910] border border-white/10 hover:border-white/20 overflow-hidden transition-all flex flex-col justify-between group"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
                <img
                  src={project.coverImage}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="text-[10px] font-mono uppercase text-blue-400 font-semibold px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-blue-500/40">
                    {project.category}
                  </span>
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      project.status === 'published'
                        ? 'bg-blue-600 text-white'
                        : 'bg-black/70 text-zinc-400'
                    }`}
                  >
                    {project.status}
                  </span>
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
                  <button
                    onClick={(e) => handleTogglePublish(project, e)}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    {project.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(project)}
                      className="p-1.5 rounded-lg text-zinc-300 hover:text-white bg-[#12121c] border border-white/10"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsDeletingId(project.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 bg-[#12121c] border border-white/10"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div
            className="w-full max-w-xl bg-[#0b0b14] border border-white/15 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg text-zinc-400 hover:text-white bg-[#12121c]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Creator Retention Reel"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Client Name (Optional)
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

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain the editing mechanics, pacing, sound design..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Cover Thumbnail URL *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="/assets/portfolio/project-01/cover.jpg"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Video URL (MP4 / Direct)
                  </label>
                  <input
                    type="text"
                    placeholder="https://...mp4 or YouTube"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    External Project URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://instagram.com/..."
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Publish Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm outline-none focus:border-blue-500"
                  >
                    <option value="published">Published (Visible on site)</option>
                    <option value="draft">Draft (Private admin only)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#12121c] border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_16px_rgba(37,99,235,0.3)] transition-colors"
                >
                  {editingProject ? 'Save Project' : 'Create Project'}
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="w-full max-w-md bg-[#0b0b14] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Delete Portfolio Project?</h3>
            <p className="text-xs text-zinc-400">
              Are you sure you want to delete this project? This will permanently remove it from Supabase.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeletingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#12121c] border border-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(isDeletingId)}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
