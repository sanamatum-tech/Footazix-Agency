/**
-- ==============================================================================
-- FOOTAZIX — Client Portal Passwordless Login
-- File: src/components/clients/ClientLogin.tsx
-- ==============================================================================
*/

import React, { useState, useEffect } from 'react';
import { clientAuthService } from '../../services/clientAuthService';
import { clientPortalService } from '../../services/clientPortalService';
import { ClientAccount } from '../../types/clientPortal';
import { FootazixLogo } from '../FootazixLogo';
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Lock,
} from 'lucide-react';

interface ClientLoginProps {
  onSuccess: (client: ClientAccount) => void;
  onNavigateHome: () => void;
}

export const ClientLogin: React.FC<ClientLoginProps> = ({ onSuccess, onNavigateHome }) => {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [demoClients, setDemoClients] = useState<ClientAccount[]>([]);

  // Load demo clients for instant testing / developer convenience
  useEffect(() => {
    let mounted = true;
    clientPortalService.getAllClients().then((clients) => {
      if (mounted) setDemoClients(clients);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid client email address.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await clientAuthService.requestEmailOtp(cleanEmail);
      if (!res.success) {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to dispatch access code.' });
        setIsLoading(false);
        return;
      }

      setStep('otp');
      setCountdown(60);
      setStatusMessage({
        type: 'info',
        text: res.message || `A secure 6-digit code has been sent to ${cleanEmail}. Enter it below to access your portal.`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Unexpected connection error.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = otpCode.trim();

    if (!cleanCode) {
      setStatusMessage({ type: 'error', text: 'Please enter the 6-digit verification code.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await clientAuthService.verifyEmailOtp(email, cleanCode);
      if (!res.success || !res.client) {
        setStatusMessage({ type: 'error', text: res.error || 'Invalid or expired code. Please try again.' });
        setIsLoading(false);
        return;
      }

      setStatusMessage({ type: 'success', text: 'Identity verified. Entering portal...' });
      setTimeout(() => {
        onSuccess(res.client!);
      }, 400);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Verification error.' });
      setIsLoading(false);
    }
  };

  const handleQuickDemoAccess = (client: ClientAccount) => {
    clientAuthService.setAdminPreviewClient(client);
    onSuccess(client);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 -right-20 w-[450px] h-[350px] bg-blue-500/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Bar Actions */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12121c]/80 hover:bg-[#181826] border border-white/10 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Footazix</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-mono text-blue-400">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Encrypted Client Gateway</span>
        </div>
      </div>

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Header / Brand */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center mb-2">
            <FootazixLogo className="h-9 w-auto text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Client Portal
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Private, passwordless access to your video deliverables, agreements, invoices, and review pipeline.
          </p>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#090910] border border-white/10 shadow-2xl shadow-black/80 space-y-5 backdrop-blur-xl relative">
          {/* Status Notifications */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-start gap-3 border ${
                statusMessage.type === 'error'
                  ? 'bg-red-500/10 border-red-500/20 text-red-300'
                  : statusMessage.type === 'success'
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-200'
              }`}
            >
              {statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              ) : statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              ) : (
                <KeyRound className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed">{statusMessage.text}</div>
            </div>
          )}

          {step === 'email' ? (
            /* Step 1: Email Form */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Authorized Client Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourcompany.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#12121c] border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
                  />
                </div>
                <p className="text-[11px] text-zinc-500">
                  We'll dispatch a 6-digit login code. No password required.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Authorization...</span>
                  </>
                ) : (
                  <>
                    <span>Send Access Code</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: 6-Digit OTP Form */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Enter 6-Digit Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setStatusMessage(null);
                    }}
                    className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                  >
                    Change Email
                  </button>
                </div>

                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={10}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#12121c] border border-white/10 text-white text-base tracking-widest font-mono placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-center"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                  <span>Sent to {email}</span>
                  {countdown > 0 ? (
                    <span>Resend in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={isLoading}
                      className="text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Resend Code</span>
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security details footnote */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-zinc-400" />
              <span>Passwordless Security</span>
            </span>
            <span>RLS Protected</span>
          </div>
        </div>

        {/* Quick Demo Access Box (For convenience during testing & preview) */}
        {demoClients.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#090910]/70 border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Authorized Client Profiles</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">1-Click Test</span>
            </div>
            <div className="space-y-1.5">
              {demoClients.slice(0, 3).map((cl) => (
                <button
                  key={cl.id}
                  type="button"
                  onClick={() => handleQuickDemoAccess(cl)}
                  className="w-full p-2.5 rounded-xl bg-[#12121c] hover:bg-[#181826] border border-white/5 hover:border-blue-500/30 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="truncate">
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                      {cl.full_name} {cl.company_name ? `• ${cl.company_name}` : ''}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono truncate">{cl.email}</div>
                  </div>
                  <span className="text-[10px] text-blue-400 font-medium shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform">
                    Enter →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
