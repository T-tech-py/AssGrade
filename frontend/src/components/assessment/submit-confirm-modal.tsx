'use client';

import { AnimatePresence, motion } from 'framer-motion';

type SubmitConfirmModalProps = {
  open: boolean;
  unansweredCount: number;
  flaggedCount: number;
  onReview: () => void;
  onSubmit: () => void;
};

export function SubmitConfirmModal({
  open,
  unansweredCount,
  flaggedCount,
  onReview,
  onSubmit,
}: SubmitConfirmModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[rgba(8,18,14,0.52)]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            className="fixed inset-0 z-50 grid place-items-center p-4"
          >
            <div className="dashboard-panel-strong w-full max-w-lg rounded-[1.8rem] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">
                Submission check
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-[var(--dashboard-text)]">Submit Assessment?</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--dashboard-muted)]">
                You still have unanswered or flagged questions. Are you sure you want to submit?
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.3rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-muted)]">Unanswered</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--dashboard-text)]">{unansweredCount}</p>
                </div>
                <div className="rounded-[1.3rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-muted)]">Flagged</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--dashboard-text)]">{flaggedCount}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={onReview} className="dashboard-dark-button inline-flex justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition">
                  Review Questions
                </button>
                <button type="button" onClick={onSubmit} className="dashboard-lime-panel inline-flex justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-[#203100]">
                  Submit Now
                </button>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
