import React, { useEffect } from 'react';
import { ContactSection } from './ContactSection';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledService?: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  prefilledService,
}) => {
  // ESC key listener & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 overflow-hidden"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl lg:max-w-3xl bg-[#08080f] sm:border border-white/10 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Sticky Header with clearly visible Close Button */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-white/10 bg-[#08080f]/95 backdrop-blur-md sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
            <span
              id="inquiry-modal-title"
              className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-300"
            >
              Start a Project
            </span>
          </div>

          {/* Accessible 44px touch target close button */}
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white bg-[#12121c] hover:bg-[#1c1c2b] border border-white/10 transition-colors cursor-pointer active:scale-95"
            aria-label="Close project modal (ESC)"
            title="Close (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-8 py-5 sm:py-6">
          <ContactSection
            prefilledService={prefilledService}
            isModal={true}
            onClose={onClose}
          />
        </div>
      </motion.div>
    </div>
  );
};
