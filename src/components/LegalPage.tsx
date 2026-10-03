import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FootazixLogo } from './FootazixLogo';
import { ArrowLeft, Shield, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface LegalPageProps {
  type: 'terms' | 'privacy';
}

export const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  const { content, navigateToPublic, navigateToTerms, navigateToPrivacy } = useApp();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [type]);

  const isTerms = type === 'terms';
  const doc = isTerms ? content.legal?.terms : content.legal?.privacy;

  const defaultTitle = isTerms ? 'Terms & Conditions' : 'Privacy Policy';
  const defaultDate = 'Last Updated: October 2026';
  
  const defaultTermsContent = `
1. Scope & Acceptance
Welcome to Footazix ("we", "our", or "us"). By engaging our content creation, editing, or consulting services, accessing https://footazix.site, or submitting raw footage, you agree to be bound by these Terms & Conditions.

2. Intellectual Property & Footage Rights
You retain 100% ownership and copyright of all raw footage, voiceover recordings, audio files, and brand materials supplied to Footazix. Upon final settlement of project retainers or service invoices, you receive full commercial rights to publish and monetize the edited deliverables across all global platforms.

3. Turnaround Times & Revisions
Standard editing deliverables follow the turnaround schedules agreed upon during project onboarding. Revisions must align with the original creative brief. We prioritize high-retention storytelling, kinetic hooks, and platform-native formats.

4. Client Responsibilities
You are solely responsible for ensuring you have full legal rights, music clearances, or permissions for all third-party media and footage provided to Footazix.

5. Confidentiality & Security
Footazix treats all unreleased footage, creator scripts, and business data with strict confidentiality. Projects are processed in secure environments and are never publicly shared or displayed in our portfolio without client consent.

6. Termination & Contact
Retainers may be adjusted or paused with written notice according to the specific service agreement. For inquiries or questions regarding these terms, reach our studio at footazix@gmail.com.
  `.trim();

  const defaultPrivacyContent = `
1. Information We Collect
Footazix collects client contact information (name, email address, phone/WhatsApp number, handle/company name) and project specifications solely when voluntarily submitted through our inquiry forms or direct communication.

2. How We Use Information
We utilize client information exclusively for:
- Reviewing video footage requirements and delivering project scopes
- Communicating regarding edits, revisions, and production status
- Invoicing and client relationship management

3. Protection of Raw Media Assets
All raw video footage, audio tracks, and assets uploaded to Footazix are stored within encrypted, access-restricted studio storage. We do not distribute, sell, or license raw footage to third parties under any circumstances.

4. Cookies & Analytics
Our website uses minimal, non-invasive cookies necessary for session state, navigation performance, and security. We do not engage in invasive behavioral tracking or third-party ad retargeting.

5. Data Retention & Deletion
Clients may request the permanent deletion of their contact records or archived project files at any time by contacting footazix@gmail.com.
  `.trim();

  const title = doc?.title || defaultTitle;
  const lastUpdated = doc?.lastUpdated ? `Last Updated: ${doc.lastUpdated}` : defaultDate;
  const bodyText = doc?.content || (isTerms ? defaultTermsContent : defaultPrivacyContent);

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#050508]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={navigateToPublic}
            className="flex items-center gap-2 group cursor-pointer hover:opacity-90 transition-opacity"
            aria-label="Return to Footazix Home"
          >
            <FootazixLogo className="w-[130px] sm:w-[150px] h-auto object-contain" />
          </button>

          <button
            onClick={navigateToPublic}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-white bg-[#12121c] border border-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>Back to Home</span>
          </button>
        </div>
      </header>

      {/* Main Legal Content Container */}
      <main className="flex-1 max-w-3xl mx-auto px-6 py-14 sm:py-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          {/* Header Block */}
          <div className="border-b border-white/10 pb-8">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-blue-400 mb-3">
              {isTerms ? (
                <FileText className="w-3.5 h-3.5" />
              ) : (
                <Shield className="w-3.5 h-3.5" />
              )}
              <span>FOOTAZIX LEGAL</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight mb-3">
              {title}
            </h1>

            <p className="text-xs font-mono text-zinc-400">
              {lastUpdated}
            </p>
          </div>

          {/* Body Narrative */}
          <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed text-sm sm:text-base font-normal space-y-4 whitespace-pre-line">
            {bodyText}
          </div>

          {/* Quick Switcher */}
          <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="text-zinc-400">
              Related Document:{' '}
              {isTerms ? (
                <button
                  onClick={navigateToPrivacy}
                  className="text-blue-400 hover:text-blue-300 underline underline-offset-4 ml-1 cursor-pointer"
                >
                  Privacy Policy →
                </button>
              ) : (
                <button
                  onClick={navigateToTerms}
                  className="text-blue-400 hover:text-blue-300 underline underline-offset-4 ml-1 cursor-pointer"
                >
                  Terms & Conditions →
                </button>
              )}
            </div>

            <button
              onClick={navigateToPublic}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Return to footazix.site
            </button>
          </div>
        </motion.div>
      </main>

      {/* Discreet Footer */}
      <footer className="border-t border-white/10 py-8 bg-[#040406] text-center text-xs text-zinc-400 font-mono">
        <p>© {new Date().getFullYear()} Footazix. All rights reserved.</p>
      </footer>
    </div>
  );
};
