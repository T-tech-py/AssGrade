'use client';

import type { ActiveSession } from './settings-types';
import { SettingsModalShell } from './settings-modal-shell';

type SettingsActiveSessionsModalProps = {
  open: boolean;
  sessions: ActiveSession[];
  isLoading: boolean;
  isRevoking: boolean;
  onClose: () => void;
  onRevoke: (sessionId: string) => Promise<void>;
  onRevokeOthers: () => Promise<void>;
};

function formatSessionMeta(session: ActiveSession) {
  return [
    session.userAgent?.split(')')[0]?.trim() || 'Unknown browser',
    session.ipAddress ? `IP ${session.ipAddress}` : null,
  ]
    .filter(Boolean)
    .join(' • ');
}

export function SettingsActiveSessionsModal({
  open,
  sessions,
  isLoading,
  isRevoking,
  onClose,
  onRevoke,
  onRevokeOthers,
}: SettingsActiveSessionsModalProps) {
  return (
    <SettingsModalShell
      open={open}
      onClose={onClose}
      eyebrow="Security"
      title="Active sessions"
      description="Review the devices currently signed in to your account and revoke any session you no longer recognize."
      maxWidthClassName="max-w-3xl"
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-[var(--dashboard-muted)]">
            Your current device stays protected. Use the bulk action below to sign out of other devices quickly.
          </p>
          <button
            type="button"
            onClick={() => void onRevokeOthers()}
            disabled={isRevoking || isLoading || sessions.length <= 1}
            className="dashboard-lime-panel rounded-2xl px-4 py-3 text-sm font-semibold text-[#223200] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRevoking ? 'Updating...' : 'Log out of other devices'}
          </button>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="dashboard-soft-tile rounded-[1.3rem] px-4 py-5 text-sm text-[var(--dashboard-muted)]">
              Loading active sessions...
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="dashboard-soft-tile flex flex-col gap-4 rounded-[1.3rem] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--dashboard-text)]">
                      {session.deviceId || 'Unknown device'}
                    </p>
                    {session.isCurrent ? (
                      <span className="rounded-full bg-[var(--dashboard-success-soft)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-success-foreground)]">
                        Current
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
                    {formatSessionMeta(session)}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                    Signed in {new Date(session.createdAt).toLocaleString()} • Expires {new Date(session.expiresAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void onRevoke(session.id)}
                  disabled={session.isCurrent || isRevoking}
                  className="dashboard-dark-button rounded-2xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {session.isCurrent ? 'Current session' : 'Revoke session'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </SettingsModalShell>
  );
}
