/**
 * FOOTAZIX — Content Growth & Video Editing Agency
 * 
 * Flow Order:
 * HEADER
 * ↓
 * HERO
 * ↓
 * FOUNDER VSL
 * ↓
 * SELECTED WORK
 * ↓
 * RAW → EDIT → READY
 * ↓
 * SERVICES
 * ↓
 * ABOUT / FOUNDER
 * ↓
 * FINAL CTA
 * ↓
 * FOOTER
 */

import React, { useState } from 'react';
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

export default function App() {
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

  const scrollToVSL = () => {
    const el = document.getElementById('vsl');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      openContactModal();
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 1. HEADER */}
      <Navbar onOpenContact={() => openContactModal()} />

      <main className="flex-grow">
        {/* 2. HERO */}
        <Hero
          onWorkWithUs={scrollToContact}
          onWatchVSL={scrollToVSL}
        />

        {/* 3. FOUNDER VSL */}
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

        {/* 7. ABOUT / FOUNDER */}
        <About />

        {/* 8. FINAL CTA (Includes Direct Project Inquiry) */}
        <FinalCTA onOpenModal={() => openContactModal()} />
      </main>

      {/* 9. FOOTER */}
      <Footer onOpenContact={() => openContactModal()} />

      {/* Instant Project Inquiry Modal (Accessible from any 'Start Project' or Service click) */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={closeContactModal}
        prefilledService={selectedServiceForModal}
      />
    </div>
  );
}
