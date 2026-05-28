import { DashboardLayout } from './dashboard-layout';

type DashboardPlaceholderPageProps = {
  title: string;
  subtitle: string;
};

export function DashboardPlaceholderPage({ title, subtitle }: DashboardPlaceholderPageProps) {
  return (
    <DashboardLayout title={title} subtitle={subtitle}>
      <section className="surface-strong rounded-[2rem] px-6 py-10 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Coming next</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">{title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">{subtitle}</p>
        <div className="mt-6 rounded-[1.6rem] border border-dashed border-[var(--line)] bg-[var(--card-muted)] px-5 py-6 text-sm leading-7 text-[var(--muted)]">
          This route is ready for the next phase. Hook it up to real student data, APIs, and interactions when the backend flow is in place.
        </div>
      </section>
    </DashboardLayout>
  );
}
