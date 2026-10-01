import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Service } from '../../types';
import { servicesService } from '../../services/servicesService';
import {
  BriefcaseBusiness,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Sparkles,
  X,
} from 'lucide-react';

export const AdminServices: React.FC = () => {
  const { services } = useApp();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Form fields
  const [number, setNumber] = useState('01');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [featuresStr, setFeaturesStr] = useState('');
  const [ctaText, setCtaText] = useState('REQUEST THIS SERVICE →');
  const [highlighted, setHighlighted] = useState(false);
  const [visible, setVisible] = useState(true);

  const openAdd = () => {
    setEditingService(null);
    setNumber(`0${services.length + 1}`);
    setTitle('');
    setDescription('');
    setFeaturesStr('Hook testing & ideation\nRetention editing\nSound design');
    setCtaText('REQUEST THIS SERVICE →');
    setHighlighted(false);
    setVisible(true);
    setIsModalOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditingService(s);
    setNumber(s.number);
    setTitle(s.title);
    setDescription(s.description);
    setFeaturesStr((s.features || []).join('\n'));
    setCtaText(s.ctaText || 'REQUEST THIS SERVICE →');
    setHighlighted(s.highlighted);
    setVisible(s.visible !== false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const features = featuresStr
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    if (editingService) {
      await servicesService.updateService(editingService.id, {
        number,
        title: title.trim(),
        description: description.trim(),
        features,
        ctaText: ctaText.trim(),
        highlighted,
        visible,
      });
      setStatusMessage('Service updated successfully.');
    } else {
      await servicesService.createService({
        number,
        title: title.trim(),
        description: description.trim(),
        features,
        ctaText: ctaText.trim(),
        highlighted,
        visible,
        order: services.length + 1,
      });
      setStatusMessage('New service created.');
    }

    setTimeout(() => setStatusMessage(''), 2500);
    closeModal();
  };

  const confirmDelete = async (id: string) => {
    await servicesService.deleteService(id);
    setIsDeletingId(null);
    setStatusMessage('Service deleted.');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleToggleVisible = async (s: Service) => {
    const newVis = !s.visible;
    await servicesService.updateService(s.id, { visible: newVis });
    setStatusMessage(`Service marked as ${newVis ? 'visible' : 'hidden'}.`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;

    const newServices = [...services];
    const temp = newServices[index];
    newServices[index] = newServices[targetIndex];
    newServices[targetIndex] = temp;

    const orderedIds = newServices.map((s) => s.id);
    await servicesService.reorderServices(orderedIds);
    setStatusMessage('Services order updated.');
    setTimeout(() => setStatusMessage(''), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#090910] border border-white/10">
        <div>
          <h2 className="text-base sm:text-lg font-display font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Services CMS</span>
            <span className="text-xs font-mono font-normal text-zinc-400">
              ({services.length} active)
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage your service offerings, feature bullet points, and CTA actions shown on the public site.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {statusMessage && (
            <span className="text-xs text-blue-400 font-medium animate-in fade-in">
              {statusMessage}
            </span>
          )}

          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-[0_0_16px_rgba(37,99,235,0.3)] cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {services.map((service, idx) => (
          <div
            key={service.id}
            className="p-4 sm:p-5 rounded-xl bg-[#090910] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-4 min-w-0">
              {/* Reorder Buttons */}
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
                  disabled={idx === services.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="p-1 rounded hover:text-white hover:bg-zinc-800 disabled:opacity-20 cursor-pointer"
                  title="Move down"
                  aria-label="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Number Badge */}
              <div className="w-11 h-11 rounded-xl bg-[#12121c] border border-white/10 text-blue-400 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                {service.number}
              </div>

              {/* Info */}
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white truncate">
                    {service.title}
                  </h3>
                  {service.highlighted && (
                    <span className="text-[10px] font-mono text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 line-clamp-1 max-w-xl">
                  {service.description}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {service.features.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="text-[10px] text-zinc-400 px-2 py-0.5 rounded bg-[#12121c] border border-white/5 font-normal"
                    >
                      {f}
                    </span>
                  ))}
                  {service.features.length > 3 && (
                    <span className="text-[10px] text-zinc-500 font-mono">
                      +{service.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => handleToggleVisible(service)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  service.visible !== false
                    ? 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                    : 'bg-zinc-900 text-zinc-400 border border-white/10'
                }`}
                title="Toggle Visibility"
              >
                {service.visible !== false ? (
                  <>
                    <Eye className="w-3 h-3 text-blue-400" />
                    <span>Visible</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3 h-3 text-zinc-400" />
                    <span>Hidden</span>
                  </>
                )}
              </button>

              <button
                onClick={() => openEdit(service)}
                className="p-2 rounded-lg text-zinc-300 hover:text-white bg-[#12121c] border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                title="Edit service"
                aria-label="Edit service"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsDeletingId(service.id)}
                className="p-2 rounded-lg text-zinc-400 hover:text-red-400 bg-[#12121c] border border-white/10 hover:border-red-500/30 transition-colors cursor-pointer"
                title="Delete service"
                aria-label="Delete service"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div
            className="w-full max-w-lg bg-[#0b0b14] border border-white/15 rounded-2xl p-6 sm:p-7 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {editingService ? 'Edit Service' : 'Add Service'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg text-zinc-400 hover:text-white bg-[#12121c]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Index *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="01"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm font-mono outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIDEO EDITING"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="High-retention short-form and long-form video editing engineered to capture attention..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Deliverable Features (One per line)
                </label>
                <textarea
                  rows={4}
                  placeholder="Pacing & Retention Hooks&#10;Motion Graphics & Subtitles&#10;Sound Design"
                  value={featuresStr}
                  onChange={(e) => setFeaturesStr(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={highlighted}
                    onChange={(e) => setHighlighted(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-blue-600"
                  />
                  <span>Featured Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) => setVisible(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-blue-600"
                  />
                  <span>Visible on site</span>
                </label>
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
                  {editingService ? 'Save Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeletingId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="w-full max-w-md bg-[#0b0b14] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Delete Service Offering?</h3>
            <p className="text-xs text-zinc-400">
              Are you sure you want to delete this service? It will be removed from the public website and Supabase.
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
