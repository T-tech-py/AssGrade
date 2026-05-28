type SettingsToggleCardProps = {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (nextValue: boolean) => void;
};

export function SettingsToggleCard({
  title,
  description,
  enabled,
  onChange,
}: SettingsToggleCardProps) {
  return (
    <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--dashboard-text)]">{title}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(!enabled)}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border p-[3px] transition ${
            enabled
              ? 'justify-end border-[var(--dashboard-accent-foreground)] bg-[var(--dashboard-accent-foreground)]'
              : 'justify-start border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-border)]'
          }`}
          aria-pressed={enabled}
        >
          <span
            className="h-5 w-5 rounded-full bg-white shadow-[0_4px_12px_rgba(15,23,42,0.18)] transition"
          />
        </button>
      </div>
    </div>
  );
}
