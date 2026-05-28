type SettingsSecurityCardProps = {
  passwordUpdatedAt: string;
  sessionCount: number;
  isSessionsLoading: boolean;
  onOpenPassword: () => void;
  onOpenSessions: () => void;
  onOpenTwoFactor: () => void;
  title?: string;
};

function formatPasswordUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Recently updated';
  }

  return `Updated ${date.toLocaleDateString()}`;
}

export function SettingsSecurityCard({
  passwordUpdatedAt,
  sessionCount,
  isSessionsLoading,
  onOpenPassword,
  onOpenSessions,
  onOpenTwoFactor,
  title = 'Security',
}: SettingsSecurityCardProps) {
  const items = [
    {
      label: 'Password',
      value: formatPasswordUpdatedAt(passwordUpdatedAt),
      action: 'Change password',
      onClick: onOpenPassword,
    },
    {
      label: 'Two-step verification',
      value: 'Coming soon',
      action: 'Learn more',
      onClick: onOpenTwoFactor,
    },
    {
      label: 'Active sessions',
      value: isSessionsLoading ? 'Loading sessions...' : `${sessionCount} active session${sessionCount === 1 ? '' : 's'}`,
      action: 'Review sessions',
      onClick: onOpenSessions,
    },
  ];

  return (
    <div className="dashboard-panel rounded-[1.8rem] p-5">
      <p className="text-sm font-semibold text-[var(--dashboard-text)]">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="dashboard-soft-tile flex items-center justify-between gap-4 rounded-[1.2rem] px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-[var(--dashboard-text)]">{item.label}</p>
              <p className="mt-1 text-sm text-[var(--dashboard-muted)]">{item.value}</p>
            </div>
            <button
              type="button"
              onClick={item.onClick}
              className="dashboard-dark-button rounded-2xl px-4 py-2 text-sm font-semibold transition"
            >
              {item.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
