'use client';

import { ThemeToggle } from '../landing/theme-toggle';
import { BellAdminIcon, MenuAdminIcon, SearchAdminIcon } from './admin-icons';

type AdminTopNavbarProps = {
  title: string;
  subtitle: string;
  profile: {
    name: string;
    role: string;
  };
  onOpenSidebar: () => void;
};

export function AdminTopNavbar({
  title,
  subtitle,
  profile,
  onOpenSidebar,
}: AdminTopNavbarProps) {
  return (
    <header className="dashboard-panel flex flex-col gap-4 rounded-[1.8rem] px-4 py-4 sm:px-5 lg:px-6 lg:py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="dashboard-dark-button flex h-11 w-11 items-center justify-center rounded-2xl lg:hidden"
            aria-label="Open admin navigation"
          >
            <MenuAdminIcon className="h-5 w-5" />
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">
              Admin dashboard
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--dashboard-text)] sm:text-[2rem]">
              {title}
            </h1>
            <p className="mt-1 text-sm leading-6 text-[var(--dashboard-muted)] sm:text-[0.96rem]">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <ThemeToggle />
          <button
            type="button"
            className="dashboard-dark-button relative flex h-11 w-11 items-center justify-center rounded-2xl"
            aria-label="Admin notifications"
          >
            <BellAdminIcon className="h-5 w-5" />
            <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-semibold text-white">
              6
            </span>
          </button>
          <button type="button" className="dashboard-dark-button flex items-center gap-3 rounded-2xl px-3 py-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--dashboard-accent-soft)] text-sm font-semibold text-[var(--dashboard-accent-foreground)]">
              {profile.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[var(--dashboard-text)]">{profile.name}</p>
              <p className="text-xs text-[var(--dashboard-muted)]">{profile.role}</p>
            </div>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="dashboard-dark-button flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 py-3 sm:max-w-md">
          <SearchAdminIcon className="h-4 w-4 text-[var(--dashboard-muted)]" />
          <input
            type="search"
            placeholder="Search users, assessments, certificates, or incidents"
            className="w-full bg-transparent text-sm text-[var(--dashboard-text)] outline-none placeholder:text-[var(--dashboard-muted)]"
          />
        </label>

        <div className="flex items-center gap-2 sm:hidden">
          <button
            type="button"
            className="dashboard-dark-button relative flex h-11 w-11 items-center justify-center rounded-2xl"
            aria-label="Admin notifications"
          >
            <BellAdminIcon className="h-5 w-5" />
            <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-semibold text-white">
              6
            </span>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
