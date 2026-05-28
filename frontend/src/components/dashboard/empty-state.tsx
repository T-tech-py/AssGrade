import Link from 'next/link';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
};

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="dashboard-panel rounded-[1.8rem] px-6 py-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.3rem] bg-[var(--dashboard-accent-soft)] text-xl text-[var(--dashboard-accent-foreground)]">
        ◪
      </div>
      <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-[var(--dashboard-text)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--dashboard-muted)]">{description}</p>
      <Link href={actionHref} className="dashboard-dark-button mt-5 inline-flex rounded-2xl px-4 py-3 text-sm font-semibold transition">
        {actionLabel}
      </Link>
    </div>
  );
}
