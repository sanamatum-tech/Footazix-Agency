import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

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
  const { createInquiry, content } = useApp();
  const modalConfig = content.contactModal;

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

  const badgeText = modalConfig?.badge || 'START A PROJECT';
  const titleText = modalConfig?.title || 'BUILD WITH FOOTAZIX';
  const subtitleText =
    modalConfig?.subtitle ||
    'Tell us about your content, and our team will connect with you.';
  const nameLabel = modalConfig?.nameLabel || 'Name';
  const emailLabel = modalConfig?.emailLabel || 'Email';
  const phoneLabel = modalConfig?.phoneLabel || 'Phone / WhatsApp';
  const companyLabel = modalConfig?.companyLabel || 'Brand / Channel / Company';
  const servicesLabel = modalConfig?.servicesLabel || 'Services Needed';
  const detailsLabel = modalConfig?.detailsLabel || 'Project Details / Footage Link';
  const budgetLabel = modalConfig?.budgetLabel || 'Estimated Monthly Budget / Scope';
  const submitText = modalConfig?.submitText || 'SUBMIT PROJECT INQUIRY';
  const successTitle = modalConfig?.successTitle || 'REQUEST RECEIVED.';
  const successMessage =
    modalConfig?.successMessage ||
    'Thank you. Our team will review your request and connect with you shortly.';
  const doneButtonText = modalConfig?.doneButtonText || 'Done';

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
    <div className={`relative ${isModal ? 'p-0 sm:py-2' : 'py-20 sm:py-28 bg-[#050508] border-t border-white/5'}`}>
      <div className={`${isModal ? 'w-full' : 'max-w-3xl mx-auto px-6'}`}>
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
            <span>{badgeText}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight mb-2">
            {titleText}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            {subtitleText}
          </p>
        </div>

        {/* Success Confirmation State */}
        {isSubmitted ? (
          <div className="p-8 sm:p-10 rounded-2xl bg-zinc-900/90 border border-blue-500/40 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-500/40 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              <CheckCircle2 className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight mb-2">
              {successTitle}
            </h3>
            <p className="text-sm text-zinc-300 max-w-md mx-auto mb-6 leading-relaxed">
              {successMessage}
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer"
            >
              {doneButtonText}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  {nameLabel} <span className="text-blue-500">*</span>
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
                  {emailLabel} <span className="text-blue-500">*</span>
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
                  {phoneLabel}
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
                  {companyLabel}
                </label>
                <input
                  type="text"
                  placeholder="@handle or Company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Service Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
                {servicesLabel}
              </label>
              <div className="flex flex-wrap gap-2">
                {SERVICE_OPTIONS.map((srv) => {
                  const isSelected = selectedServices.includes(srv);
                  return (
                    <button
                      type="button"
                      key={srv}
                      onClick={() => toggleService(srv)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border border-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                          : 'bg-zinc-900/90 text-zinc-400 border border-white/10 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {srv}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                {budgetLabel}
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                {BUDGET_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-zinc-900 text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Details */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                {detailsLabel} <span className="text-blue-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Share your current video cadence, goals, links to raw footage / drive folders, or reference styles..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all duration-200 cursor-pointer shadow-[0_0_24px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>{submitText}</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
