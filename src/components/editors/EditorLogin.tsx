import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/authService';
import { FootazixLogo } from '../FootazixLogo';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  Loader2,
  KeyRound,
  CheckCircle2,
  Video,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

interface EditorLoginProps {
  onSuccess?: () => void;
}

export const EditorLogin: React.FC<EditorLoginProps> = ({ onSuccess }) => {
  const { navigateToPublic } = useApp();
  const [tab, setTab] = useState<'signin' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide both your editor email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login(email.trim(), password, rememberMe);
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'A network error occurred while connecting to the editor portal.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetMessage(null);

    if (!email.trim()) {
      setError('Please enter your editor email address to receive password reset instructions.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword(email.trim());
      if (res.success) {
        setResetMessage(res.message);
      } else {
        setError(res.error || 'Unable to send password recovery link.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error requesting password reset.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Footazix2026!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[200px] bg-blue-500/5 blur-[90px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <FootazixLogo className="h-8 w-auto text-white" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-3">
            <Video className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-mono font-medium tracking-wider uppercase text-blue-400">
              Editor Workspace
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2 font-display">
            Editor Sign In
          </h1>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto">
            Authorized workspace for Footazix video editors, motion designers, and sound engineers.
          </p>
        </div>

        {/* Card container */}
        <div className="bg-[#0b0b12] border border-white/10 rounded-2xl p-7 shadow-2xl backdrop-blur-xl relative">
          {/* Subtle blue top highlight */}
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          {tab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                  Editor Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="editor@footazix.com"
                    required
                    className="w-full bg-[#12121c] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setTab('forgot');
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-[#12121c] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#12121c] border-white/20 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 focus:ring-1 cursor-pointer"
                  />
                  <span className="text-xs text-zinc-400 select-none">Remember this device</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Editor Workspace</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
                <KeyRound className="w-4 h-4 text-blue-400" />
                <span>Reset your editor account password</span>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {resetMessage && (
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{resetMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                  Editor Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="editor@footazix.com"
                    required
                    className="w-full bg-[#12121c] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Recovery Link...</span>
                  </>
                ) : (
                  <span>Send Recovery Instructions</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setResetMessage(null);
                  setTab('signin');
                }}
                className="w-full py-2.5 text-xs text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </form>
          )}

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Quick Test Access (Preview Accounts)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillQuickDemo('alex@footazix.com')}
                className="text-left p-2 rounded-lg bg-[#12121c] hover:bg-[#181826] border border-white/5 hover:border-blue-500/30 transition-all text-xs group"
              >
                <span className="block font-medium text-zinc-200 group-hover:text-blue-400 transition-colors">
                  Alex Rivera
                </span>
                <span className="block text-[10px] text-zinc-500">Lead Editor</span>
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('maya@footazix.com')}
                className="text-left p-2 rounded-lg bg-[#12121c] hover:bg-[#181826] border border-white/5 hover:border-blue-500/30 transition-all text-xs group"
              >
                <span className="block font-medium text-zinc-200 group-hover:text-blue-400 transition-colors">
                  Maya Chen
                </span>
                <span className="block text-[10px] text-zinc-500">Motion Specialist</span>
              </button>
            </div>
          </div>
        </div>

        {/* Back to public site */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={navigateToPublic}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Footazix Public Site</span>
          </button>
        </div>
      </div>
    </div>
  );
};
