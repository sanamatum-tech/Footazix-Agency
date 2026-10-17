/**
-- ==============================================================================
-- FOOTAZIX — Client Portal: Client Profile Settings
-- File: src/components/clients/ClientProfile.tsx
-- ==============================================================================
* 
* Requirements Enforced:
* - Edit permitted personal details (Full Name, Company Name, Phone, Avatar)
* - Authorized email identity is locked and strictly controlled by Admin CMS
* - Account status display
* - Direct Supabase persistence
* - Secure Sign Out
*/

import React, { useState, useRef } from 'react';
import { ClientAccount } from '../../types/clientPortal';
import { clientPortalService } from '../../services/clientPortalService';
import {
  User,
  Building,
  Phone,
  Mail,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  LogOut,
  Camera,
} from 'lucide-react';

interface ClientProfileProps {
  client: ClientAccount;
  onUpdateClient: (updated: ClientAccount) => void;
  onLogout: () => void;
}

export const ClientProfile: React.FC<ClientProfileProps> = ({
  client,
  onUpdateClient,
  onLogout,
}) => {
  const [fullName, setFullName] = useState(client.full_name || '');
  const [companyName, setCompanyName] = useState(client.company_name || '');
  const [phone, setPhone] = useState(client.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(client.avatar_url || '');

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setToastMessage(null);

    try {
      const res = await clientPortalService.uploadClientFile(file, client.id, 'avatars');
      if (res.success && res.url) {
        setAvatarUrl(res.url);
        setToastMessage({ type: 'success', text: 'Avatar uploaded. Click "Save Profile" to apply.' });
      } else {
        setToastMessage({ type: 'error', text: res.error || 'Failed to upload image.' });
      }
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err?.message || 'Upload error.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setToastMessage(null);

    try {
      const updates = {
        full_name: fullName.trim() || client.full_name,
        company_name: companyName.trim() || null,
        phone: phone.trim() || null,
        avatar_url: avatarUrl || null,
      };

      const success = await clientPortalService.updateClientAccount(client.id, updates);
      if (success) {
        onUpdateClient({
          ...client,
          ...updates,
        });
        setToastMessage({ type: 'success', text: 'Profile changes successfully saved.' });
      } else {
        setToastMessage({ type: 'error', text: 'Failed to update profile details.' });
      }
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err?.message || 'Save error.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Client Profile
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Manage your personal contact details, company information, and workspace preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {toastMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 border ${
            toastMessage.type === 'success'
              ? 'bg-blue-500/10 border-blue-500/20 text-blue-300'
              : 'bg-red-500/10 border-red-500/20 text-red-300'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Profile Form Card */}
      <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-3xl bg-[#090910] border border-white/10 space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-5 pb-6 border-b border-white/5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-[#12121c] border border-white/10 overflow-hidden flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-zinc-500" />
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Profile Photo / Logo</h3>
            <p className="text-xs text-zinc-400">
              Upload your company logo or personal headshot (PNG, JPG).
            </p>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1 pt-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Uploading...' : 'Choose Image'}</span>
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Company / Brand
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Vance Velocity Media"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Direct Phone / WhatsApp
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#12121c] border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Authorized Email (Locked / Read-Only) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Authorized Email
              </label>
              <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                <Lock className="w-3 h-3 text-zinc-400" />
                <span>Admin Managed</span>
              </span>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                disabled
                value={client.email}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black border border-white/5 text-zinc-400 text-xs font-mono cursor-not-allowed select-none"
              />
            </div>
            <p className="text-[10px] text-zinc-500">
              To update your authorized email, please reach out to your Footazix administrator.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            Account Status: <strong className="text-blue-400 uppercase font-mono">{client.status}</strong>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Profile</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
