import type { ReactNode } from 'react';

type AssessmentLayoutProps = {
  children: ReactNode;
};

export function AssessmentLayout({ children }: AssessmentLayoutProps) {
  return (
    <main className="dashboard-shell min-h-screen px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5">
      <div className="mx-auto max-w-[96rem]">{children}</div>
    </main>
  );
}
