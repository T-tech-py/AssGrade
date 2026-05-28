'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

type DrawerPanelProps = {
  open: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
};

export function DrawerPanel({ open, title, subtitle, onClose, children }: DrawerPanelProps) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[rgba(8,18,14,0.52)]"
            aria-label="Close drawer"
          />
          <motion.aside
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
            className="fixed inset-y-3 right-3 z-50 w-[min(100%,34rem)] overflow-y-auto rounded-[1.8rem] border border-[var(--dashboard-panel-border)] bg-[#f8fbf6] shadow-[0_28px_70px_rgba(2,8,6,0.34)] dark:bg-[#1f2d25]"
          >
            <div className="sticky top-0 z-10 border-b border-[var(--dashboard-panel-border)] bg-[#f8fbf6] px-6 py-5 dark:bg-[#1f2d25]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">
                    Incident Review
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-[var(--dashboard-text)]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="dashboard-dark-button flex h-10 w-10 items-center justify-center rounded-2xl text-lg font-semibold"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="px-6 py-6">{children}</div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
