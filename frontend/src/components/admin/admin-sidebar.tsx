'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AdminNavItem } from '@/data/admin-dashboard';
import { ThemeToggle } from '../landing/theme-toggle';
import { AdminSidebarIcon } from './admin-icons';

type AdminSidebarProps = {
  navItems: AdminNavItem[];
  profile: {
    name: string;
    role: string;
    team: string;
  };
  onNavigate?: () => void;
  onLogout: () => Promise<void>;
};

export function AdminSidebar({ navItems, profile, onNavigate, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="dashboard-sidebar flex h-full min-h-[calc(100vh-1rem)] flex-col p-4 lg:p-5">
      <div className="flex items-center justify-between gap-3 px-2 pb-5">
        <Link href="/admin" className="flex items-center gap-3" onClick={onNavigate}>
          <div className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] bg-[var(--dashboard-accent-soft)] text-sm font-semibold text-[var(--dashboard-accent-foreground)] shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
            GA
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-[var(--dashboard-text)]">GradAssess AI</p>
            <p className="text-xs text-[var(--dashboard-muted)]">Admin workspace</p>
          </div>
        </Link>
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>
      </div>

      <div className="dashboard-panel rounded-[1.6rem] px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-accent-foreground)]">
          Operations pulse
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--dashboard-text)]">
          Keep the platform healthy, review risk fast, and keep assessment quality high.
        </p>
      </div>

      <nav className="mt-5 flex-1 space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-[1.3rem] px-3 py-3 transition ${
                active
                  ? 'bg-[var(--dashboard-nav-active-bg)] shadow-[0_12px_30px_rgba(0,0,0,0.12)]'
                  : 'hover:bg-[var(--dashboard-nav-hover-bg)]'
              }`}
            >
              <AdminSidebarIcon name={item.icon} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--dashboard-text)]">{item.label}</p>
                <p className="truncate text-xs text-[var(--dashboard-muted)]">
                  {active ? 'Current section' : 'Open workspace'}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="dashboard-panel mt-5 rounded-[1.6rem] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--dashboard-icon-surface)] text-sm font-semibold text-[var(--dashboard-text)]">
            {profile.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--dashboard-text)]">{profile.name}</p>
            <p className="truncate text-xs text-[var(--dashboard-muted)]">
              {profile.role} • {profile.team}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            void onLogout();
          }}
          className="dashboard-dark-button mt-4 flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
