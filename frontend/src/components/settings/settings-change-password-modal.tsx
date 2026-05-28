'use client';

import { useMemo, useState } from 'react';
import { SettingsModalShell } from './settings-modal-shell';

type SettingsChangePasswordModalProps = {
  open: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (payload: { currentPassword: string; newPassword: string }) => Promise<void>;
};

export function SettingsChangePasswordModal({
  open,
  isSaving,
  onClose,
  onSubmit,
}: SettingsChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | undefined>();

  const passwordRules = useMemo(
    () => [
      { label: 'At least 8 characters', valid: newPassword.length >= 8 },
      { label: 'One uppercase letter', valid: /[A-Z]/.test(newPassword) },
      { label: 'One number', valid: /[0-9]/.test(newPassword) },
    ],
    [newPassword],
  );

  const resetState = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(undefined);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Fill in all password fields to continue.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Your new password and confirmation do not match.');
      return;
    }

    if (passwordRules.some((rule) => !rule.valid)) {
      setError('Use at least 8 characters, one uppercase letter, and one number.');
      return;
    }

    setError(undefined);
    await onSubmit({ currentPassword, newPassword });
    resetState();
  };

  return (
    <SettingsModalShell
      open={open}
      onClose={handleClose}
      eyebrow="Security"
      title="Change your password"
      description="Update your password and keep this device signed in while other sessions are revoked."
      maxWidthClassName="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <div className="rounded-[1.2rem] border border-rose-400/35 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <label className="block">
          <span className="text-sm font-semibold text-[var(--dashboard-text)]">Current password</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="dashboard-soft-tile mt-2 w-full rounded-2xl border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm text-[var(--dashboard-text)] outline-none"
            placeholder="Enter your current password"
            autoComplete="current-password"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-[var(--dashboard-text)]">New password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="dashboard-soft-tile mt-2 w-full rounded-2xl border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm text-[var(--dashboard-text)] outline-none"
              placeholder="Create a stronger password"
              autoComplete="new-password"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-[var(--dashboard-text)]">Confirm new password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="dashboard-soft-tile mt-2 w-full rounded-2xl border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm text-[var(--dashboard-text)] outline-none"
              placeholder="Confirm your new password"
              autoComplete="new-password"
            />
          </label>
        </div>

        <div className="dashboard-soft-tile rounded-[1.3rem] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
            Password rules
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {passwordRules.map((rule) => (
              <div
                key={rule.label}
                className={`rounded-2xl px-3 py-2 text-sm ${
                  rule.valid
                    ? 'bg-[var(--dashboard-success-soft)] text-[var(--dashboard-success-foreground)]'
                    : 'bg-[var(--dashboard-icon-surface)] text-[var(--dashboard-muted)]'
                }`}
              >
                {rule.label}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="dashboard-dark-button rounded-2xl px-4 py-3 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="dashboard-lime-panel rounded-2xl px-4 py-3 text-sm font-semibold text-[#223200] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Updating password...' : 'Update password'}
          </button>
        </div>
      </form>
    </SettingsModalShell>
  );
}
