import type { ReactNode } from 'react';
import type { DashboardIconName } from '@/data/student-dashboard';

type IconProps = {
  className?: string;
};

export function MaterialIcon({
  name,
  className,
}: {
  name: DashboardIconName;
  className?: string;
}) {
  const shared = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {name === 'dashboard' ? (
        <>
          <rect x="4" y="4" width="7" height="7" rx="1.5" {...shared} />
          <rect x="13" y="4" width="7" height="5" rx="1.5" {...shared} />
          <rect x="13" y="11" width="7" height="9" rx="1.5" {...shared} />
          <rect x="4" y="13" width="7" height="7" rx="1.5" {...shared} />
        </>
      ) : null}
      {name === 'assignment' ? (
        <>
          <rect x="6" y="4.5" width="12" height="15" rx="2" {...shared} />
          <path d="M9 4.5h6v3H9z" {...shared} />
          <path d="M9 11h6M9 15h4" {...shared} />
        </>
      ) : null}
      {name === 'psychology' ? (
        <>
          <path d="M12 4.5a5.5 5.5 0 0 0-5.5 5.5c0 2.2 1.08 3.35 2.32 4.34.78.63 1.18 1.11 1.18 1.91V18h4v-1.75c0-.8.4-1.28 1.18-1.91 1.24-.99 2.32-2.14 2.32-4.34A5.5 5.5 0 0 0 12 4.5Z" {...shared} />
          <path d="M10 21h4M10.5 18h3" {...shared} />
        </>
      ) : null}
      {name === 'analytics' ? (
        <>
          <path d="M5 19V9M12 19V5M19 19v-7" {...shared} />
          <path d="M4 19h16" {...shared} />
        </>
      ) : null}
      {name === 'workspace_premium' ? (
        <>
          <path d="m12 4 2.1 4.2L19 9l-3.5 3.4.8 4.8-4.3-2.2-4.3 2.2.8-4.8L5 9l4.9-.8L12 4Z" {...shared} />
        </>
      ) : null}
      {name === 'insights' ? (
        <>
          <path d="M5 18c1.7-2.8 4.3-4.5 7-4.5s5.3 1.7 7 4.5" {...shared} />
          <path d="M12 13.5V6M9 9l3-3 3 3" {...shared} />
        </>
      ) : null}
      {name === 'settings' ? (
        <>
          <circle cx="12" cy="12" r="3.1" {...shared} />
          <path d="M19 12a7 7 0 0 0-.08-1l2.02-1.57-2-3.46-2.42.85a7.3 7.3 0 0 0-1.74-1.01L14.4 3h-4.8l-.38 2.81c-.62.24-1.21.58-1.74 1.01l-2.42-.85-2 3.46L5.08 11a7 7 0 0 0 0 2l-2.02 1.57 2 3.46 2.42-.85c.53.43 1.12.77 1.74 1.01L9.6 21h4.8l.38-2.81c.62-.24 1.21-.58 1.74-1.01l2.42.85 2-3.46L18.92 13c.05-.33.08-.66.08-1Z" {...shared} />
        </>
      ) : null}
      {name === 'trending_up' ? (
        <>
          <path d="M5 16.5 10 11.5l3 3L19 8.5" {...shared} />
          <path d="M14.5 8.5H19v4.5" {...shared} />
        </>
      ) : null}
      {name === 'track_changes' ? (
        <>
          <circle cx="12" cy="12" r="6.8" {...shared} />
          <circle cx="12" cy="12" r="1.8" {...shared} />
        </>
      ) : null}
      {name === 'play_circle' ? (
        <>
          <circle cx="12" cy="12" r="8" {...shared} />
          <path d="m10 8.8 5 3.2-5 3.2V8.8Z" {...shared} />
        </>
      ) : null}
      {name === 'school' ? (
        <>
          <path d="m4 10 8-4 8 4-8 4-8-4Z" {...shared} />
          <path d="M7 11.7v3.4c1.3 1 3 1.5 5 1.5s3.7-.5 5-1.5v-3.4" {...shared} />
        </>
      ) : null}
    </svg>
  );
}

export function SidebarIcon({ name }: { name: DashboardIconName }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--dashboard-icon-surface)] text-[var(--dashboard-icon-foreground)]">
      <MaterialIcon name={name} className="h-[18px] w-[18px]" />
    </span>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M6.5 16.5h11l-1.2-1.4A2.6 2.6 0 0 1 15.7 13V10a3.7 3.7 0 1 0-7.4 0v3c0 .77-.28 1.51-.8 2.1L6.5 16.5Z" />
      <path d="M10 19a2.1 2.1 0 0 0 4 0" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function ArrowUpRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

export function SparkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5 14 8l5.5 2-5.5 2-2 5.5-2-5.5-5.5-2L10 8l2-5.5Z" />
    </svg>
  );
}

export function TrophyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M8 4h8v2a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5H5a2 2 0 0 0 2 3" />
      <path d="M16 5h3a2 2 0 0 1-2 3" />
      <path d="M12 10v5" />
      <path d="M9 20h6" />
      <path d="M10 15h4v2a2 2 0 0 1-4 0v-2Z" />
    </svg>
  );
}

export function StatIcon({ tone, children }: { tone: 'accent' | 'warm' | 'neutral' | 'success'; children: ReactNode }) {
  const toneClass =
    tone === 'accent'
      ? 'bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)]'
      : tone === 'warm'
        ? 'bg-[var(--dashboard-warm-soft)] text-[var(--dashboard-warm-foreground)]'
        : tone === 'success'
          ? 'bg-[var(--dashboard-success-soft)] text-[var(--dashboard-success-foreground)]'
          : 'bg-[var(--dashboard-icon-surface)] text-[var(--dashboard-text)]';

  return (
    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold ${toneClass}`}>
      {children}
    </div>
  );
}
