import React, { useState } from 'react';
import { SITE_CONFIG } from '../config/siteContent';

interface ContactSectionProps {
  prefilledService?: string;
  isModal?: boolean;
  onClose?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  prefilledService = '',
  isModal = false,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState(
    prefilledService || SITE_CONFIG.contact.serviceOptions[0]
  );
  const [details, setDetails] = useState('');
  const [budget, setBudget] = useState(SITE_CONFIG.contact.budgetOptions[0]);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const generateMailtoBody = () => {
    return `Client Name: ${name}
Client Email: ${email}
Requested Service: ${service}
Estimated Budget: ${budget}

Project Details:
${details}

---
Sent via Footazix Website Project Inquiry (footazix.site)`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !details.trim()) {
      setError('Please fill in your name, email, and project details.');
      return;
    }
    setError('');

    const subject = encodeURIComponent(`Project Inquiry: ${name} · ${service}`);
    const body = encodeURIComponent(generateMailtoBody());
    const mailtoUrl = `mailto:${SITE_CONFIG.brand.email}?subject=${subject}&body=${body}`;

    // Trigger email client
    window.location.href = mailtoUrl;
    setSubmitted(true);
  };

  const handleCopyRequest = () => {
    if (!name.trim() || !email.trim() || !details.trim()) {
      setError('Please fill in your name, email, and project details before copying.');
      return;
    }
    setError('');
    navigator.clipboard.writeText(generateMailtoBody()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className={`relative ${isModal ? 'p-6 sm:p-8' : 'py-24 bg-[#08080c] border-t border-white/5'}`}>
      <div className={`${isModal ? 'w-full' : 'max-w-4xl mx-auto px-6'}`}>
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>CONTACT FOOTAZIX</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight mb-3">
            {SITE_CONFIG.contact.heading}
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            {SITE_CONFIG.contact.subheading}
          </p>
        </div>

        {/* Success Banner */}
        {submitted && (
          <div className="mb-8 p-4 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-200 text-sm flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <span className="text-blue-400 font-bold text-lg">✓</span>
              <span>
                Your default mail client has opened! If it didn't open automatically, you can copy the text below.
              </span>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="text-xs text-blue-400 hover:text-white underline cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="p-8 sm:p-10 rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                Your Name <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full px-4 py-3 bg-zinc-900/90 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                Your Email <span className="text-blue-400">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@creator.com"
                className="w-full px-4 py-3 bg-zinc-900/90 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* What do you need? */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                What do you need?
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900/90 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                {SITE_CONFIG.contact.serviceOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-zinc-950 text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Budget */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                Optional Budget
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900/90 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                {SITE_CONFIG.contact.budgetOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-zinc-950 text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
              Project Details <span className="text-blue-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Tell us about your content, current footage format, publishing cadence, or what you want improved..."
              className="w-full px-4 py-3 bg-zinc-900/90 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-y"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all rounded-xl glow-blue-sm cursor-pointer"
            >
              SEND PROJECT REQUEST →
            </button>

            <button
              type="button"
              onClick={handleCopyRequest}
              className="w-full sm:w-auto px-5 py-3 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl transition-colors cursor-pointer"
            >
              {copied ? '✓ Copied to Clipboard!' : 'Copy Formatted Text'}
            </button>
          </div>

          {/* Direct channels */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
            <span>Destination: {SITE_CONFIG.brand.email}</span>
            <div className="flex items-center gap-4">
              <a
                href={SITE_CONFIG.brand.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-blue-400 transition-colors"
              >
                DM on Instagram →
              </a>
              <a
                href={`mailto:${SITE_CONFIG.brand.email}`}
                className="text-zinc-400 hover:text-blue-400 transition-colors"
              >
                Direct Email →
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
