import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Eye, EyeOff } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login, navigateToPublic, content } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(cleanEmail, password, true);
      if (!res.success) {
        // Sanitize technical/Supabase error messages for production security
        setError('Invalid email or password.');
      }
    } catch {
      setError('Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col justify-between py-6 px-4 sm:px-6 selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between pt-2 pb-4">
        {/* Top-left: Brand Logo with signature cobalt blue dot */}
        <button
          type="button"
          onClick={navigateToPublic}
          className="inline-flex items-center gap-2 text-base sm:text-lg font-extrabold font-display tracking-tight text-white hover:text-zinc-200 transition-colors cursor-pointer group"
          aria-label="Return to Footazix homepage"
        >
          <span>{content.brand.name || 'FOOTAZIX'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shadow-[0_0_8px_rgba(37,99,235,0.8)] group-hover:scale-110 transition-transform" />
        </button>

        {/* Top-right: Subtle Secure Access Indicator */}
        <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-zinc-400 select-none">
          <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={2} />
          <span>SECURE ACCESS</span>
        </div>
      </header>

      {/* Main Centered Login Section */}
      <main className="w-full max-w-[420px] mx-auto my-auto py-8">
        <div className="text-center mb-8">
          {/* Subtle Studio Lock Detail */}
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-blue-950/40 border border-blue-500/25 mb-4 shadow-[0_0_20px_rgba(37,99,235,0.15)]">
            <Lock className="w-5 h-5 text-blue-500" strokeWidth={2} />
          </div>

          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400 mb-1.5">
            FOOTAZIX STUDIO
          </div>

          <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight">
            STUDIO MANAGEMENT PORTAL
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Manage your content, projects and inquiries.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0b0b12] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Clean, Non-technical Error Alert */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2"
              >
                EMAIL ADDRESS
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-xl bg-[#12121c] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
              />
            </div>

            {/* Password Field with Toggle Eye */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2"
              >
                PASSWORD
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  disabled={isSubmitting}
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#12121c] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" strokeWidth={1.8} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_0_24px_rgba(37,99,235,0.35)] cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>SIGNING IN...</span>
                </>
              ) : (
                <span>SIGN IN →</span>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer: Discreet Private Studio Access */}
      <footer className="w-full text-center pb-2 pt-4">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600 select-none">
          PRIVATE STUDIO ACCESS
        </span>
      </footer>
    </div>
  );
};
