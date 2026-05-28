'use client';

import { SettingsModalShell } from './settings-modal-shell';

type SettingsComingSoonModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SettingsComingSoonModal({ open, onClose }: SettingsComingSoonModalProps) {
  return (
    <SettingsModalShell
      open={open}
      onClose={onClose}
      eyebrow="Security"
      title="Two-step verification is coming soon"
      description="We’ll add a stronger two-step verification flow in a later phase. For now, keep your password strong and review active sessions regularly."
      maxWidthClassName="max-w-lg"
    >
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="dashboard-lime-panel rounded-2xl px-4 py-3 text-sm font-semibold text-[#223200]"
        >
          Got it
        </button>
      </div>
    </SettingsModalShell>
  );
}
