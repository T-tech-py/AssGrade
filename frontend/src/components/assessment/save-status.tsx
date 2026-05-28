type SaveStatusProps = {
  status: 'saved' | 'saving';
  message?: string;
};

export function SaveStatus({ status, message }: SaveStatusProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-[var(--dashboard-icon-surface)] px-3 py-2 text-xs font-semibold text-[var(--dashboard-text)]">
      <span className={`h-2 w-2 rounded-full ${status === 'saved' ? 'bg-[var(--dashboard-accent-foreground)]' : 'bg-[var(--dashboard-warm-foreground)]'}`} />
      {message ?? (status === 'saved' ? 'All responses saved' : 'Saving...')}
    </div>
  );
}
