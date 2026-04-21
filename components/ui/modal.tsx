'use client';

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom'; // For rendering outside the main DOM tree
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  // Handle Escape Key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyDown]);

  // If you are using Next.js, ensure this only runs on the client
  if (typeof window === 'undefined') return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={cn(
              'relative z-10 w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/20">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground/80">
                {title || 'Dialog'}
              </h2>
              <button 
                onClick={onClose} 
                className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}