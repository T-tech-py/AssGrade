import type { ReactNode } from 'react';
import Link from 'next/link';

type MobileDataCardProps = {
  title: string;
  subtitle: string;
  meta?: string;
  badges?: ReactNode;
  rows: Array<{ label: string; value: string | ReactNode }>;
  actions?: ReactNode;
  href?: string;
};

export function MobileDataCard({
  title,
  subtitle,
  meta,
  badges,
  rows,
  actions,
  href,
}: MobileDataCardProps) {
  const content = (
    <div className="dashboard-panel rounded-[1.6rem] p-4 xl:hidden">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-[var(--dashboard-text)]">{title}</h3>
          {badges}
        </div>
        <p className="text-sm text-[var(--dashboard-muted)]">{subtitle}</p>
        {meta ? <p className="text-xs uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">{meta}</p> : null}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="dashboard-soft-tile rounded-[1.1rem] px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
              {row.label}
            </p>
            <div className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{row.value}</div>
          </div>
        ))}
      </div>
      {actions ? <div className="mt-4">{actions}</div> : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block xl:hidden">
        {content}
      </Link>
    );
  }

  return content;
}
