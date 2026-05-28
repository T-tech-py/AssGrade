'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getFirstName, useAuth } from '@/components/auth/auth-provider';
import {
  quickActions,
} from '@/data/student-dashboard';
import { ActivityItem } from '@/components/dashboard/activity-item';
import { AssessmentCard } from '@/components/dashboard/assessment-card';
import { CareerCard } from '@/components/dashboard/career-card';
import { CertificateCard } from '@/components/dashboard/certificate-card';
import { ChartCard } from '@/components/dashboard/chart-card';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { EmptyState } from '@/components/dashboard/empty-state';
import { ProgressCard } from '@/components/dashboard/progress-card';
import { QuickActionCard } from '@/components/dashboard/quick-action-card';
import { SectionHeader } from '@/components/dashboard/section-header';
import { SparkIcon, TrophyIcon } from '@/components/dashboard/icons';
import { StatCard } from '@/components/dashboard/stat-card';
import {
  type StudentDashboardResponse,
  getStudentDashboardRequest,
} from '@/lib/student-dashboard-api';

const emptyDashboardState: StudentDashboardResponse = {
  hero: {
    readinessScore: 0,
    readinessLabel: 'Beginner',
    nextGoal: 'Complete your first assessment to unlock a real readiness signal.',
    latestWin: 'Complete your first assessment to see your latest result here.',
    practiceHint: 'Start with a short guided practice session to build momentum.',
  },
  summaryStats: [],
  performanceSeries: [],
  availableAssessments: [],
  recentActivity: [],
  careerInsights: [],
  certificates: [],
};

export default function DashboardPage() {
  const { user, session, isLoading } = useAuth();
  const firstName = getFirstName(user, 'Tobi');
  const [dashboard, setDashboard] =
    useState<StudentDashboardResponse>(emptyDashboardState);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!session?.accessToken) {
      setDashboard(emptyDashboardState);
      setIsDashboardLoading(false);
      setHasLoadedOnce(false);
      return;
    }

    let isCancelled = false;

    const loadDashboard = async () => {
      setIsDashboardLoading(true);
      setErrorMessage(null);

      try {
        const response = await getStudentDashboardRequest();
        if (isCancelled) return;
        setDashboard(response);
        setHasLoadedOnce(true);
      } catch (error) {
        if (isCancelled) return;
        const message =
          error instanceof Error
            ? error.message
            : 'We could not load your dashboard right now.';
        setErrorMessage(message);
      } finally {
        if (!isCancelled) {
          setIsDashboardLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isCancelled = true;
    };
  }, [isLoading, session?.accessToken]);

  const summaryStats = dashboard.summaryStats;
  const performanceSeries = dashboard.performanceSeries;
  const availableAssessments = dashboard.availableAssessments;
  const recentActivity = dashboard.recentActivity;
  const careerInsights = dashboard.careerInsights;
  const certificates = dashboard.certificates;
  const hero = dashboard.hero;

  const showInitialLoading = isDashboardLoading && !hasLoadedOnce;
  const showRefreshingState = isDashboardLoading && hasLoadedOnce;
  const chartData = useMemo(
    () => (performanceSeries.length ? performanceSeries : [{ label: 'Now', score: 0 }]),
    [performanceSeries],
  );

  return (
    <DashboardLayout
      title={`Welcome back, ${firstName}`}
      subtitle="Track your progress, continue practicing, and move closer to job readiness."
    >
      {showRefreshingState ? (
        <div className="dashboard-panel rounded-[1.4rem] px-4 py-3 text-sm text-[var(--dashboard-muted)]">
          Refreshing your dashboard...
        </div>
      ) : null}

      {errorMessage && !hasLoadedOnce ? (
        <div className="dashboard-panel rounded-[1.6rem] p-5 text-sm text-[var(--dashboard-muted)]">
          <p className="font-semibold text-[var(--dashboard-text)]">We could not load your dashboard.</p>
          <p className="mt-2 leading-6">{errorMessage}</p>
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="dashboard-panel-strong rounded-[2rem] p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--dashboard-accent-foreground)]">Student dashboard</p>
          <h2 className="mt-3 max-w-2xl text-[2.2rem] font-semibold tracking-[-0.05em] text-[var(--dashboard-text)] sm:text-[2.8rem] sm:leading-[1.02]">
            {`Welcome back, ${firstName} 👋`}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--dashboard-muted)] sm:text-base">
            Track your progress, continue practicing, and move closer to job readiness.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/assessments" className="dashboard-lime-panel inline-flex items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold text-[#223200]">
              Take New Assessment
            </Link>
            <Link href="/practice" className="dashboard-dark-button inline-flex items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold transition">
              Continue Practice
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="dashboard-soft-tile rounded-[1.5rem] px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)]">
                  <SparkIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--dashboard-text)]">AI-guided next step</p>
                  <p className="text-sm text-[var(--dashboard-muted)]">{hero.practiceHint}</p>
                </div>
              </div>
            </div>
            <div className="dashboard-soft-tile rounded-[1.5rem] px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--dashboard-warm-soft)] text-[var(--dashboard-warm-foreground)]">
                  <TrophyIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--dashboard-text)]">Latest win</p>
                  <p className="text-sm text-[var(--dashboard-muted)]">{hero.latestWin}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ProgressCard
          score={hero.readinessScore}
          label={hero.readinessLabel}
          nextGoal={hero.nextGoal}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(showInitialLoading ? Array.from({ length: 4 }, () => null) : summaryStats).map((stat, index) => (
          stat === null ? (
            <div key={`loading-stat-${index}`} className="dashboard-panel h-[12.4rem] animate-pulse rounded-[1.7rem] p-5" />
          ) : (
            <StatCard key={stat.title} stat={stat} index={index} />
          )
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <ChartCard data={chartData} />

        <div className="dashboard-panel-strong rounded-[1.9rem] p-5 sm:p-6">
          <SectionHeader
            eyebrow="Timeline"
            title="Recent Activity"
            subtitle="A quick view of what you’ve done lately."
          />
          <div className="mt-6">
            {recentActivity.length ? recentActivity.map((activity) => (
              <ActivityItem key={`${activity.title}-${activity.timestamp}`} activity={activity} />
            )) : (
              <div className="dashboard-soft-tile rounded-[1.4rem] px-4 py-4 text-sm leading-6 text-[var(--dashboard-muted)]">
                Your recent actions will appear here once you start taking assessments or using practice mode.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Assessments"
          title="Available Assessments"
          subtitle="Choose a readiness track and keep building a stronger graduate profile."
          actionLabel="View all"
          actionHref="/assessments"
        />
        <div className="grid gap-4 xl:grid-cols-3">
          {availableAssessments.length ? availableAssessments.map((assessment) => (
            <AssessmentCard key={assessment.title} assessment={assessment} />
          )) : (
            <div className="xl:col-span-3">
              <EmptyState
                title="No published assessments yet"
                description="Your institution has not published any assessments for you yet. Check back shortly."
                actionLabel="Refresh later"
                actionHref="/dashboard"
              />
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="dashboard-panel-strong overflow-hidden rounded-[2rem] p-6 sm:p-7">
          <SectionHeader
            eyebrow="Practice mode"
            title="AI Practice Assistant"
            subtitle="Generate personalized practice questions, follow a study plan, and prepare smarter."
          />

          <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="dashboard-lime-panel rounded-[1.8rem] p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(35,52,0,0.12)] text-[#203100]">
                <SparkIcon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-lg font-semibold text-[#203100]">Practice with better focus</p>
              <p className="mt-2 text-sm leading-6 text-[#3b4b18]">
                Use AI-generated practice sets to target your weakest topics before your next assessment.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Personalized', 'Adaptive', 'AI-powered'].map((tag) => (
                  <span key={tag} className="rounded-full bg-[rgba(244,251,229,0.8)] px-3 py-1 text-xs font-semibold text-[#243500]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/practice" className="dashboard-dark-button inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold transition">
                Generate Practice Questions
              </Link>
              <Link href="/practice" className="dashboard-dark-button inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold transition">
                View Study Plan
              </Link>
              <div className="dashboard-soft-tile rounded-[1.5rem] px-4 py-4 text-sm leading-6 text-[var(--dashboard-muted)]">
                Friendly nudge: a short 15-minute practice session today could help lift your readiness score before the next test.
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-panel-strong rounded-[2rem] p-5 sm:p-6">
          <SectionHeader
            eyebrow="Quick actions"
            title="Keep moving"
            subtitle="Fast ways to stay on top of your journey."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {quickActions.map((action) => (
              <QuickActionCard key={action.label} action={action} />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Recommendations"
          title="Career Insights"
          subtitle="Potential roles based on your mock performance profile and readiness patterns."
          actionLabel="Open insights"
          actionHref="/career-insights"
        />
        <div className="grid gap-4 xl:grid-cols-3">
          {careerInsights.length ? careerInsights.map((career) => (
            <CareerCard key={career.title} career={career} />
          )) : (
            <div className="xl:col-span-3">
              <EmptyState
                title="Career insights will appear here"
                description="Take more assessments to unlock stronger role-fit guidance and readiness recommendations."
                actionLabel="Continue practice"
                actionHref="/practice"
              />
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Verified results"
          title="Recent Certificates"
          subtitle="Track the certificates you’ve earned and keep them ready for sharing."
          actionLabel="View all certificates"
          actionHref="/certificates"
        />

        {certificates.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {certificates.map((certificate) => (
              <CertificateCard key={certificate.verificationId} certificate={certificate} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No certificates yet"
            description="Complete an assessment and meet the required score to unlock your first verified certificate."
            actionLabel="Browse assessments"
            actionHref="/assessments"
          />
        )}
      </section>
    </DashboardLayout>
  );
}
