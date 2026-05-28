import type { AdminIconName } from '@/data/admin-dashboard';

type IconProps = {
  className?: string;
};

const shared = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function AdminMaterialIcon({
  name,
  className,
}: {
  name: AdminIconName;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {name === 'overview' ? (
        <>
          <rect x="4" y="4" width="7" height="7" rx="1.5" {...shared} />
          <rect x="13" y="4" width="7" height="5" rx="1.5" {...shared} />
          <rect x="13" y="11" width="7" height="9" rx="1.5" {...shared} />
          <rect x="4" y="13" width="7" height="7" rx="1.5" {...shared} />
        </>
      ) : null}
      {name === 'users' ? (
        <>
          <circle cx="9" cy="9" r="2.5" {...shared} />
          <circle cx="16.5" cy="10" r="2" {...shared} />
          <path d="M4.5 18c.8-2.4 2.5-3.8 4.5-3.8 2 0 3.7 1.4 4.5 3.8" {...shared} />
          <path d="M14 18c.5-1.7 1.7-2.8 3.5-2.8 1.1 0 2 .3 2.8 1" {...shared} />
        </>
      ) : null}
      {name === 'assessments' ? (
        <>
          <rect x="6" y="4.5" width="12" height="15" rx="2" {...shared} />
          <path d="M9 4.5h6v3H9z" {...shared} />
          <path d="M9 11h6M9 15h4" {...shared} />
        </>
      ) : null}
      {name === 'questions' ? (
        <>
          <path d="M9.2 9.2a2.8 2.8 0 1 1 4.6 2.2c-.88.72-1.55 1.26-1.55 2.35" {...shared} />
          <circle cx="12" cy="17.3" r=".8" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="8" {...shared} />
        </>
      ) : null}
      {name === 'attempts' ? (
        <>
          <path d="M5 18v-5M10 18V8M15 18v-3M20 18V6" {...shared} />
          <path d="M4 18h17" {...shared} />
        </>
      ) : null}
      {name === 'certificates' ? (
        <>
          <path d="M7 4h10a2 2 0 0 1 2 2v7.2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" {...shared} />
          <path d="m10 15 2 2 2-2v5l-2-1.4L10 20v-5Z" {...shared} />
          <circle cx="12" cy="9.5" r="2.5" {...shared} />
        </>
      ) : null}
      {name === 'security' || name === 'shield' ? (
        <>
          <path d="M12 3.5 19 6v5.2c0 4.1-2.7 7.4-7 9.3-4.3-1.9-7-5.2-7-9.3V6l7-2.5Z" {...shared} />
          <path d="m9.5 12 1.8 1.8 3.4-3.6" {...shared} />
        </>
      ) : null}
      {name === 'ai' ? (
        <>
          <path d="M12 4.5a5.5 5.5 0 0 0-5.5 5.5c0 2.2 1.08 3.35 2.32 4.34.78.63 1.18 1.11 1.18 1.91V18h4v-1.75c0-.8.4-1.28 1.18-1.91 1.24-.99 2.32-2.14 2.32-4.34A5.5 5.5 0 0 0 12 4.5Z" {...shared} />
          <path d="M10 21h4M10.5 18h3" {...shared} />
        </>
      ) : null}
      {name === 'settings' ? (
        <>
          <circle cx="12" cy="12" r="3.1" {...shared} />
          <path d="M19 12a7 7 0 0 0-.08-1l2.02-1.57-2-3.46-2.42.85a7.3 7.3 0 0 0-1.74-1.01L14.4 3h-4.8l-.38 2.81c-.62.24-1.21.58-1.74 1.01l-2.42-.85-2 3.46L5.08 11a7 7 0 0 0 0 2l-2.02 1.57 2 3.46 2.42-.85c.53.43 1.12.77 1.74 1.01L9.6 21h4.8l.38-2.81c.62-.24 1.21-.58 1.74-1.01l2.42.85 2-3.46L18.92 13c.05-.33.08-.66.08-1Z" {...shared} />
        </>
      ) : null}
      {name === 'trend' ? (
        <>
          <path d="M4.5 17.5 10 12l3.2 3.2L19 9.5" {...shared} />
          <path d="M14.5 9.5H19V14" {...shared} />
        </>
      ) : null}
      {name === 'score' ? (
        <>
          <circle cx="12" cy="12" r="7.5" {...shared} />
          <path d="M12 12 16.5 8.5" {...shared} />
          <path d="M12 6.5v1.5M5.5 12H7M17 12h1.5M12 17v1.5" {...shared} />
        </>
      ) : null}
      {name === 'alert' ? (
        <>
          <path d="M12 4.5 20 18H4l8-13.5Z" {...shared} />
          <path d="M12 9.5v4.5" {...shared} />
          <circle cx="12" cy="16.4" r=".7" fill="currentColor" stroke="none" />
        </>
      ) : null}
      {name === 'bolt' ? (
        <>
          <path d="m13 3-7 10h5l-1 8 8-11h-5l0-7Z" {...shared} />
        </>
      ) : null}
      {name === 'search' ? (
        <>
          <circle cx="11" cy="11" r="6.5" {...shared} />
          <path d="m16 16 4 4" {...shared} />
        </>
      ) : null}
      {name === 'notification' ? (
        <>
          <path d="M6.5 16.5h11l-1.2-1.4A2.6 2.6 0 0 1 15.7 13V10a3.7 3.7 0 1 0-7.4 0v3c0 .77-.28 1.51-.8 2.1L6.5 16.5Z" {...shared} />
          <path d="M10 19a2.1 2.1 0 0 0 4 0" {...shared} />
        </>
      ) : null}
      {name === 'calendar' ? (
        <>
          <path d="M7 4.5V7M17 4.5V7M5 8h14M6.5 5.5h11A1.5 1.5 0 0 1 19 7v10.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 17.5V7a1.5 1.5 0 0 1 1.5-1.5Z" {...shared} />
        </>
      ) : null}
      {name === 'time' ? (
        <>
          <circle cx="12" cy="13" r="6.5" {...shared} />
          <path d="M12 13V9.5M9.5 3.5h5M12 6.5v-3" {...shared} />
        </>
      ) : null}
      {name === 'more' ? (
        <>
          <circle cx="6" cy="12" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="18" cy="12" r="1.2" fill="currentColor" stroke="none" />
        </>
      ) : null}
      {name === 'duplicate' ? (
        <>
          <rect x="9" y="8" width="9" height="10" rx="2" {...shared} />
          <path d="M6.5 14H6A2 2 0 0 1 4 12V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v.5" {...shared} />
        </>
      ) : null}
      {name === 'archive' ? (
        <>
          <path d="M4 7h16v3H4z" {...shared} />
          <path d="M6 10h12v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-8Z" {...shared} />
          <path d="M10 13h4" {...shared} />
        </>
      ) : null}
      {name === 'edit' ? (
        <>
          <path d="M4 20h4l9.7-9.7a1.8 1.8 0 0 0 0-2.6l-1.4-1.4a1.8 1.8 0 0 0-2.6 0L4 16v4Z" {...shared} />
          <path d="m12.5 7.5 4 4" {...shared} />
        </>
      ) : null}
      {name === 'review' ? (
        <>
          <path d="M5 12s2.5-4 7-4 7 4 7 4-2.5 4-7 4-7-4-7-4Z" {...shared} />
          <circle cx="12" cy="12" r="1.8" {...shared} />
        </>
      ) : null}
      {name === 'verified' ? (
        <>
          <path d="M12 3.5 19 6v5.2c0 4.1-2.7 7.4-7 9.3-4.3-1.9-7-5.2-7-9.3V6l7-2.5Z" {...shared} />
          <path d="m9.5 12 1.8 1.8 3.4-3.6" {...shared} />
        </>
      ) : null}
      {name === 'support' ? (
        <>
          <path d="M8.5 9.5a3.5 3.5 0 1 1 5.7 2.7c-1 .8-1.7 1.4-1.7 2.8" {...shared} />
          <circle cx="12" cy="17.5" r=".8" fill="currentColor" stroke="none" />
          <path d="M20 12a8 8 0 1 1-2.3-5.7" {...shared} />
        </>
      ) : null}
    </svg>
  );
}

export function AdminSidebarIcon({ name }: { name: AdminIconName }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--dashboard-icon-surface)] text-[var(--dashboard-icon-foreground)]">
      <AdminMaterialIcon name={name} className="h-[18px] w-[18px]" />
    </span>
  );
}

export function AdminMetricIcon({
  name,
  tone,
}: {
  name: AdminIconName;
  tone: 'accent' | 'warm' | 'success' | 'danger' | 'neutral';
}) {
  const toneClass =
    tone === 'accent'
      ? 'bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)]'
      : tone === 'warm'
        ? 'bg-[var(--dashboard-warm-soft)] text-[var(--dashboard-warm-foreground)]'
        : tone === 'success'
          ? 'bg-[var(--dashboard-success-soft)] text-[var(--dashboard-success-foreground)]'
          : tone === 'danger'
            ? 'bg-[rgba(190,24,93,0.12)] text-[rgb(190,24,93)] dark:bg-[rgba(251,113,133,0.12)] dark:text-[rgb(254,205,211)]'
            : 'bg-[var(--dashboard-icon-surface)] text-[var(--dashboard-text)]';

  return (
    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}>
      <AdminMaterialIcon name={name} className="h-[18px] w-[18px]" />
    </div>
  );
}

export function BellAdminIcon({ className }: IconProps) {
  return <AdminMaterialIcon name="notification" className={className} />;
}

export function SearchAdminIcon({ className }: IconProps) {
  return <AdminMaterialIcon name="search" className={className} />;
}

export function MenuAdminIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
