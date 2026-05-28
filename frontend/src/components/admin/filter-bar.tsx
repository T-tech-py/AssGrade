import Link from 'next/link';

type FilterBarProps = {
  searchPlaceholder: string;
  filters: Array<{ label: string; value: string }>;
  ctaLabel?: string;
  ctaHref?: string;
  compact?: boolean;
  leadingTitle?: string;
  trailingLabel?: string;
};

export function FilterBar({
  searchPlaceholder,
  filters,
  ctaLabel,
  ctaHref,
  compact = false,
  leadingTitle,
  trailingLabel,
}: FilterBarProps) {
  return (
    <div className={`dashboard-panel rounded-[1.6rem] ${compact ? 'p-4 sm:p-4.5' : 'p-4 sm:p-5'}`}>
      {(leadingTitle || trailingLabel) ? (
        <div className="mb-4 flex flex-col gap-3 border-b border-[var(--dashboard-panel-border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
          {leadingTitle ? (
            <p className="text-sm font-semibold text-[var(--dashboard-text)]">{leadingTitle}</p>
          ) : (
            <div />
          )}
          {trailingLabel ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 text-xs font-medium text-[var(--dashboard-muted)] transition hover:text-[var(--dashboard-text)]"
            >
              <span className="text-sm">⇪</span>
              {trailingLabel}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className={`flex flex-col gap-3 ${compact ? '' : 'lg:flex-row lg:items-center lg:justify-between'}`}>
        <label className={`flex min-h-11 w-full items-center gap-3 rounded-xl border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] px-3.5 py-2.5 ${compact ? 'lg:max-w-xs' : 'lg:max-w-md'}`}>
          <span className="text-sm text-[var(--dashboard-muted)]">⌕</span>
          <input
            type="search"
            placeholder={searchPlaceholder}
            className="w-full bg-transparent text-sm text-[var(--dashboard-text)] outline-none placeholder:text-[var(--dashboard-muted)]"
          />
        </label>
        {ctaLabel ? (
          ctaHref ? (
            <Link
              href={ctaHref}
              className="dashboard-lime-panel rounded-2xl px-4 py-3 text-center text-sm font-semibold text-[#223200]"
            >
              {ctaLabel}
            </Link>
          ) : (
            <button
              type="button"
              className="dashboard-lime-panel rounded-2xl px-4 py-3 text-sm font-semibold text-[#223200]"
            >
              {ctaLabel}
            </button>
          )
        ) : null}
      </div>
      <div className={`mt-4 flex flex-wrap gap-2 ${compact ? 'border-t border-[var(--dashboard-panel-border)] pt-4' : ''}`}>
        {filters.map((filter) => (
          <button
            key={`${filter.label}-${filter.value}`}
            type="button"
            className={`rounded-xl border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] text-[var(--dashboard-text)] ${compact ? 'px-2.5 py-1.5 text-[11px] font-medium' : 'px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em]'}`}
          >
            {compact ? (
              <>
                <span className="text-[var(--dashboard-muted)]">{filter.label}</span>
                <span className="mx-1 text-[var(--dashboard-panel-border)]">•</span>
                <span>{filter.value}</span>
              </>
            ) : (
              `${filter.label}: ${filter.value}`
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
