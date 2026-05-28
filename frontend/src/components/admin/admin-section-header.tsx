import Link from 'next/link';

type AdminSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  actionHref?: string;
};

export function AdminSectionHeader({
  eyebrow,
  title,
  subtitle,
  actionLabel,
  actionHref,
}: AdminSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-[1.55rem] font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--dashboard-muted)]">{subtitle}</p>
      </div>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="text-sm font-semibold text-[var(--dashboard-accent-foreground)] transition hover:opacity-80"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
