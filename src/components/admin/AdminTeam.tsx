import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TeamMember } from '../../types';
import { teamService } from '../../services/teamService';
import {
  UsersRound,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Mail,
  ExternalLink,
  X,
} from 'lucide-react';

export const AdminTeam: React.FC = () => {
  const { team } = useApp();
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState('/assets/founder.jpg');
  const [socialLink, setSocialLink] = useState('');
  const [email, setEmail] = useState('');
  const [visible, setVisible] = useState(true);

  const openAdd = () => {
    setEditingMember(null);
    setName('');
    setRole('Senior Video Editor');
    setDescription('');
    setPhoto('/assets/founder.jpg');
    setSocialLink('');
    setEmail('footazix@gmail.com');
    setVisible(true);
    setIsModalOpen(true);
  };

  const openEdit = (m: TeamMember) => {
    setEditingMember(m);
    setName(m.name);
    setRole(m.role);
    setDescription(m.description);
    setPhoto(m.photo);
    setSocialLink(m.socialLink || '');
    setEmail(m.email || '');
    setVisible(m.visible !== false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    if (editingMember) {
      await teamService.updateTeamMember(editingMember.id, {
        name: name.trim(),
        role: role.trim(),
        description: description.trim(),
        photo,
        socialLink: socialLink.trim() || undefined,
        email: email.trim() || undefined,
        visible,
      });
      setStatusMessage('Team member updated.');
    } else {
      await teamService.createTeamMember({
        name: name.trim(),
        role: role.trim(),
        description: description.trim(),
        photo,
        socialLink: socialLink.trim() || undefined,
        email: email.trim() || undefined,
        visible,
        displayOrder: team.length + 1,
      });
      setStatusMessage('Team member added.');
    }

    setTimeout(() => setStatusMessage(''), 2500);
    closeModal();
  };

  const confirmDelete = async (id: string) => {
    await teamService.deleteTeamMember(id);
    setIsDeletingId(null);
    setStatusMessage('Team member removed.');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleToggleVisible = async (m: TeamMember) => {
    const newVis = !m.visible;
    await teamService.updateTeamMember(m.id, { visible: newVis });
    setStatusMessage(`Team member ${newVis ? 'visible' : 'hidden'}.`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= team.length) return;

    const newTeam = [...team];
    const temp = newTeam[index];
    newTeam[index] = newTeam[targetIndex];
    newTeam[targetIndex] = temp;

    const orderedIds = newTeam.map((m) => m.id);
    await teamService.reorderTeam(orderedIds);
    setStatusMessage('Team display order updated.');
    setTimeout(() => setStatusMessage(''), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#090910] border border-white/10">
        <div>
          <h2 className="text-base sm:text-lg font-display font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Team Members</span>
            <span className="text-xs font-mono font-normal text-zinc-400">
              ({team.length} members)
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage creative video editors, strategists, and creative leads displayed on the About section.
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
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* Team Cards List */}
      {team.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#090910] border border-white/10 space-y-3">
          <UsersRound className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No team members</h3>
          <p className="text-xs text-zinc-400">
            Click Add Team Member to feature editors, founders, or strategists.
          </p>
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500"
          >
            + Add First Member
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {team.map((member, idx) => (
            <div
              key={member.id}
              className="p-4 sm:p-5 rounded-xl bg-[#090910] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
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
                    disabled={idx === team.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1 rounded hover:text-white hover:bg-zinc-800 disabled:opacity-20 cursor-pointer"
                    title="Move down"
                    aria-label="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Avatar */}
                <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-900 shrink-0 border border-white/10 relative">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white truncate">
                      {member.name}
                    </h3>
                    <span className="text-[10px] font-mono text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30">
                      {member.role}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1 max-w-xl">
                    {member.description}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-mono pt-0.5">
                    {member.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-zinc-400" />
                        {member.email}
                      </span>
                    )}
                    {member.socialLink && (
                      <span className="flex items-center gap-1">
                        <ExternalLink className="w-3 h-3 text-zinc-400" />
                        Social Link
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleToggleVisible(member)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    member.visible !== false
                      ? 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                      : 'bg-zinc-900 text-zinc-400 border border-white/10'
                  }`}
                  title="Toggle Visibility"
                >
                  {member.visible !== false ? (
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
                  onClick={() => openEdit(member)}
                  className="p-2 rounded-lg text-zinc-300 hover:text-white bg-[#12121c] border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                  title="Edit member"
                  aria-label="Edit member"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsDeletingId(member.id)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-red-400 bg-[#12121c] border border-white/10 hover:border-red-500/30 transition-colors cursor-pointer"
                  title="Delete member"
                  aria-label="Delete member"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
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
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg text-zinc-400 hover:text-white bg-[#12121c]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sanamatum"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Founder & Creative Lead"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Bio / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Directing creative video editing workflows and high-retention content..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-sm outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Photo URL
                </label>
                <input
                  type="text"
                  placeholder="/assets/founder.jpg"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs font-mono outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Social Link / Profile
                  </label>
                  <input
                    type="text"
                    placeholder="https://instagram.com/..."
                    value={socialLink}
                    onChange={(e) => setSocialLink(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="footazix@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="member-vis"
                  checked={visible}
                  onChange={(e) => setVisible(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-blue-600"
                />
                <label htmlFor="member-vis" className="text-xs text-zinc-300 cursor-pointer">
                  Visible on public website About section
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
                  {editingMember ? 'Save Changes' : 'Add Member'}
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
            <h3 className="text-base font-bold text-white">Delete Team Member?</h3>
            <p className="text-xs text-zinc-400">
              Are you sure you want to remove this team member? This will delete the record from Supabase.
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
