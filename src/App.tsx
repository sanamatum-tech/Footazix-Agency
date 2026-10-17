import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DynamicHead } from './components/DynamicHead';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FounderVSL } from './components/FounderVSL';
import { SelectedWork } from './components/SelectedWork';
import { RawToFinal } from './components/RawToFinal';
import { Services } from './components/Services';
import { FAQSection } from './components/FAQSection';
import { About } from './components/About';
import { FinalCTA } from './components/FinalCTA';
import { ContactModal } from './components/ContactModal';
import { Footer } from './components/Footer';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLogin } from './components/admin/AdminLogin';
import { LegalPage } from './components/LegalPage';

function MainWebsite() {
  const { content } = useApp();
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

  const rawVisibility = content.sectionVisibility || {
    header: true,
    hero: true,
    system: true,
    portfolio: true,
    process: true,
    services: true,
    faq: true,
    about: true,
    team: true,
    finalCta: true,
    footer: true,
    instagram: true,
    startProjectModal: true,
  };

  const visibility = {
    ...rawVisibility,
    faq: rawVisibility.faq !== false,
  };

  const rawOrder = content.sectionOrder && content.sectionOrder.length > 0
    ? content.sectionOrder
    : ['hero', 'system', 'portfolio', 'process', 'services', 'faq', 'about', 'finalCta'];

  // Normalize 'team' to 'about', then deduplicate to strictly prevent duplicate keys or duplicate section renders
  const normalizedOrder = Array.from(new Set(rawOrder.map((s) => (s === 'team' ? 'about' : s))));
  
  // Guarantee FAQ is present in the homepage layout in the intended position (after Services and before Final CTA)
  const order = [...normalizedOrder];
  if (!order.includes('faq')) {
    const servicesIndex = order.indexOf('services');
    if (servicesIndex !== -1) {
      order.splice(servicesIndex + 1, 0, 'faq');
    } else {
      const finalCtaIndex = order.indexOf('finalCta');
      if (finalCtaIndex !== -1) {
        order.splice(finalCtaIndex, 0, 'faq');
      } else {
        order.push('faq');
      }
    }
  }

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return visibility.hero !== false ? (
          <Hero
            key="hero"
            onWorkWithUs={scrollToContact}
            onWatchVSL={scrollToSystem}
          />
        ) : null;

      case 'system':
      case 'vsl':
        return visibility.system !== false ? (
          <FounderVSL
            key="system"
            onOpenContact={() => openContactModal('System Reel / Strategy')}
          />
        ) : null;

      case 'portfolio':
      case 'work':
        return visibility.portfolio !== false ? (
          <SelectedWork
            key="portfolio"
            onSelectProjectForInquiry={(projectTitle) =>
              openContactModal(`Similar edit to: ${projectTitle}`)
            }
          />
        ) : null;

      case 'process':
      case 'rawToReady':
        return visibility.process !== false ? (
          <RawToFinal
            key="process"
            onOpenContact={() => openContactModal('Raw to Ready Pipeline')}
          />
        ) : null;

      case 'services':
        return visibility.services !== false ? (
          <Services
            key="services"
            onSelectService={(service) => openContactModal(service)}
          />
        ) : null;

      case 'faq':
        return visibility.faq !== false ? (
          <FAQSection
            key="faq"
            onOpenContact={() => openContactModal('General Inquiry / FAQ')}
          />
        ) : null;

      case 'about':
      case 'team':
        return (visibility.about !== false || visibility.team !== false) ? (
          <About key="about" />
        ) : null;

      case 'finalCta':
      case 'cta':
        return visibility.finalCta !== false ? (
          <FinalCTA
            key="finalCta"
            onOpenModal={() => openContactModal()}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 1. HEADER (Visibility controlled from CMS) */}
      {visibility.header !== false && (
        <Navbar onOpenContact={openContactModal} />
      )}

      {/* Dynamic Ordered & Filtered Main Sections */}
      <main className="flex-grow">
        {order.map((sectionId) => renderSection(sectionId))}
      </main>

      {/* 9. FOOTER (Visibility controlled from CMS) */}
      {visibility.footer !== false && (
        <Footer onOpenContact={() => openContactModal()} />
      )}

      {/* Internal Project Inquiry Modal */}
      {visibility.startProjectModal !== false && (
        <ContactModal
          isOpen={isContactModalOpen}
          onClose={closeContactModal}
          prefilledService={selectedServiceForModal}
        />
      )}
    </div>
  );
}

function AppContent() {
  const { activeView, isAuthenticated } = useApp();

  return (
    <>
      <DynamicHead />
      {activeView === 'admin' ? (
        isAuthenticated ? <AdminLayout /> : <AdminLogin />
      ) : activeView === 'terms' ? (
        <LegalPage type="terms" />
      ) : activeView === 'privacy' ? (
        <LegalPage type="privacy" />
      ) : (
        <MainWebsite />
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
