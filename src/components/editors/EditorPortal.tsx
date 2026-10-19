import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { editorService } from '../../services/editorService';
import { authService } from '../../services/authService';
import { FootazixLogo } from '../FootazixLogo';
import {
  Editor,
  EditorAssignment,
  EditorAssignmentStatus,
  EditorAsset,
} from '../../types';
import {
  Video,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Send,
  Download,
  Film,
  Sparkles,
  Lock,
  LogOut,
  User,
  Search,
  Filter,
  Check,
  Play,
  FileText,
  Layers,
  ChevronRight,
  ShieldCheck,
  Eye,
  X,
  MessageSquare,
  Copy,
  Info,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const EditorPortal: React.FC = () => {
  const { currentUser, logout, navigateToPublic } = useApp();

  const [activeTab, setActiveTab] = useState<'assignments' | 'toolkit' | 'guidelines' | 'profile'>('assignments');
  const [editors, setEditors] = useState<Editor[]>([]);
  const [assignments, setAssignments] = useState<EditorAssignment[]>([]);
  const [assets, setAssets] = useState<EditorAsset[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected assignment for detailed view / submission
  const [selectedTask, setSelectedTask] = useState<EditorAssignment | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Profile password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordToast, setPasswordToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Notification toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Find the active editor profile
  const currentEditor = editors.find((e) => e.email.toLowerCase() === currentUser?.email?.toLowerCase()) ||
    (editors.length > 0 ? editors[0] : null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eds, asgns, asts] = await Promise.all([
        editorService.getEditors(),
        editorService.getAssignments(),
        editorService.getAssets(),
      ]);
      setEditors(eds);
      setAssignments(asgns);
      setAssets(asts);
    } catch (err) {
      console.error('Error loading editor workspace data:', err);
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

  // Filter assignments: if user is an editor, prioritize their assignments
  const isOwner = currentUser?.role === 'owner';
  const relevantAssignments = isOwner
    ? assignments
    : assignments.filter((a) => {
        if (!currentEditor) return true;
        return a.editorId === currentEditor.id || a.editorName?.toLowerCase() === currentEditor.name?.toLowerCase();
      });

  const filteredAssignments = relevantAssignments.filter((a) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? a.status === 'assigned' || a.status === 'in_progress' || a.status === 'review_needed'
        : a.status === statusFilter;

    const matchesSearch =
      !searchQuery.trim() ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.format.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Stats calculation
  const totalAssigned = relevantAssignments.length;
  const inProgressCount = relevantAssignments.filter((a) => a.status === 'in_progress').length;
  const reviewNeededCount = relevantAssignments.filter((a) => a.status === 'review_needed').length;
  const completedCount = relevantAssignments.filter((a) => a.status === 'approved' || a.status === 'completed').length;

  const handleOpenSubmit = (task: EditorAssignment) => {
    setSelectedTask(task);
    setSubmissionUrl(task.draftVideoUrl || '');
    setSubmissionNotes(task.editorNotes || '');
    setIsSubmitModalOpen(true);
  };

  const handleSubmitDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    if (!submissionUrl.trim()) {
      showToast('Please provide a draft review URL (Vimeo, Drive, Frame.io, or MP4).');
      return;
    }

    setSubmitting(true);
    try {
      await editorService.submitDraft(selectedTask.id, submissionUrl.trim(), submissionNotes.trim());
      showToast('Draft submitted for review! Creative Director notified.');
      setIsSubmitModalOpen(false);
      setSelectedTask(null);
      await loadData();
    } catch (err) {
      showToast('Failed to submit draft. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: EditorAssignmentStatus) => {
    try {
      await editorService.updateAssignmentStatus(taskId, newStatus);
      showToast(`Status updated to ${newStatus.replace('_', ' ')}.`);
      await loadData();
    } catch (err) {
      showToast('Failed to update status.');
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordToast(null);

    if (newPassword.length < 6) {
      setPasswordToast({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordToast({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await authService.updatePassword(newPassword);
      if (res.success) {
        setPasswordToast({ type: 'success', message: 'Password updated successfully!' });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordToast({ type: 'error', message: res.error || 'Failed to update password.' });
      }
    } catch (err: any) {
      setPasswordToast({ type: 'error', message: err?.message || 'Error updating password.' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard.`);
  };

  const formatDueDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: EditorAssignmentStatus) => {
    switch (status) {
      case 'assigned':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-zinc-800 text-zinc-300 border border-white/10 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            Assigned
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            In Progress
          </span>
        );
      case 'review_needed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Review Needed
          </span>
        );
      case 'revision_requested':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3" />
            Revisions
          </span>
        );
      case 'approved':
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-blue-600/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-blue-400" />
            Approved
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono text-zinc-400 bg-zinc-800">
            {status}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-wider">
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            High Priority
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-white/5 text-zinc-400 border border-white/5 uppercase tracking-wider">
            Normal
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Toast notification */}
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

      {/* TOP WORKSPACE NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#07070d]/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Brand + Workspace pill */}
          <div className="flex items-center gap-3">
            <button
              onClick={navigateToPublic}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
              title="Return to Footazix Public Site"
            >
              <FootazixLogo className="h-6 w-auto text-white" />
            </button>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-mono uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Editor Workspace
            </div>
            {isOwner && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-600/20 text-blue-300 border border-blue-500/30">
                Admin Preview Mode
              </span>
            )}
          </div>

          {/* Center Tabs for Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0f0f1c] p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'assignments'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Film className="w-3.5 h-3.5" />
                <span>My Assignments</span>
                {reviewNeededCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono">
                    {reviewNeededCount}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('toolkit')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'toolkit'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Asset Vault & LUTs</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('guidelines')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'guidelines'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Footazix Standards</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                <span>Account</span>
              </div>
            </button>
          </nav>

          {/* Right: User Pill & Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 pl-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-xs font-bold font-mono text-white ring-1 ring-white/20 overflow-hidden">
                {currentEditor?.avatar ? (
                  <img src={currentEditor.avatar} alt={currentEditor.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser?.name?.charAt(0).toUpperCase() || 'E'
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-zinc-200 leading-tight">
                  {currentEditor?.name || currentUser?.name || 'Editor'}
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  {currentEditor?.role === 'lead_editor' ? 'Lead Editor' : 'Editor'}
                </div>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-white/5 hover:border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center justify-between gap-1 mt-3 pt-3 border-t border-white/5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'assignments' ? 'bg-blue-600 text-white' : 'text-zinc-400'
            }`}
          >
            Assignments
          </button>
          <button
            onClick={() => setActiveTab('toolkit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'toolkit' ? 'bg-blue-600 text-white' : 'text-zinc-400'
            }`}
          >
            Asset Vault
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'guidelines' ? 'bg-blue-600 text-white' : 'text-zinc-400'
            }`}
          >
            Standards
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'profile' ? 'bg-blue-600 text-white' : 'text-zinc-400'
            }`}
          >
            Account
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* TAB 1: ASSIGNMENTS & VIDEO PIPELINE */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-[#0b0b12] border border-white/5 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
                  Total Assigned
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-display text-white tabular-nums">
                  {totalAssigned}
                </span>
                <div className="text-[11px] text-zinc-500 mt-1">Projects in your queue</div>
              </div>

              <div className="bg-[#0b0b12] border border-white/5 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
                <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 block mb-1">
                  In Progress
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-display text-blue-400 tabular-nums">
                  {inProgressCount}
                </span>
                <div className="text-[11px] text-zinc-500 mt-1">Currently on the timeline</div>
              </div>

              <div className="bg-[#0b0b12] border border-white/5 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 block mb-1">
                  Review Needed
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-display text-amber-400 tabular-nums">
                  {reviewNeededCount}
                </span>
                <div className="text-[11px] text-zinc-500 mt-1">Submitted for director review</div>
              </div>

              <div className="bg-[#0b0b12] border border-white/5 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                  Completed & Approved
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-display text-zinc-200 tabular-nums">
                  {completedCount}
                </span>
                <div className="text-[11px] text-zinc-500 mt-1">Ready for client publish</div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0b0b12] p-3 rounded-2xl border border-white/5">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(['all', 'active', 'in_progress', 'review_needed', 'approved'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors whitespace-nowrap capitalize ${
                      statusFilter === st
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {st === 'all' ? 'All Tasks' : st === 'active' ? 'Active Queue' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search project or client..."
                  className="w-full bg-[#12121c] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Assignments List */}
            {loading ? (
              <div className="py-20 text-center text-zinc-500 text-xs">
                Loading editor assignments...
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-20 bg-[#0b0b12] border border-dashed border-white/10 rounded-2xl p-8">
                <Film className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-zinc-300 mb-1">No assignments found</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  {statusFilter !== 'all'
                    ? `No projects currently match the filter "${statusFilter}". Try switching filters.`
                    : 'Your queue is all caught up! New assignments will appear here as clients submit footage.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="bg-[#0b0b12] border border-white/10 hover:border-blue-500/40 rounded-2xl p-5 transition-all duration-200 group relative"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Task Info */}
                      <div className="space-y-2 flex-grow">
                        <div className="flex flex-wrap items-center gap-2">
                          {getStatusBadge(assignment.status)}
                          {getPriorityBadge(assignment.priority)}
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {assignment.format}
                          </span>
                          {assignment.targetDuration && (
                            <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-zinc-500" />
                              {assignment.targetDuration}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                            {assignment.title}
                          </h3>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            Client: <span className="text-zinc-200 font-medium">{assignment.clientName}</span>
                          </p>
                        </div>

                        {/* Brief Snippet */}
                        <p className="text-xs text-zinc-400 line-clamp-2 bg-[#12121c] p-3 rounded-xl border border-white/5 font-sans leading-relaxed">
                          <strong className="text-zinc-300 font-mono text-[10px] uppercase block mb-0.5">Brief & Direction:</strong>
                          {assignment.brief}
                        </p>

                        {/* Creative feedback banner if revisions requested */}
                        {assignment.feedbackNotes && (
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="font-mono text-[10px] uppercase text-amber-400 block">
                                Creative Director Feedback:
                              </strong>
                              <span>{assignment.feedbackNotes}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions & Links */}
                      <div className="lg:w-80 shrink-0 flex flex-col gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/5 lg:pl-5">
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                          <span className="font-mono text-[10px] uppercase text-zinc-500">Due Date:</span>
                          <span className="font-mono text-zinc-300 font-medium">
                            {formatDueDate(assignment.dueDate)}
                          </span>
                        </div>

                        {/* Quick links to footage & assets */}
                        <div className="grid grid-cols-2 gap-2">
                          <a
                            href={assignment.rawFootageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-[#12121c] hover:bg-[#1a1a28] border border-white/5 hover:border-blue-500/30 text-xs text-zinc-200 hover:text-white transition-all flex items-center justify-center gap-1.5 group/btn"
                          >
                            <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                            <span className="truncate">Raw Footage</span>
                            <ExternalLink className="w-3 h-3 text-zinc-500 group-hover/btn:text-blue-400 shrink-0" />
                          </a>

                          {assignment.assetFolderUrl ? (
                            <a
                              href={assignment.assetFolderUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 rounded-xl bg-[#12121c] hover:bg-[#1a1a28] border border-white/5 hover:border-blue-500/30 text-xs text-zinc-200 hover:text-white transition-all flex items-center justify-center gap-1.5 group/btn"
                            >
                              <Layers className="w-3.5 h-3.5 text-blue-400" />
                              <span className="truncate">Brand Pack</span>
                              <ExternalLink className="w-3 h-3 text-zinc-500 group-hover/btn:text-blue-400 shrink-0" />
                            </a>
                          ) : (
                            <button
                              onClick={() => setSelectedTask(assignment)}
                              className="p-2.5 rounded-xl bg-[#12121c] hover:bg-[#1a1a28] border border-white/5 text-xs text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-1.5"
                            >
                              <FileText className="w-3.5 h-3.5 text-zinc-400" />
                              <span>View Brief</span>
                            </button>
                          )}
                        </div>

                        {/* Submit / Update Draft Button */}
                        <button
                          onClick={() => handleOpenSubmit(assignment)}
                          className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>
                            {assignment.draftVideoUrl ? 'Update Draft Submission' : 'Submit Draft Video'}
                          </span>
                        </button>

                        {/* Quick Status Toggle */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span className="text-[10px] font-mono uppercase text-zinc-500">Quick Status:</span>
                          <select
                            value={assignment.status}
                            onChange={(e) => handleStatusChange(assignment.id, e.target.value as EditorAssignmentStatus)}
                            className="bg-[#12121c] border border-white/10 rounded-lg px-2 py-1 text-[11px] font-mono text-zinc-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="assigned">Assigned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review_needed">Review Needed</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AGENCY ASSET VAULT & LUTS */}
        {activeTab === 'toolkit' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold font-display text-white mb-1">
                Footazix Creative Toolkit & Presets
              </h2>
              <p className="text-xs text-zinc-400">
                Official sound effects vault, cinema LUTs, and animated MOGRTs for Footazix editors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-[#0b0b12] border border-white/10 hover:border-blue-500/40 rounded-2xl p-5 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider font-semibold">
                        {asset.category}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        Updated {asset.updatedAt}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white mb-1">{asset.title}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">{asset.description}</p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                      <span>{asset.fileSize}</span>
                      <span>•</span>
                      <span>{asset.fileType}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                    <a
                      href={asset.url}
                      download
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-md shadow-blue-600/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Asset</span>
                    </a>

                    <button
                      onClick={() => copyToClipboard(asset.url, asset.title)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="Copy URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: EDITING STANDARDS & RETENTION BLUEPRINT */}
        {activeTab === 'guidelines' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold font-display text-white mb-1">
                The Footazix Editing Blueprint
              </h2>
              <p className="text-xs text-zinc-400">
                Non-negotiable post-production standards engineered for 70%+ retention and conversion.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0b0b12] border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-mono font-bold text-xs">
                  01
                </div>
                <h3 className="text-sm font-bold text-white">The 3-Second Hook Rule</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Every short-form edit must open with high visual contrast within the first 15 frames. Never open with a generic title card or logo. The spoken hook must sync with animated bold typography.
                </p>
              </div>

              <div className="bg-[#0b0b12] border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-mono font-bold text-xs">
                  02
                </div>
                <h3 className="text-sm font-bold text-white">Pacing & Cut Cadence</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  No visual beat longer than 2.5 seconds without a framing punch-in (115% scale), B-roll overlay, kinetic text reveal, or sound design accent. Eliminate pauses and breaths naturally.
                </p>
              </div>

              <div className="bg-[#0b0b12] border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-mono font-bold text-xs">
                  03
                </div>
                <h3 className="text-sm font-bold text-white">Color & Typography</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Footazix aesthetic is cinematic, high-contrast monochrome with electric blue accents (#015ADD). Subtitles: Manrope Bold, all-caps or clean sentence case, white font with subtle black drop shadow.
                </p>
              </div>
            </div>

            {/* Delivery Specifications */}
            <div className="bg-[#0b0b12] border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Export & Delivery Specifications</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-[#12121c] border border-white/5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Short-Form Format</span>
                  <span className="font-bold text-zinc-200 mt-1 block">1080 × 1920 (9:16)</span>
                  <span className="text-[11px] text-zinc-400">H.264 / ProRes 422</span>
                </div>
                <div className="p-3 rounded-xl bg-[#12121c] border border-white/5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Long-Form Format</span>
                  <span className="font-bold text-zinc-200 mt-1 block">3840 × 2160 (16:9)</span>
                  <span className="text-[11px] text-zinc-400">4K Master or 1080p</span>
                </div>
                <div className="p-3 rounded-xl bg-[#12121c] border border-white/5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Audio Standards</span>
                  <span className="font-bold text-zinc-200 mt-1 block">-14 LUFS (Integrated)</span>
                  <span className="text-[11px] text-zinc-400">Peak at -1.0 dB True Peak</span>
                </div>
                <div className="p-3 rounded-xl bg-[#12121c] border border-white/5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Safe Zones</span>
                  <span className="font-bold text-zinc-200 mt-1 block">UI Margin Clear</span>
                  <span className="text-[11px] text-zinc-400">Top 150px, Bottom 250px</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE & SECURITY */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Profile Info */}
            <div className="bg-[#0b0b12] border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                <span>Editor Profile</span>
              </h2>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold font-mono text-white ring-2 ring-blue-500/30 overflow-hidden">
                  {currentEditor?.avatar ? (
                    <img src={currentEditor.avatar} alt={currentEditor.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser?.name?.charAt(0).toUpperCase() || 'E'
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{currentEditor?.name || currentUser?.name}</h3>
                  <p className="text-xs text-zinc-400">{currentUser?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
                    {currentEditor?.role?.replace('_', ' ') || 'Editor'}
                  </span>
                </div>
              </div>

              {currentEditor?.specialties && currentEditor.specialties.length > 0 && (
                <div className="mb-4">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-2">Specialties:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentEditor.specialties.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#12121c] border border-white/5 text-xs text-zinc-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {currentEditor?.software && currentEditor.software.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-2">Editing Stack:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentEditor.software.map((sw, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#12121c] border border-white/5 text-xs text-zinc-400">
                        {sw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Change Password Form */}
            <div className="bg-[#0b0b12] border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" />
                <span>Security & Password</span>
              </h2>
              <p className="text-xs text-zinc-400 mb-4">
                Update your account password to protect your editor workspace.
              </p>

              {passwordToast && (
                <div
                  className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
                    passwordToast.type === 'success'
                      ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}
                >
                  {passwordToast.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{passwordToast.message}</span>
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    className="w-full bg-[#12121c] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="w-full bg-[#12121c] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {updatingPassword ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* SUBMISSION MODAL */}
      <AnimatePresence>
        {isSubmitModalOpen && selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0d0d16] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-wider mb-2">
                <Send className="w-3.5 h-3.5" />
                <span>Draft Submission & Review</span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{selectedTask.title}</h3>
              <p className="text-xs text-zinc-400 mb-4">
                Client: <span className="text-zinc-200">{selectedTask.clientName}</span> • Format:{' '}
                <span className="text-blue-400 font-mono">{selectedTask.format}</span>
              </p>

              <form onSubmit={handleSubmitDraft} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                    Draft Review Video URL *
                  </label>
                  <input
                    type="url"
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    placeholder="https://vimeo.com/... or Google Drive / Frame.io / MP4 link"
                    required
                    className="w-full bg-[#12121c] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Frame.io, Vimeo, YouTube Unlisted, Google Drive, or direct MP4 links accepted.
                  </p>
                </div>

                {/* Quick video preview if mp4 is provided */}
                {submissionUrl.endsWith('.mp4') && (
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-black aspect-video max-h-48">
                    <video src={submissionUrl} controls className="w-full h-full object-contain" />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                    Editor Notes & Timestamps (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    placeholder="e.g. Cut length is 32s. Applied the cobalt film grade on B-roll. Added SFX on 00:04."
                    className="w-full bg-[#12121c] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Submitting...' : 'Submit Cut for Review'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-white/5 py-4 px-6 text-center text-xs text-zinc-600">
        Footazix Creative Agency • Internal Post-Production Portal
      </footer>
    </div>
  );
};
