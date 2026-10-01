import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Project, ProjectCategory } from '../../types';
import { portfolioService } from '../../services/portfolioService';

const CATEGORIES: ProjectCategory[] = ['Reels', 'Shorts', 'YouTube', 'Brand', 'Motion', 'Other'];

export const AdminPortfolio: React.FC = () => {
  const { projects } = useApp();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Reels');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('/assets/portfolio/project-01/cover.jpg');
  const [videoUrl, setVideoUrl] = useState('');
  const [client, setClient] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  const openAddModal = () => {
    setTitle('');
    setCategory('Reels');
    setDescription('');
    setCoverImage('/assets/portfolio/project-01/cover.jpg');
    setVideoUrl('');
    setClient('');
    setStatus('published');
    setEditingProject(null);
    setIsAddingNew(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setTitle(p.title);
    setCategory(p.category);
    setDescription(p.description);
    setCoverImage(p.coverImage);
    setVideoUrl(p.videoUrl || '');
    setClient(p.client || '');
    setStatus(p.status);
    setIsAddingNew(true);
  };

  const closeModal = () => {
    setIsAddingNew(false);
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
        videoUrl,
        client: client.trim() || undefined,
        status,
      });
      setStatusMessage('Project updated successfully.');
    } else {
      await portfolioService.createProject({
        title: title.trim(),
        category,
        description: description.trim(),
        coverImage,
        videoUrl,
        client: client.trim() || undefined,
        status,
        displayOrder: projects.length + 1,
      });
      setStatusMessage('New project added to portfolio.');
    }

    setTimeout(() => setStatusMessage(''), 3000);
    closeModal();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      await portfolioService.deleteProject(id);
      setStatusMessage('Project deleted.');
      setTimeout(() => setStatusMessage(''), 2500);
    }
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

    const copy = [...projects];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    await portfolioService.reorderProjects(copy.map((c) => c.id));
  };

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-950 border border-white/10">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight">
            Portfolio Projects CMS
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Add, edit, reorder, or publish video editing showcase projects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {statusMessage && (
            <span className="text-xs font-medium text-blue-400 animate-in fade-in duration-150">
              {statusMessage}
            </span>
          )}

          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all glow-blue-sm cursor-pointer flex items-center gap-2"
          >
            <span>+ ADD PROJECT</span>
          </button>
        </div>
      </div>

      {/* Projects List or Empty State */}
      {projects.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-white mb-1">No projects yet.</h3>
          <p className="text-xs text-zinc-400 mb-4">
            Add your first project from the Portfolio button above.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase bg-blue-600 text-white"
          >
            + Add First Project
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project, idx) => (
            <div
              key={project.id}
              className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-1 text-zinc-500">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    disabled={idx === projects.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Move down"
                  >
                    ▼
                  </button>
                </div>

                {/* Thumbnail */}
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-zinc-900 shrink-0 border border-white/10">
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-blue-400">
                      {project.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        project.status === 'published'
                          ? 'bg-blue-600/30 text-blue-300'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {project.status}
                    </span>
                    {project.client && (
                      <span className="text-xs text-zinc-500">
                        • {project.client}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-1 max-w-lg">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={(e) => handleTogglePublish(project, e)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-white/10 transition-colors cursor-pointer"
                >
                  {project.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>

                <button
                  onClick={() => openEditModal(project)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer"
                >
                  Edit
                </button>

                <button
                  onClick={(e) => handleDelete(project.id, e)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/30 border border-red-500/20 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {isAddingNew && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-xl bg-zinc-950 border border-white/15 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-display font-bold text-white">
                {editingProject ? 'Edit Project' : 'Add New Portfolio Project'}
              </h3>
              <button onClick={closeModal} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Creator Short-Form Retention Reel"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-zinc-950">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="published" className="bg-zinc-950">Published</option>
                    <option value="draft" className="bg-zinc-950">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Short Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="One or two sentences highlighting the editing style, sound design, and retention pacing."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Cover Image URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="/assets/portfolio/project-01/cover.jpg or web URL"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Client / Brand (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Creator / Brand name"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Video URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Video link"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 glow-blue-sm"
                >
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
