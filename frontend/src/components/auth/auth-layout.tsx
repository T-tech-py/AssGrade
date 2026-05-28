import type { ReactNode } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '../landing/theme-toggle';
import { AuthBrandPanel } from './auth-brand-panel';

type AuthLayoutProps = {
  children: ReactNode;
  panelTitle: string;
  panelDescription: string;
  panelEyebrow?: string;
  accentLabel?: string;
};

export function AuthLayout({
  children,
  panelTitle,
  panelDescription,
  panelEyebrow,
  accentLabel,
}: AuthLayoutProps) {
  return (
    <main className="auth-shell relative min-h-screen overflow-hidden px-3 py-3 sm:px-5 sm:py-5 lg:h-screen lg:px-8 lg:py-7">
      <div className="hero-grid absolute inset-0 -z-20 opacity-40" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(19,118,74,0.1),transparent_26%),radial-gradient(circle_at_90%_0%,rgba(216,161,38,0.12),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(19,118,74,0.08),transparent_24%)]" />
      <div className="auth-form-card mx-auto mb-3 flex max-w-7xl items-center justify-between rounded-[1.5rem] px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--dashboard-accent-soft)] text-sm font-semibold text-[var(--dashboard-accent-foreground)] shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
            GA
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-[var(--auth-text)]">
              GradAssess AI
            </p>
            <p className="text-xs text-[var(--auth-muted-text)]">Assess your readiness. Improve your future.</p>
          </div>
        </Link>
        <ThemeToggle />
      </div>
      <div className="auth-board mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[92rem] overflow-hidden rounded-[2rem] backdrop-blur lg:h-[calc(100vh-3.5rem)] lg:min-h-0 lg:grid-cols-[minmax(26rem,1.02fr)_minmax(0,0.98fr)] xl:rounded-[2.25rem]">
        <AuthBrandPanel
          title={panelTitle}
          description={panelDescription}
          eyebrow={panelEyebrow}
          accentLabel={accentLabel}
        />
        <section className="relative flex min-h-0 items-start justify-center overflow-y-auto px-4 py-5 sm:px-7 sm:py-7 lg:px-12 lg:py-12">
          <div className="absolute right-6 top-6 hidden lg:block xl:right-8 xl:top-8">
            <ThemeToggle />
          </div>
          <div className="w-full max-w-[35rem] lg:pb-8 lg:pt-12 xl:pt-10">{children}</div>
        </section>
      </div>
    </main>
  );
}
