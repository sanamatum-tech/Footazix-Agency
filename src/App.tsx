/**
 * FOOTAZIX — Website + Admin CMS (Phase 1 Frontend Only)
 * 
 * Strict Architecture:
 * - Decoupled data & service layers (ready for Supabase in Phase 2)
 * - Zero external databases / zero API keys / zero fake backend claims
 * - Real-time synchronized local state between Public Site and Admin CMS
 * 
 * Flow Order:
 * HEADER
 * ↓
 * HERO
 * ↓
 * FOUNDER / INTRO VSL
 * ↓
 * SELECTED WORK
 * ↓
 * RAW → EDIT → READY
 * ↓
 * SERVICES
 * ↓
 * TEAM / ABOUT
 * ↓
 * FINAL CTA
 * ↓
 * FOOTER (with subtle owner lock)
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FounderVSL } from './components/FounderVSL';
import { SelectedWork } from './components/SelectedWork';
import { RawToFinal } from './components/RawToFinal';
import { Services } from './components/Services';
import { About } from './components/About';
import { FinalCTA } from './components/FinalCTA';
import { ContactModal } from './components/ContactModal';
import { Footer } from './components/Footer';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLogin } from './components/admin/AdminLogin';
import { LegalPage } from './components/LegalPage';

function MainWebsite() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<string>('');

  const openContactModal = (serviceName?: string) => {
    setSelectedServiceForModal(serviceName || '');
    setIsContactModalOpen(true);
  };

  const closeContactModal = () => {
    setIsContactModalOpen(false);
    setSelectedServiceForModal('');
  };

  const scrollToSystem = () => {
    const el = document.getElementById('system') || document.getElementById('vsl');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    openContactModal();
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 1. HEADER */}
      <Navbar onOpenContact={openContactModal} />

      <main className="flex-grow">
        {/* 2. HERO */}
        <Hero
          onWorkWithUs={scrollToContact}
          onWatchVSL={scrollToSystem}
        />

        {/* 3. FOOTAZIX SYSTEM (f/k/a Founder VSL) */}
        <FounderVSL />

        {/* 4. SELECTED WORK */}
        <SelectedWork
          onSelectProjectForInquiry={(projectTitle) =>
            openContactModal(`Similar edit to: ${projectTitle}`)
          }
        />

        {/* 5. RAW → EDIT → READY */}
        <RawToFinal />

        {/* 6. SERVICES */}
        <Services onSelectService={(service) => openContactModal(service)} />

        {/* 7. TEAM / ABOUT */}
        <About />

        {/* 8. FINAL CTA */}
        <FinalCTA onOpenModal={() => openContactModal()} />
      </main>

      {/* 9. FOOTER (Contains discreet owner lock button) */}
      <Footer onOpenContact={() => openContactModal()} />

      {/* Internal Project Inquiry Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={closeContactModal}
        prefilledService={selectedServiceForModal}
      />
    </div>
  );
}

function AppContent() {
  const { activeView, isAuthenticated } = useApp();

  if (activeView === 'admin') {
    if (isAuthenticated) {
      return <AdminLayout />;
    }
    return <AdminLogin />;
  }

  if (activeView === 'terms') {
    return <LegalPage type="terms" />;
  }

  if (activeView === 'privacy') {
    return <LegalPage type="privacy" />;
  }

  return <MainWebsite />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
