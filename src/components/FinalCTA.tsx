import React, { useState } from 'react';
import { SITE_CONFIG } from '../config/siteContent';

interface FinalCTAProps {
  onOpenModal?: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenModal }) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState(SITE_CONFIG.contact.serviceOptions[0]);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const subject = encodeURIComponent(`Project Inquiry: ${name} · ${service}`);
    const body = encodeURIComponent(`Client: ${name}
Email: ${email}
Service: ${service}

Details:
${details}

Sent from footazix.site`);
    
    window.location.href = `mailto:${SITE_CONFIG.brand.email}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-20 sm:py-24 bg-[#050508] relative overflow-hidden">
      {/* Subtle blue accent lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-blue-600/12 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.12] mb-4 text-balance">
          {SITE_CONFIG.finalCta.headline}
        </h2>

        <p className="text-base sm:text-lg text-zinc-300 max-w-lg mx-auto mb-8 leading-relaxed font-normal">
          "{SITE_CONFIG.finalCta.supporting}"
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
          <button
            onClick={() => {
              if (onOpenModal) {
                onOpenModal();
              } else {
                setShowForm(true);
              }
            }}
            className="w-full sm:w-auto px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all rounded-lg glow-blue-sm cursor-pointer"
          >
            {SITE_CONFIG.finalCta.primaryCta}
          </button>

          <a
            href={SITE_CONFIG.brand.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>{SITE_CONFIG.finalCta.secondaryCta}</span>
          </a>
        </div>

        {/* Quick inline form fallback if requested */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="max-w-lg mx-auto p-6 bg-zinc-950 border border-white/10 rounded-2xl text-left space-y-4 shadow-2xl animate-in fade-in duration-200"
          >
            {submitted ? (
              <p className="text-xs text-blue-400 font-medium text-center">
                ✓ Default mail client triggered. If it didn't open, reach us directly at {SITE_CONFIG.brand.email}.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Tell us about your footage or content goals..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="w-full py-3 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
                >
                  Send Inquiry →
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </section>
  );
};
