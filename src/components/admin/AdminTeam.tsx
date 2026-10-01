import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TeamMember } from '../../types';
import { teamService } from '../../services/teamService';

export const AdminTeam: React.FC = () => {
  const { team } = useApp();
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

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
    setIsAddingNew(true);
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
    setIsAddingNew(true);
  };

  const closeModal = () => {
    setIsAddingNew(false);
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Remove this team member?')) {
      await teamService.deleteTeamMember(id);
      setStatusMessage('Team member removed.');
      setTimeout(() => setStatusMessage(''), 2500);
    }
  };

  const handleToggleVisible = async (m: TeamMember) => {
    await teamService.updateTeamMember(m.id, { visible: !m.visible });
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= team.length) return;

    const copy = [...team];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;

    await teamService.reorderTeam(copy.map((c) => c.id));
  };

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-950 border border-white/10">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight">
            Team & Creative Roster CMS
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage founders, editors, and creative directors displayed on the website.
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
            + ADD TEAM MEMBER
          </button>
        </div>
      </div>

      {/* Team List or Empty State */}
      {team.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-12 text-center">
          <h3 className="text-base font-bold text-white mb-1">No team members yet.</h3>
          <p className="text-xs text-zinc-400 mb-4">
            Add founders, editors, or directors using the button above.
          </p>
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase bg-blue-600 text-white"
          >
            + Add First Member
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {team.map((member, idx) => (
            <div
              key={member.id}
              className="p-5 rounded-xl bg-zinc-950 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                {/* Reorder controls */}
                <div className="flex flex-col gap-1 text-zinc-500">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                  >
                    ▲
                  </button>
                  <button
                    disabled={idx === team.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                  >
                    ▼
                  </button>
                </div>

                {/* Photo */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-blue-500/30 shrink-0">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {member.name}
                    </h3>
                    <span className="text-xs text-blue-400 font-semibold">
                      • {member.role}
                    </span>
                    {member.visible === false && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5 max-w-lg">
                    {member.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleToggleVisible(member)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-white/10"
                >
                  {member.visible !== false ? 'Hide' : 'Show'}
                </button>

                <button
                  onClick={() => openEdit(member)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(member.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/30 border border-red-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h3>
              <button onClick={closeModal} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sanamatum"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Founder & Creative Lead"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Short Bio / Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Creative focus, editing expertise, or brand background..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Photo URL *
                </label>
                <input
                  type="text"
                  required
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  placeholder="/assets/founder.jpg or image link"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Social Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={socialLink}
                    onChange={(e) => setSocialLink(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@footazix.site"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) => setVisible(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-blue-600"
                  />
                  <span>Visible on Public Website</span>
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
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
