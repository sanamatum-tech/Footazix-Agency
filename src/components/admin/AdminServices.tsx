import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Service } from '../../types';
import { servicesService } from '../../services/servicesService';

export const AdminServices: React.FC = () => {
  const { services } = useApp();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Form fields
  const [number, setNumber] = useState('01');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [featuresStr, setFeaturesStr] = useState('');
  const [ctaText, setCtaText] = useState('START THIS SERVICE');
  const [highlighted, setHighlighted] = useState(false);
  const [visible, setVisible] = useState(true);

  const openAdd = () => {
    setEditingService(null);
    setNumber(`0${services.length + 1}`);
    setTitle('');
    setDescription('');
    setFeaturesStr('Hook testing & ideation\nRetention editing\nSound design');
    setCtaText('START THIS SERVICE');
    setHighlighted(false);
    setVisible(true);
    setIsAddingNew(true);
  };

  const openEdit = (s: Service) => {
    setEditingService(s);
    setNumber(s.number);
    setTitle(s.title);
    setDescription(s.description);
    setFeaturesStr((s.features || []).join('\n'));
    setCtaText(s.ctaText || 'START THIS SERVICE');
    setHighlighted(s.highlighted);
    setVisible(s.visible !== false);
    setIsAddingNew(true);
  };

  const closeModal = () => {
    setIsAddingNew(false);
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
      setStatusMessage('New service added.');
    }

    setTimeout(() => setStatusMessage(''), 2500);
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this service?')) {
      await servicesService.deleteService(id);
      setStatusMessage('Service removed.');
      setTimeout(() => setStatusMessage(''), 2500);
    }
  };

  const handleToggleVisible = async (s: Service) => {
    await servicesService.updateService(s.id, { visible: !s.visible });
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= services.length) return;

    const copy = [...services];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;

    await servicesService.reorderServices(copy.map((c) => c.id));
  };

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-950 border border-white/10">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight">
            Services CMS
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage agency service offerings (Video Editing, Content, Growth).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {statusMessage && (
            <span className="text-xs font-medium text-blue-400 animate-in fade-in">
              {statusMessage}
            </span>
          )}

          <button
            onClick={openAdd}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all glow-blue-sm cursor-pointer"
          >
            + ADD SERVICE
          </button>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {services.map((srv, idx) => (
          <div
            key={srv.id}
            className="p-5 rounded-xl bg-zinc-950 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              {/* Order controls */}
              <div className="flex flex-col gap-1 text-zinc-500">
                <button
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                >
                  ▲
                </button>
                <button
                  disabled={idx === services.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                >
                  ▼
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-blue-400 font-bold">
                    {srv.number}
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {srv.title}
                  </h3>
                  {srv.highlighted && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-500/40">
                      Primary
                    </span>
                  )}
                  {srv.visible === false && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                  {srv.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => handleToggleVisible(srv)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-white/10"
              >
                {srv.visible !== false ? 'Hide' : 'Show'}
              </button>

              <button
                onClick={() => openEdit(srv)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(srv.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/30 border border-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isAddingNew && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg bg-zinc-950 border border-white/15 rounded-2xl p-6 sm:p-8 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={closeModal} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Number
                  </label>
                  <input
                    type="text"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. VIDEO EDITING"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Features (One per line)
                </label>
                <textarea
                  rows={3}
                  value={featuresStr}
                  onChange={(e) => setFeaturesStr(e.target.value)}
                  placeholder="Hook construction\nPacing & sound design\nColor grade"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={highlighted}
                    onChange={(e) => setHighlighted(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-blue-600"
                  />
                  <span>Highlight as Primary Service</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) => setVisible(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-blue-600"
                  />
                  <span>Visible on Website</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
