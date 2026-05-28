'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

type SettingsModalShellProps = {
  open: boolean;
  title: string;
  eyebrow: string;
  description: string;
  maxWidthClassName?: string;
  children: ReactNode;
  onClose: () => void;
};

export function SettingsModalShell({
  open,
  title,
  eyebrow,
  description,
  maxWidthClassName = 'max-w-2xl',
  children,
  onClose,
}: SettingsModalShellProps) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[rgba(8,18,14,0.52)]"
            aria-label="Close dialog"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            className="fixed inset-0 z-50 grid place-items-center p-4"
          >
            <div className={`dashboard-panel-strong w-full ${maxWidthClassName} rounded-[1.9rem] p-6`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">
                    {eyebrow}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-[var(--dashboard-text)]">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--dashboard-muted)]">{description}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="dashboard-dark-button flex h-10 w-10 items-center justify-center rounded-2xl text-lg font-semibold"
                  aria-label="Close dialog"
                >
                  ×
                </button>
              </div>

              <div className="mt-6">{children}</div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
