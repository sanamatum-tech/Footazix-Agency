import React from 'react';
import { useApp } from '../../context/AppContext';
import { EditorLogin } from './EditorLogin';
import { EditorPortal } from './EditorPortal';
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';
import { FootazixLogo } from '../FootazixLogo';

export const EditorWorkspaceWrapper: React.FC = () => {
  const { currentUser, isAuthenticated, logout, navigateToPublic } = useApp();

  if (!isAuthenticated || !currentUser) {
    return <EditorLogin />;
  }

  // Check authorization: must have role 'editor' or 'owner'
  const isAuthorized = currentUser.role === 'editor' || currentUser.role === 'owner';

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex flex-col justify-center items-center px-4 py-12 relative">
        <div className="w-full max-w-md bg-[#0b0b12] border border-red-500/20 rounded-2xl p-7 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-display text-white mb-2">Access Restricted</h2>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            Your account (<strong className="text-zinc-200">{currentUser.email}</strong>) is not registered as an authorized Footazix editor. Please contact the studio owner to grant editor access.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => logout()}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out & Try Another Account</span>
            </button>
            <button
              onClick={navigateToPublic}
              className="w-full py-2.5 px-4 rounded-xl text-xs text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Public Website</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <EditorPortal />;
};
