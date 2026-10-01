import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const AdminLogin: React.FC = () => {
  const { login, navigateToPublic, content, isSupabaseConnected } = useApp();
  const [email, setEmail] = useState('admin@footazix.site');
  const [password, setPassword] = useState('footazix2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const res = await login(email, password, rememberMe);
    setIsSubmitting(false);
    if (!res.success) {
      setError(res.error || 'Login failed. Please check credentials or Supabase user configuration.');
    }
  };

  const handleDemoLogin = async () => {
    setEmail('admin@footazix.site');
    setPassword('footazix2026');
    setError('');
    setIsSubmitting(true);
    await login('admin@footazix.site', 'footazix2026', true);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col justify-center py-12 px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      {/* Top Bar with Return to Public Site */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <button
          onClick={navigateToPublic}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Return to Website</span>
        </button>

        <div className="flex items-center gap-2">
          {isSupabaseConnected ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-blue-950/60 border border-blue-500/40 text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Supabase Auth Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-zinc-900 border border-white/10 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Supabase Ready (Offline Preview)
            </span>
          )}
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-2xl font-display font-extrabold text-white tracking-tight">
            <span>{content.brand.name}</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
          </div>
          <h2 className="mt-3 text-xl font-display font-bold text-white tracking-tight">
            Studio Management Portal
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Sign in to manage website content, portfolio, and project inquiries.
          </p>
        </div>

        {/* Supabase Integration Status Banner */}
        <div className="mb-6 p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-200 text-xs">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-semibold text-white">
                {isSupabaseConnected ? 'Supabase Authentication Active:' : 'Supabase Integration Ready:'}
              </span>
              <p className="text-[11px] text-zinc-300 mt-0.5">
                {isSupabaseConnected
                  ? 'Authenticating through Supabase Auth with Row Level Security (RLS) policies on admin_profiles.'
                  : 'Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to connect live Supabase cloud. Local preview enabled.'}
              </p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-950 border border-white/10 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@footazix.site"
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-zinc-300">Remember me</span>
              </label>
              <span className="text-zinc-500 text-[11px]">
                {isSupabaseConnected ? 'RLS Protected' : 'Preview Mode'}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 transition-all duration-200 glow-blue-sm cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <span>SIGN IN TO DASHBOARD →</span>
              )}
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-zinc-300 bg-zinc-900 hover:text-white hover:bg-zinc-800 border border-white/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span>Instant Demo Sign-In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
