import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { editorService } from '../../services/editorService';
import {
  Editor,
  EditorAssignment,
  EditorAssignmentStatus,
  EditorAssignmentPriority,
  EditorRole,
} from '../../types';
import {
  Users,
  Film,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
  Send,
  Trash2,
  Edit2,
  Check,
  Eye,
  FolderOpen,
  MessageSquare,
  Sparkles,
  X,
  Play,
  RotateCcw,
  Mail,
  UserCheck,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminEditors: React.FC = () => {
  const { navigateToEditors } = useApp();

  const [activeTab, setActiveTab] = useState<'assignments' | 'roster'>('assignments');
  const [editors, setEditors] = useState<Editor[]>([]);
  const [assignments, setAssignments] = useState<EditorAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editorFilter, setEditorFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddEditorOpen, setIsAddEditorOpen] = useState(false);
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [reviewModalTask, setReviewModalTask] = useState<EditorAssignment | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState('');

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Form states: New Editor
  const [editorName, setEditorName] = useState('');
  const [editorEmail, setEditorEmail] = useState('');
  const [editorRole, setEditorRole] = useState<EditorRole>('editor');
  const [editorSpecialties, setEditorSpecialties] = useState('High-Retention Reels, Sound Design');
  const [editorSoftware, setEditorSoftware] = useState('Premiere Pro, After Effects');
  const [editorBio, setEditorBio] = useState('');

  // Form states: New Assignment
  const [assignTitle, setAssignTitle] = useState('');
  const [assignClient, setAssignClient] = useState('');
  const [assignEditorId, setAssignEditorId] = useState('');
  const [assignFormat, setAssignFormat] = useState('9:16 Reel');
  const [assignPriority, setAssignPriority] = useState<EditorAssignmentPriority>('normal');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignTargetDuration, setAssignTargetDuration] = useState('30 - 45s');
  const [assignRawFootage, setAssignRawFootage] = useState('');
  const [assignAssetFolder, setAssignAssetFolder] = useState('');
  const [assignBrief, setAssignBrief] = useState('');
  const [assignStyleNotes, setAssignStyleNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [eds, asgns] = await Promise.all([
        editorService.getEditors(),
        editorService.getAssignments(),
      ]);
      setEditors(eds);
      setAssignments(asgns);
      if (eds.length > 0 && !assignEditorId) {
        setAssignEditorId(eds[0].id);
      }
    } catch (err) {
      console.error('Error loading editor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = editorService.subscribe(() => {
      loadData();
    });
    return unsub;
  }, []);

  // Filtered assignments
  const filteredAssignments = assignments.filter((a) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'review_needed'
        ? a.status === 'review_needed'
        : statusFilter === 'in_progress'
        ? a.status === 'in_progress'
        : statusFilter === 'approved'
        ? a.status === 'approved' || a.status === 'completed'
        : a.status === statusFilter;

    const matchesEditor = editorFilter === 'all' ? true : a.editorId === editorFilter;

    const matchesSearch =
      !searchQuery.trim() ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.editorName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesEditor && matchesSearch;
  });

  // KPI calculations
  const totalEditors = editors.length;
  const inProgressCount = assignments.filter((a) => a.status === 'in_progress').length;
  const reviewNeededCount = assignments.filter((a) => a.status === 'review_needed').length;
  const completedCount = assignments.filter((a) => a.status === 'approved' || a.status === 'completed').length;

  const handleCreateEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorName.trim() || !editorEmail.trim()) {
      showToast('Name and email are required.');
      return;
    }

    try {
      await editorService.createEditor({
        name: editorName.trim(),
        email: editorEmail.trim().toLowerCase(),
        role: editorRole,
        status: 'active',
        specialties: editorSpecialties.split(',').map((s) => s.trim()).filter(Boolean),
        software: editorSoftware.split(',').map((s) => s.trim()).filter(Boolean),
        bio: editorBio.trim(),
        turnaroundHoursAvg: 24,
      });

      showToast(`Editor "${editorName}" added to the roster!`);
      setIsAddEditorOpen(false);
      setEditorName('');
      setEditorEmail('');
      setEditorBio('');
      await loadData();
    } catch (err) {
      showToast('Failed to create editor.');
    }
  };

  const handleDeleteEditor = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the editor roster?`)) {
      try {
        await editorService.deleteEditor(id);
        showToast(`Editor ${name} removed.`);
        await loadData();
      } catch (err) {
        showToast('Failed to delete editor.');
      }
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim() || !assignClient.trim() || !assignBrief.trim()) {
      showToast('Please fill in title, client name, and project brief.');
      return;
    }

    const assignedEd = editors.find((e) => e.id === assignEditorId) || editors[0];

    try {
      await editorService.createAssignment({
        title: assignTitle.trim(),
        clientName: assignClient.trim(),
        editorId: assignedEd?.id || 'editor-unassigned',
        editorName: assignedEd?.name || 'Unassigned',
        format: assignFormat,
        status: 'assigned',
        priority: assignPriority,
        dueDate: assignDueDate || new Date(Date.now() + 3 * 86400000).toISOString(),
        targetDuration: assignTargetDuration.trim(),
        rawFootageUrl: assignRawFootage.trim() || 'https://drive.google.com',
        assetFolderUrl: assignAssetFolder.trim() || undefined,
        brief: assignBrief.trim(),
        styleNotes: assignStyleNotes.trim() || undefined,
      });

      showToast(`Assignment "${assignTitle}" dispatched to ${assignedEd?.name}!`);
      setIsAddAssignmentOpen(false);
      // Reset form
      setAssignTitle('');
      setAssignClient('');
      setAssignBrief('');
      setAssignRawFootage('');
      setAssignAssetFolder('');
      setAssignStyleNotes('');
      await loadData();
    } catch (err) {
      showToast('Failed to create assignment.');
    }
  };

  const handleDeleteAssignment = async (id: string, title: string) => {
    if (window.confirm(`Delete assignment "${title}"?`)) {
      try {
        await editorService.deleteAssignment(id);
        showToast('Assignment deleted.');
        await loadData();
      } catch (err) {
        showToast('Failed to delete assignment.');
      }
    }
  };

  const handleApproveCut = async (task: EditorAssignment) => {
    try {
      await editorService.updateAssignmentStatus(task.id, 'approved', 'Approved by Creative Director. Master delivery accepted.');
      showToast(`Cut for "${task.title}" approved!`);
      setReviewModalTask(null);
      await loadData();
    } catch (err) {
      showToast('Failed to approve cut.');
    }
  };

  const handleRequestRevision = async (task: EditorAssignment) => {
    if (!revisionFeedback.trim()) {
      showToast('Please write timestamped revision feedback.');
      return;
    }
    try {
      await editorService.updateAssignmentStatus(task.id, 'revision_requested', revisionFeedback.trim());
      showToast(`Revisions requested for "${task.title}".`);
      setReviewModalTask(null);
      setRevisionFeedback('');
      await loadData();
    } catch (err) {
      showToast('Failed to request revisions.');
    }
  };

  const formatDueDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-[#0d0d18] border border-blue-500/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium"
          >
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0b0b12] border border-white/5 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Film className="w-4 h-4" />
            <span>Post-Production Operations</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white">
            Editor Roster & Video Dispatch
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your post-production editing team, assign client projects, review draft cuts, and supervise delivery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigateToEditors()}
            className="px-4 py-2.5 rounded-xl bg-[#12121c] hover:bg-[#1a1a2a] border border-blue-500/30 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Launch the dedicated Editor Workspace (/editors)"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Launch Editor Portal (/editors)</span>
          </button>

          <button
            onClick={() => setIsAddEditorOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Editor</span>
          </button>

          <button
            onClick={() => setIsAddAssignmentOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Video Assignment</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0b0b12] border border-white/5 rounded-2xl p-4">
          <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Active Editors</span>
          <span className="text-2xl font-bold text-white font-display tabular-nums">{totalEditors}</span>
          <span className="text-[11px] text-zinc-500 block mt-0.5">On the Footazix crew</span>
        </div>

        <div className="bg-[#0b0b12] border border-white/5 rounded-2xl p-4">
          <span className="text-[10px] font-mono uppercase text-blue-400 block mb-1">In Progress</span>
          <span className="text-2xl font-bold text-blue-400 font-display tabular-nums">{inProgressCount}</span>
          <span className="text-[11px] text-zinc-500 block mt-0.5">Videos on the timeline</span>
        </div>

        <div className="bg-[#0b0b12] border border-white/5 rounded-2xl p-4">
          <span className="text-[10px] font-mono uppercase text-amber-400 block mb-1">Pending Review</span>
          <span className="text-2xl font-bold text-amber-400 font-display tabular-nums">{reviewNeededCount}</span>
          <span className="text-[11px] text-zinc-500 block mt-0.5">Drafts awaiting approval</span>
        </div>

        <div className="bg-[#0b0b12] border border-white/5 rounded-2xl p-4">
          <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Completed / Approved</span>
          <span className="text-2xl font-bold text-zinc-200 font-display tabular-nums">{completedCount}</span>
          <span className="text-[11px] text-zinc-500 block mt-0.5">Ready for client release</span>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'assignments'
              ? 'bg-blue-600 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Assignments Queue ({assignments.length})</span>
          {reviewNeededCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono">
              {reviewNeededCount} in review
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'roster'
              ? 'bg-blue-600 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Editors Roster ({editors.length})</span>
        </button>
      </div>

      {/* TAB 1: ASSIGNMENTS DISPATCH */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {/* Controls: Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0b0b12] p-3 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 overflow-x-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#12121c] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="review_needed">Review Needed</option>
                <option value="approved">Approved</option>
              </select>

              <select
                value={editorFilter}
                onChange={(e) => setEditorFilter(e.target.value)}
                className="bg-[#12121c] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Editors</option>
                {editors.map((ed) => (
                  <option key={ed.id} value={ed.id}>
                    {ed.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assignments..."
                className="w-full bg-[#12121c] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Assignments Table */}
          {loading ? (
            <div className="py-16 text-center text-xs text-zinc-500">Loading assignments...</div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-16 bg-[#0b0b12] border border-dashed border-white/10 rounded-2xl p-6">
              <Film className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-zinc-300">No assignments match your query</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Dispatch a new project to an editor using the "New Video Assignment" button above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAssignments.map((a) => (
                <div
                  key={a.id}
                  className="bg-[#0b0b12] border border-white/10 hover:border-blue-500/40 rounded-2xl p-4 transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Project title & details */}
                    <div className="space-y-1.5 flex-grow">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                            a.status === 'review_needed'
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                              : a.status === 'in_progress'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : a.status === 'approved'
                              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                              : 'bg-zinc-800 text-zinc-300 border border-white/10'
                          }`}
                        >
                          {a.status.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {a.format}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400">
                          Due: {formatDueDate(a.dueDate)}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white">{a.title}</h3>
                      <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-3">
                        <span>
                          Client: <strong className="text-zinc-200">{a.clientName}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Assigned to: <strong className="text-blue-400">{a.editorName}</strong>
                        </span>
                        {a.targetDuration && (
                          <>
                            <span>•</span>
                            <span>Target: {a.targetDuration}</span>
                          </>
                        )}
                      </div>

                      {/* Brief preview */}
                      <p className="text-xs text-zinc-400 line-clamp-1 pt-1 font-sans">{a.brief}</p>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
                      {a.draftVideoUrl && (
                        <button
                          onClick={() => setReviewModalTask(a)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review Draft Cut</span>
                        </button>
                      )}

                      <a
                        href={a.rawFootageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="Open Footage Drive"
                      >
                        <FolderOpen className="w-4 h-4 text-blue-400" />
                      </a>

                      <button
                        onClick={() => handleDeleteAssignment(a.id, a.title)}
                        className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EDITORS ROSTER */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {editors.map((ed) => (
              <div
                key={ed.id}
                className="bg-[#0b0b12] border border-white/10 hover:border-blue-500/40 rounded-2xl p-5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold font-mono text-white text-base overflow-hidden">
                        {ed.avatar ? (
                          <img src={ed.avatar} alt={ed.name} className="w-full h-full object-cover" />
                        ) : (
                          ed.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{ed.name}</h3>
                        <p className="text-xs text-zinc-400">{ed.email}</p>
                        <span className="inline-block mt-0.5 text-[10px] font-mono px-2 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
                          {ed.role.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteEditor(ed.id, ed.name)}
                      className="text-zinc-600 hover:text-rose-400 p-1 rounded-lg transition-colors"
                      title="Remove editor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {ed.bio && <p className="text-xs text-zinc-400 line-clamp-2 mb-3">{ed.bio}</p>}

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {ed.specialties.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-[#12121c] text-zinc-300 border border-white/5">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                  <span>
                    Queue: <strong className="text-blue-400">{ed.assignedTasksCount} active</strong>
                  </span>
                  <span>
                    Delivered: <strong className="text-zinc-200">{ed.completedTasksCount}</strong>
                  </span>
                  <span>Avg: {ed.turnaroundHoursAvg}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD / INVITE EDITOR */}
      <AnimatePresence>
        {isAddEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0d0d16] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsAddEditorOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5" />
                <span>Roster Management</span>
              </div>

              <h3 className="text-lg font-bold text-white mb-4">Add / Invite New Editor</h3>

              <form onSubmit={handleCreateEditor} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    Editor Full Name *
                  </label>
                  <input
                    type="text"
                    value={editorName}
                    onChange={(e) => setEditorName(e.target.value)}
                    placeholder="e.g. Liam Vance"
                    required
                    className="w-full bg-[#12121c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={editorEmail}
                    onChange={(e) => setEditorEmail(e.target.value)}
                    placeholder="liam@footazix.com"
                    required
                    className="w-full bg-[#12121c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    Role
                  </label>
                  <select
                    value={editorRole}
                    onChange={(e) => setEditorRole(e.target.value as EditorRole)}
                    className="w-full bg-[#12121c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="editor">Editor (Standard)</option>
                    <option value="lead_editor">Lead Editor (Supervisor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    Specialties (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={editorSpecialties}
                    onChange={(e) => setEditorSpecialties(e.target.value)}
                    placeholder="High-Retention Reels, Sound Design, Hooks"
                    className="w-full bg-[#12121c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    Short Bio & Focus
                  </label>
                  <textarea
                    rows={2}
                    value={editorBio}
                    onChange={(e) => setEditorBio(e.target.value)}
                    placeholder="Specializes in tech founders and finance pacing."
                    className="w-full bg-[#12121c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddEditorOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/20"
                  >
                    Add to Roster
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: NEW VIDEO ASSIGNMENT */}
      <AnimatePresence>
        {isAddAssignmentOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0d0d16] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsAddAssignmentOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-wider mb-2">
                <Film className="w-3.5 h-3.5" />
                <span>Project Dispatch</span>
              </div>

              <h3 className="text-lg font-bold text-white mb-4">Create Video Assignment</h3>

              <form onSubmit={handleCreateAssignment} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={assignTitle}
                      onChange={(e) => setAssignTitle(e.target.value)}
                      placeholder="e.g. AI Founder Viral Hook Reel"
                      required
                      className="w-full bg-[#12121c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      value={assignClient}
                      onChange={(e) => setAssignClient(e.target.value)}
                      placeholder="e.g. Apex Media / John Doe"
                      required
                      className="w-full bg-[#12121c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                      Assign to Editor
                    </label>
                    <select
                      value={assignEditorId}
                      onChange={(e) => setAssignEditorId(e.target.value)}
                      className="w-full bg-[#12121c] border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {editors.map((ed) => (
                        <option key={ed.id} value={ed.id}>
                          {ed.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                      Video Format
                    </label>
                    <select
                      value={assignFormat}
                      onChange={(e) => setAssignFormat(e.target.value)}
                      className="w-full bg-[#12121c] border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="9:16 Reel">9:16 Reel (IG/TikTok)</option>
                      <option value="16:9 YouTube">16:9 YouTube (Long-Form)</option>
                      <option value="Brand Story">Brand Story</option>
                      <option value="Shorts">YouTube Shorts</option>
                      <option value="VSL / Promo">VSL / Promo Cut</option>
                      <option value="Motion / VFX">Motion Graphics / 3D</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                      Priority
                    </label>
                    <select
                      value={assignPriority}
                      onChange={(e) => setAssignPriority(e.target.value as EditorAssignmentPriority)}
                      className="w-full bg-[#12121c] border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                      Due Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={assignDueDate}
                      onChange={(e) => setAssignDueDate(e.target.value)}
                      className="w-full bg-[#12121c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                      Target Duration
                    </label>
                    <input
                      type="text"
                      value={assignTargetDuration}
                      onChange={(e) => setAssignTargetDuration(e.target.value)}
                      placeholder="e.g. 45 - 60s"
                      className="w-full bg-[#12121c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    Raw Footage Link (Google Drive / Dropbox / Frame.io) *
                  </label>
                  <input
                    type="url"
                    value={assignRawFootage}
                    onChange={(e) => setAssignRawFootage(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    required
                    className="w-full bg-[#12121c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    Creative Brief & Direction *
                  </label>
                  <textarea
                    rows={3}
                    value={assignBrief}
                    onChange={(e) => setAssignBrief(e.target.value)}
                    placeholder="Describe hook instructions, key sound effects, what claims to emphasize, and any specific timestamps."
                    required
                    className="w-full bg-[#12121c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddAssignmentOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/20"
                  >
                    Dispatch Assignment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: REVIEW DRAFT CUT */}
      <AnimatePresence>
        {reviewModalTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0d0d16] border border-white/10 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setReviewModalTask(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-wider mb-2">
                <Eye className="w-3.5 h-3.5" />
                <span>Creative Director Review</span>
              </div>

              <h3 className="text-lg font-bold text-white">{reviewModalTask.title}</h3>
              <p className="text-xs text-zinc-400 mb-4">
                Submitted by: <strong className="text-blue-400">{reviewModalTask.editorName}</strong> • Format:{' '}
                <span className="font-mono text-zinc-200">{reviewModalTask.format}</span>
              </p>

              {/* Video Player / External Link */}
              <div className="rounded-xl overflow-hidden border border-white/10 bg-black aspect-video mb-4 flex items-center justify-center relative">
                {reviewModalTask.draftVideoUrl?.endsWith('.mp4') ? (
                  <video src={reviewModalTask.draftVideoUrl} controls className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <Play className="w-10 h-10 text-blue-500 mx-auto" />
                    <p className="text-xs text-zinc-300 max-w-sm">
                      Draft video hosted on external platform (Frame.io, Vimeo, YouTube, or Drive).
                    </p>
                    <a
                      href={reviewModalTask.draftVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Review Link</span>
                    </a>
                  </div>
                )}
              </div>

              {reviewModalTask.editorNotes && (
                <div className="p-3 rounded-xl bg-[#12121c] border border-white/5 text-xs text-zinc-300 mb-4">
                  <strong className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                    Editor's Notes:
                  </strong>
                  <span>{reviewModalTask.editorNotes}</span>
                </div>
              )}

              {/* Revision Feedback Input */}
              <div className="space-y-2 mb-4">
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  Revision Feedback (if requesting changes)
                </label>
                <textarea
                  rows={2}
                  value={revisionFeedback}
                  onChange={(e) => setRevisionFeedback(e.target.value)}
                  placeholder="e.g. 00:14 punch in 115%. Bring audio levels down -2dB on the riser at 00:22."
                  className="w-full bg-[#12121c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => handleRequestRevision(reviewModalTask)}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 font-medium text-xs transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Request Revisions</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApproveCut(reviewModalTask)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Final Cut</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
