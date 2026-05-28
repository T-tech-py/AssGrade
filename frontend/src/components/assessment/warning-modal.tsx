'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { WarningIcon } from './icons';

type WarningModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  warningCount?: number;
  warningLimit?: number;
};

export function WarningModal({
  open,
  onClose,
  title = 'Tab switching is not allowed during this assessment.',
  description = 'Return to the assessment and remain in the exam window to avoid further warnings.',
  warningCount,
  warningLimit,
}: WarningModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[rgba(8,18,14,0.48)]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            className="fixed inset-0 z-50 grid place-items-center p-4"
          >
            <div className="dashboard-panel-strong w-full max-w-md rounded-[1.8rem] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--dashboard-warm-soft)] text-[var(--dashboard-warm-foreground)]">
                <WarningIcon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-[var(--dashboard-text)]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--dashboard-muted)]">
                {description}
              </p>
              {typeof warningCount === 'number' && typeof warningLimit === 'number' ? (
                <div className="mt-4 rounded-[1.2rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] px-4 py-3 text-sm font-semibold text-[var(--dashboard-text)]">
                  Warning {warningCount} of {warningLimit}
                </div>
              ) : null}
              <button type="button" onClick={onClose} className="dashboard-dark-button mt-5 inline-flex rounded-2xl px-4 py-3 text-sm font-semibold transition">
                Continue Assessment
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
