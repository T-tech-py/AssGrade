'use client';

import type { ReactNode } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

type PracticeLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
  variant?: 'workspace' | 'session';
};

export function PracticeLayout({
  children,
  title,
  subtitle,
  variant = 'workspace',
}: PracticeLayoutProps) {
  if (variant === 'workspace') {
    return (
      <DashboardLayout title={title} subtitle={subtitle}>
        {children}
      </DashboardLayout>
    );
  }

  return (
    <div className="practice-shell min-h-screen px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
      <div className="practice-panel-strong mx-auto min-h-[calc(100vh-1.5rem)] max-w-[96rem] rounded-[2rem] p-4 sm:p-5 lg:p-6">
        <div className="mb-5 lg:mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--practice-accent-foreground)]">Practice mode</p>
          <h1 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--practice-text)] sm:text-[2.4rem]">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--practice-muted)] sm:text-base">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
