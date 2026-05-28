'use client';

import { ThemeToggle } from '../landing/theme-toggle';
import { MenuIcon } from './icons';

type TopNavbarProps = {
  title: string;
  subtitle: string;
  student: {
    name: string;
    course: string;
  };
  onOpenSidebar: () => void;
};

export function TopNavbar({ title, subtitle, student, onOpenSidebar }: TopNavbarProps) {
  return (
    <header className="dashboard-panel flex flex-col gap-4 rounded-[1.8rem] px-4 py-4 sm:px-5 lg:px-6 lg:py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="dashboard-dark-button flex h-11 w-11 items-center justify-center rounded-2xl lg:hidden"
            aria-label="Open navigation"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">Student dashboard</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--dashboard-text)] sm:text-[2rem]">
              {title}
            </h1>
            <p className="mt-1 text-sm leading-6 text-[var(--dashboard-muted)] sm:text-[0.96rem]">{subtitle}</p>
          </div>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <ThemeToggle />
          <button
            type="button"
            className="dashboard-dark-button flex min-w-[16rem] max-w-[22rem] items-center gap-3 rounded-2xl px-4 py-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--dashboard-accent-soft)] text-sm font-semibold text-[var(--dashboard-accent-foreground)]">
              {student.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="break-words text-sm font-semibold leading-6 text-[var(--dashboard-text)]">
                {student.name}
              </p>
              <p className="break-words text-xs leading-5 text-[var(--dashboard-muted)]">
                {student.course}
              </p>
            </div>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:hidden">
        <ThemeToggle />
      </div>
    </header>
  );
}
