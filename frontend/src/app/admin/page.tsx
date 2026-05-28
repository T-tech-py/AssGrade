'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminSectionHeader } from '@/components/admin/admin-section-header';
import { AttemptsLineCard, PassFailChartCard } from '@/components/admin/analytics-card';
import { MetricCard } from '@/components/admin/metric-card';
import { QuickActionCard } from '@/components/admin/quick-action-card';
import {
  adminActivity as adminActivityFallback,
  adminOverviewMetrics as adminOverviewMetricsFallback,
  adminQuickActions as adminQuickActionsFallback,
  attemptsTrend as attemptsTrendFallback,
  passFailDistribution as passFailDistributionFallback,
  topAssessmentCategories as topAssessmentCategoriesFallback,
  type AdminActivity,
  type AdminMetric,
  type AdminQuickAction,
  type AttemptsPoint,
  type CategoryStat,
  type PassFailPoint,
} from '@/data/admin-dashboard';
import { getAdminDashboardOverviewRequest } from '@/lib/admin-api';

export default function AdminPage() {
  const router = useRouter();
  const { session, user, isLoading: isAuthLoading } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetric[]>([]);
  const [activity, setActivity] = useState<AdminActivity[]>([]);
  const [quickActions, setQuickActions] = useState<AdminQuickAction[]>([]);
  const [attemptsData, setAttemptsData] = useState<AttemptsPoint[]>([]);
  const [passFailData, setPassFailData] = useState<PassFailPoint[]>([]);
  const [topCategories, setTopCategories] = useState<CategoryStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | undefined>();

  useEffect(() => {
    if (isAuthLoading || !session) return;

    let active = true;
    setIsLoading(true);
    setPageError(undefined);

    void getAdminDashboardOverviewRequest()
      .then((payload) => {
        if (!active) return;
        setMetrics(payload.metrics);
        setActivity(payload.recentActivity);
        setQuickActions(payload.quickActions);
        setAttemptsData(payload.attemptsTrend);
        setPassFailData(payload.passFailDistribution);
        setTopCategories(payload.topCategories);
      })
      .catch((error) => {
        if (!active) return;
        setPageError(error instanceof Error ? error.message : 'Unable to load the admin overview right now.');
        setMetrics(adminOverviewMetricsFallback);
        setActivity(adminActivityFallback);
        setQuickActions(adminQuickActionsFallback);
        setAttemptsData(attemptsTrendFallback);
        setPassFailData(passFailDistributionFallback);
        setTopCategories(topAssessmentCategoriesFallback);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthLoading, session]);

  if (!session && !isAuthLoading) {
    return (
      <AdminLayout
        title="Admin Dashboard"
        subtitle="Monitor platform activity, manage assessments, and oversee student performance."
      >
        <div className="dashboard-panel rounded-[1.8rem] p-6">
          <p className="text-sm font-semibold text-[var(--dashboard-text)]">Sign in required</p>
          <p className="mt-3 text-sm leading-7 text-[var(--dashboard-muted)]">
            Your admin session has ended. Please sign in again to continue.
          </p>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="dashboard-lime-panel mt-5 rounded-2xl px-4 py-3 text-sm font-semibold text-[#223200]"
          >
            Go to login
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthLoading && user?.role !== 'ADMIN') {
    return (
      <AdminLayout
        title="Admin Dashboard"
        subtitle="Monitor platform activity, manage assessments, and oversee student performance."
      >
        <div className="dashboard-panel rounded-[1.8rem] p-6">
          <p className="text-sm font-semibold text-[var(--dashboard-text)]">Admin access only</p>
          <p className="mt-3 text-sm leading-7 text-[var(--dashboard-muted)]">
            This operational dashboard is reserved for administrator accounts.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Monitor platform activity, manage assessments, and oversee student performance."
    >
      {pageError ? (
        <div className="rounded-[1.4rem] border border-amber-400/35 bg-amber-50/80 px-4 py-4 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-100">
          {pageError} Showing the latest available overview snapshot while the live data connection recovers.
        </div>
      ) : null}

      {isLoading ? (
        <div className="dashboard-panel rounded-[1.8rem] p-6 text-sm text-[var(--dashboard-muted)]">
          Loading live admin overview...
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} metric={metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <AttemptsLineCard data={attemptsData} />
        <div className="dashboard-panel-strong rounded-[1.9rem] p-5 sm:p-6">
          <AdminSectionHeader
            eyebrow="Activity"
            title="Recent Platform Activity"
            subtitle="A running view of the latest operational changes across the platform."
          />
          <div className="mt-6 space-y-4">
            {activity.map((item) => (
              <div key={`${item.title}-${item.timestamp}`} className="dashboard-soft-tile rounded-[1.3rem] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--dashboard-text)]">{item.title}</p>
                  <span className="text-xs uppercase tracking-[0.14em] text-[var(--dashboard-subtle)]">
                    {item.timestamp}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <PassFailChartCard data={passFailData} />
        <div className="dashboard-panel-strong rounded-[1.9rem] p-5 sm:p-6">
          <AdminSectionHeader
            eyebrow="Categories"
            title="Top Assessment Categories"
            subtitle="See which disciplines are driving the most volume and review attention."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {topCategories.map((item) => (
              <div key={item.label} className="dashboard-soft-tile rounded-[1.4rem] px-4 py-5">
                <p className="text-sm font-semibold text-[var(--dashboard-text)]">{item.label}</p>
                <p className="mt-3 text-[1.8rem] font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">
                  {item.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{item.helper}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <AdminSectionHeader
          eyebrow="Quick actions"
          title="Move the platform forward"
          subtitle="Jump into the admin tasks that keep question quality, certification, and security in good shape."
        />
        <div className="grid gap-4 xl:grid-cols-5">
          {quickActions.map((action) => (
            <QuickActionCard key={action.title} action={action} />
          ))}
        </div>
      </section>
    </AdminLayout>
  );
}
