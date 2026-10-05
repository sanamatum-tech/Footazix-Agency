import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FAQ } from '../../types';
import {
  HelpCircle,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export const AdminFAQ: React.FC = () => {
  const { faqs, createFAQ, updateFAQ, deleteFAQ, reorderFAQs } = useApp();
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isSaving, setIsSaving] = useState(false);

  // Form fields
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('General');
  const [order, setOrder] = useState<number>(1);
  const [published, setPublished] = useState(true);
  const [visible, setVisible] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set(faqs.map((f) => f.category));
    return ['ALL', ...Array.from(set)];
  }, [faqs]);

  // Filtered & sorted FAQs
  const sortedFaqs = useMemo(() => {
    return [...faqs].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    let result = sortedFaqs;
    if (selectedCategory !== 'ALL') {
      result = result.filter((f) => f.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [sortedFaqs, selectedCategory, searchQuery]);

  const openAdd = () => {
    setEditingFAQ(null);
    setQuestion('');
    setAnswer('');
    setCategory('General');
    setOrder(sortedFaqs.length + 1);
    setPublished(true);
    setVisible(true);
    setFeatured(false);
    setCtaText('');
    setCtaUrl('');
    setIsModalOpen(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category || 'General');
    setOrder(faq.order || 1);
    setPublished(faq.published !== false);
    setVisible(faq.visible !== false);
    setFeatured(Boolean(faq.featured));
    setCtaText(faq.ctaText || '');
    setCtaUrl(faq.ctaUrl || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFAQ(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      showToast('Question and answer are required.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingFAQ) {
        await updateFAQ(editingFAQ.id, {
          question: question.trim(),
          answer: answer.trim(),
          category: category.trim() || 'General',
          order,
          published,
          visible,
          featured,
          ctaText: ctaText.trim() || undefined,
          ctaUrl: ctaUrl.trim() || undefined,
        });
        showToast('FAQ updated successfully.');
      } else {
        await createFAQ({
          question: question.trim(),
          answer: answer.trim(),
          category: category.trim() || 'General',
          order,
          published,
          visible,
          featured,
          ctaText: ctaText.trim() || undefined,
          ctaUrl: ctaUrl.trim() || undefined,
        });
        showToast('New FAQ created.');
      }
      closeModal();
    } catch {
      showToast('Error saving FAQ.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteFAQ(id);
    setDeletingId(null);
    showToast('FAQ deleted.');
  };

  const toggleVisible = async (faq: FAQ) => {
    const updated = !faq.visible;
    await updateFAQ(faq.id, { visible: updated });
    showToast(`FAQ ${updated ? 'visible on site' : 'hidden from public view'}.`);
  };

  const togglePublished = async (faq: FAQ) => {
    const updated = !faq.published;
    await updateFAQ(faq.id, { published: updated });
    showToast(`FAQ ${updated ? 'published' : 'moved to draft'}.`);
  };

  const moveUp = async (index: number) => {
    if (index <= 0) return;
    const newItems = [...sortedFaqs];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    await reorderFAQs(newItems.map((f) => f.id));
    showToast('FAQ reordered.');
  };

  const moveDown = async (index: number) => {
    if (index >= sortedFaqs.length - 1) return;
    const newItems = [...sortedFaqs];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    await reorderFAQs(newItems.map((f) => f.id));
    showToast('FAQ reordered.');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#090910] border border-white/10">
        <div>
          <h2 className="text-base sm:text-lg font-display font-extrabold text-white tracking-tight flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-400" />
            <span>FAQ Management</span>
            <span className="text-xs font-mono font-normal text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              {faqs.length} Total
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage the frequently asked questions displayed in the public accordion. All edits sync live to Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {toastMessage && (
            <span className="text-xs text-blue-400 font-medium animate-in fade-in flex items-center gap-1.5 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{toastMessage}</span>
            </span>
          )}

          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-[0_0_16px_rgba(37,99,235,0.3)] cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>ADD NEW FAQ</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#090910] border border-white/10">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions or answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#12121c] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-[#12121c] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs List */}
      {filteredFaqs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#090910] border border-white/10 space-y-3">
          <HelpCircle className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-sm font-semibold text-zinc-400">No FAQs match your search.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
            className="text-xs text-blue-400 hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const actualIndex = sortedFaqs.findIndex((f) => f.id === faq.id);
            return (
              <div
                key={faq.id}
                className={`p-5 rounded-2xl bg-[#090910] border transition-all duration-200 flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                  !faq.published || !faq.visible
                    ? 'border-white/5 opacity-60'
                    : 'border-white/10 hover:border-blue-500/30'
                }`}
              >
                {/* Left: Reorder & Info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Reordering Buttons */}
                  <div className="flex flex-col gap-1 shrink-0 pt-0.5">
                    <button
                      type="button"
                      onClick={() => moveUp(actualIndex)}
                      disabled={actualIndex === 0}
                      className="p-1 rounded bg-[#12121c] border border-white/10 text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(actualIndex)}
                      disabled={actualIndex === sortedFaqs.length - 1}
                      className="p-1 rounded bg-[#12121c] border border-white/10 text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* FAQ Content */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold">
                        #{faq.order || actualIndex + 1}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                        {faq.category}
                      </span>
                      {faq.published ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          Published
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                          Draft
                        </span>
                      )}
                      {!faq.visible && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">
                          Hidden
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white leading-snug">
                      {faq.question}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                      {faq.answer}
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-start pt-1">
                  {/* Toggle Published */}
                  <button
                    type="button"
                    onClick={() => togglePublished(faq)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-semibold transition-colors cursor-pointer border ${
                      faq.published
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-400 border-white/10 hover:text-white'
                    }`}
                    title={faq.published ? 'Click to unpublish' : 'Click to publish'}
                  >
                    {faq.published ? 'Published' : 'Draft'}
                  </button>

                  {/* Toggle Visible */}
                  <button
                    type="button"
                    onClick={() => toggleVisible(faq)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer border ${
                      faq.visible
                        ? 'bg-[#12121c] text-blue-400 border-blue-500/30 hover:bg-blue-600/10'
                        : 'bg-zinc-900 text-zinc-500 border-white/5 hover:text-zinc-300'
                    }`}
                    title={faq.visible ? 'Visible on website' : 'Hidden from website'}
                  >
                    {faq.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => openEdit(faq)}
                    className="p-2 rounded-lg bg-[#12121c] border border-white/10 text-zinc-300 hover:text-white hover:border-blue-500/40 transition-colors cursor-pointer"
                    title="Edit FAQ"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => setDeletingId(faq.id)}
                    className="p-2 rounded-lg bg-[#12121c] border border-white/10 text-zinc-400 hover:text-red-400 hover:border-red-500/40 transition-colors cursor-pointer"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b0e14] border border-white/15 rounded-2xl max-w-xl w-full p-6 space-y-5 my-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                <span>{editingFAQ ? 'Edit FAQ Item' : 'Add New FAQ Item'}</span>
              </h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Can I send my raw footage to Footazix?"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Answer *
                </label>
                <textarea
                  required
                  rows={5}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Detailed, helpful answer explaining the process or service..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm outline-none focus:border-blue-500 leading-relaxed resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="General">General</option>
                    <option value="Services">Services</option>
                    <option value="Process">Process</option>
                    <option value="Strategy">Strategy</option>
                    <option value="Pricing">Pricing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-[#12121c] border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Published</span>
                    <span className="text-[11px] text-zinc-400">Available to public view</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-[#12121c] border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) => setVisible(e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Visible</span>
                    <span className="text-[11px] text-zinc-400">Shown in accordion</span>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white bg-[#12121c] border border-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-[0_0_16px_rgba(37,99,235,0.3)] cursor-pointer"
                >
                  {isSaving ? 'SAVING...' : editingFAQ ? 'SAVE CHANGES' : 'CREATE FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0e14] border border-red-500/30 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-white">Delete FAQ?</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to delete this FAQ? It will be removed immediately from the public website.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-[#12121c] border border-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-500 transition-colors cursor-pointer"
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
