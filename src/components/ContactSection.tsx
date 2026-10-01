import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface ContactSectionProps {
  prefilledService?: string;
  isModal?: boolean;
  onClose?: () => void;
}

const SERVICE_OPTIONS = [
  'Video Editing',
  'Reels / Shorts',
  'YouTube Editing',
  'Content & Scripting',
  'Content Strategy',
  'Other',
];

const BUDGET_OPTIONS = [
  'Flexible / Exploring options',
  'Standard monthly production',
  'High-volume / Priority growth retainer',
  'One-time custom project',
];

export const ContactSection: React.FC<ContactSectionProps> = ({
  prefilledService = '',
  isModal = false,
  onClose,
}) => {
  const { createInquiry } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>(() => {
    if (prefilledService) {
      const match = SERVICE_OPTIONS.find((s) =>
        prefilledService.toLowerCase().includes(s.toLowerCase())
      );
      return match ? [match] : ['Video Editing'];
    }
    return ['Video Editing'];
  });
  const [details, setDetails] = useState('');
  const [budget, setBudget] = useState(BUDGET_OPTIONS[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const toggleService = (srv: string) => {
    if (selectedServices.includes(srv)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s !== srv));
      }
    } else {
      setSelectedServices([...selectedServices, srv]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!details.trim()) {
      setErrorMessage('Please share a few details about your project or raw footage.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await createInquiry({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        services: selectedServices,
        details: details.trim(),
        budget,
      });

      setIsSubmitted(true);
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setSelectedServices(['Video Editing']);
    setDetails('');
    setBudget(BUDGET_OPTIONS[0]);
    setIsSubmitted(false);
    setErrorMessage('');
    if (onClose) onClose();
  };

  return (
    <div className={`relative ${isModal ? 'p-6 sm:p-10' : 'py-20 sm:py-28 bg-[#050508] border-t border-white/5'}`}>
      <div className={`${isModal ? 'w-full' : 'max-w-3xl mx-auto px-6'}`}>
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
            <span>START A PROJECT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight mb-2">
            WORK WITH FOOTAZIX
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Tell us about your content, and our team will connect with you.
          </p>
        </div>

        {/* Success Confirmation State */}
        {isSubmitted ? (
          <div className="p-8 sm:p-10 rounded-2xl bg-zinc-900/90 border border-blue-500/40 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-500/40 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight mb-2">
              REQUEST RECEIVED.
            </h3>
            <p className="text-sm text-zinc-300 max-w-md mx-auto mb-6 leading-relaxed">
              Thank you. Our team will review your request and connect with you shortly.
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Name <span className="text-blue-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Email <span className="text-blue-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Phone / WhatsApp <span className="text-zinc-600 text-[10px]">(optional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Company / Creator Name <span className="text-zinc-600 text-[10px]">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="@handle or brand"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* What do you need? Selection Pills */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
                What do you need? <span className="text-blue-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SERVICE_OPTIONS.map((srv) => {
                  const isSelected = selectedServices.includes(srv);
                  return (
                    <button
                      key={srv}
                      type="button"
                      onClick={() => toggleService(srv)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/10'
                      }`}
                    >
                      {srv}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Project Details */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Project Details <span className="text-blue-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Tell us about your raw footage, video format, target cadence, or reference style..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Budget Range (No $ or ₹ pricing symbols, per rule) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Budget Range <span className="text-zinc-600 text-[10px]">(optional)</span>
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                {BUDGET_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-zinc-950 text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 transition-all duration-200 glow-blue-sm cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>SUBMITTING REQUEST...</span>
                </>
              ) : (
                <span>SUBMIT PROJECT REQUEST →</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
