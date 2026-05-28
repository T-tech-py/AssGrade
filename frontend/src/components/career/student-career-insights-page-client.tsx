'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { SectionHeader } from '@/components/dashboard/section-header';
import { CareerInsightStatCard } from '@/components/career/career-insight-stat-card';
import { CareerNextStepCard } from '@/components/career/career-next-step-card';
import { CareerRoleMatchCard } from '@/components/career/career-role-match-card';
import { CareerSignalCard } from '@/components/career/career-signal-card';
import { getStudentCareerInsightsRequest, type StudentCareerInsightsResponse } from '@/lib/student-dashboard-api';

type StudentCareerInsightsPageClientProps = {
  selectedRoleId?: string;
};

const emptyCareerInsights: StudentCareerInsightsResponse = {
  hero: {
    title: 'Career Insights',
    subtitle:
      'See where your assessment performance points, understand the roles you are trending toward, and get practical next steps for becoming more job-ready.',
    readinessLevel: 'Beginner',
    readinessScore: 0,
    summary: 'Complete assessments to unlock a clearer career direction and stronger role-fit guidance.',
  },
  stats: [],
  roleMatches: [],
  signals: [],
  strengths: [],
  gaps: [],
  nextSteps: [],
};

export function StudentCareerInsightsPageClient({
  selectedRoleId,
}: StudentCareerInsightsPageClientProps) {
  const [careerInsights, setCareerInsights] =
    useState<StudentCareerInsightsResponse>(emptyCareerInsights);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadCareerInsights = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getStudentCareerInsightsRequest();
        if (isCancelled) return;
        setCareerInsights(response);
        setHasLoadedOnce(true);
      } catch (error) {
        if (isCancelled) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'We could not load your career insights right now.',
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadCareerInsights();

    return () => {
      isCancelled = true;
    };
  }, []);

  const selectedRole = useMemo(
    () =>
      careerInsights.roleMatches.find((item) => item.id === selectedRoleId) ??
      careerInsights.roleMatches[0],
    [careerInsights.roleMatches, selectedRoleId],
  );

  const showInitialLoading = isLoading && !hasLoadedOnce;
  const showRefreshingState = isLoading && hasLoadedOnce;
  const hasCareerData =
    careerInsights.stats.length > 0 ||
    careerInsights.roleMatches.length > 0 ||
    careerInsights.signals.length > 0;

  return (
    <DashboardLayout
      title={careerInsights.hero.title}
      subtitle={careerInsights.hero.subtitle}
    >
      {showRefreshingState ? (
        <div className="dashboard-panel rounded-[1.4rem] px-4 py-3 text-sm text-[var(--dashboard-muted)]">
          Refreshing your career insights...
        </div>
      ) : null}

      {showInitialLoading ? (
        <div className="space-y-4">
          <div className="dashboard-panel h-[18rem] animate-pulse rounded-[2rem]" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={`career-stat-loading-${index}`}
                className="dashboard-panel h-[10.5rem] animate-pulse rounded-[1.7rem]"
              />
            ))}
          </div>
        </div>
      ) : errorMessage && !hasLoadedOnce ? (
        <div className="dashboard-panel rounded-[1.6rem] p-5 text-sm text-[var(--dashboard-muted)]">
          <p className="font-semibold text-[var(--dashboard-text)]">
            We could not load your career insights.
          </p>
          <p className="mt-2 leading-6">{errorMessage}</p>
        </div>
      ) : !hasCareerData ? (
        <div className="dashboard-panel rounded-[1.6rem] p-5 text-sm text-[var(--dashboard-muted)] sm:p-6">
          <p className="font-semibold text-[var(--dashboard-text)]">
            Your career insights are still taking shape.
          </p>
          <p className="mt-2 max-w-2xl leading-7">
            Complete more assessments and practice sessions to unlock role matches, readiness
            signals, and next-step guidance that reflects your real performance.
          </p>
        </div>
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="dashboard-panel-strong rounded-[2rem] p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">
                Career direction
              </p>
              <h2 className="mt-3 max-w-3xl text-[2rem] font-semibold tracking-[-0.05em] text-[var(--dashboard-text)] sm:text-[2.6rem]">
                {careerInsights.roleMatches[0]
                  ? `Your strongest path right now points toward ${careerInsights.roleMatches[0].title.toLowerCase()} roles`
                  : 'Complete more assessments to unlock a stronger career direction'}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--dashboard-muted)] sm:text-base">
                {careerInsights.hero.summary}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="dashboard-lime-panel rounded-[1.5rem] px-5 py-4 text-[#223200]">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em]">Readiness score</p>
                  <p className="mt-2 text-[2rem] font-semibold tracking-[-0.05em]">{careerInsights.hero.readinessScore}/100</p>
                </div>
                <div className="dashboard-soft-tile rounded-[1.5rem] px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-subtle)]">Current level</p>
                  <p className="mt-2 text-[1.8rem] font-semibold tracking-[-0.05em] text-[var(--dashboard-text)]">{careerInsights.hero.readinessLevel}</p>
                </div>
              </div>
            </div>

            <div className="dashboard-panel rounded-[2rem] p-5 sm:p-6">
              <p className="text-sm font-semibold text-[var(--dashboard-text)]">Readiness signals</p>
              <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
                These signals are translated from your recent assessment and practice performance into employability language.
              </p>
              <div className="mt-5 space-y-3">
                {careerInsights.signals.length > 0 ? (
                  careerInsights.signals.map((signal) => (
                    <CareerSignalCard key={signal.label} signal={signal} />
                  ))
                ) : (
                  <div className="dashboard-soft-tile rounded-[1.25rem] px-4 py-4 text-sm leading-6 text-[var(--dashboard-muted)]">
                    We will surface readiness signals here after your next scored assessment.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {careerInsights.stats.map((item) => (
              <CareerInsightStatCard
                key={item.title}
                title={item.title}
                value={item.value}
                helper={item.helper}
              />
            ))}
          </section>

          <section className="space-y-4">
            <SectionHeader
              eyebrow="Career matches"
              title="Roles that best fit your current performance pattern"
              subtitle="These matches are guidance-oriented and based on your strongest readiness signals, not final hiring decisions."
            />
            <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
              {careerInsights.roleMatches.map((role) => (
                <CareerRoleMatchCard key={role.id} role={role} />
              ))}
            </div>
          </section>

          {selectedRole ? (
            <section id="role-spotlight" className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
              <div className="dashboard-panel-strong rounded-[1.9rem] p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">
                  Role spotlight
                </p>
                <h3 className="mt-3 text-[1.8rem] font-semibold tracking-[-0.05em] text-[var(--dashboard-text)]">
                  {selectedRole.title}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--dashboard-muted)]">
                  {selectedRole.summary}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="dashboard-lime-panel rounded-full px-4 py-2 text-sm font-semibold text-[#223200]">
                    {selectedRole.match}% match
                  </span>
                  <span className="dashboard-soft-tile rounded-full px-4 py-2 text-sm font-semibold text-[var(--dashboard-text)]">
                    {selectedRole.fitType}
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-subtle)]">
                      Best-fit strengths
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedRole.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-[var(--dashboard-icon-surface)] px-3 py-1 text-xs font-semibold text-[var(--dashboard-text)]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-subtle)]">
                      Best-fit environments
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedRole.environments.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-[var(--dashboard-icon-surface)] px-3 py-1 text-xs font-semibold text-[var(--dashboard-text)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="dashboard-panel rounded-[1.9rem] p-5 sm:p-6">
                <p className="text-sm font-semibold text-[var(--dashboard-text)]">What to improve for this role</p>
                <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
                  These are the most useful focus areas if you want to become a stronger fit for {selectedRole.title}.
                </p>
                <div className="mt-5 space-y-3">
                  {selectedRole.focusAreas.map((item) => (
                    <div
                      key={item}
                      className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-[var(--dashboard-muted)]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <section className="grid gap-4 xl:grid-cols-2">
            <div className="dashboard-panel rounded-[1.9rem] p-5 sm:p-6">
              <SectionHeader
                eyebrow="Strengths"
                title="What is helping your fit"
                subtitle="These are the patterns making your strongest role matches more believable."
              />
              <div className="mt-5 space-y-3">
                {careerInsights.strengths.map((item) => (
                  <div
                    key={item}
                    className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-[var(--dashboard-muted)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-panel rounded-[1.9rem] p-5 sm:p-6">
              <SectionHeader
                eyebrow="Growth gaps"
                title="What will improve your role fit fastest"
                subtitle="A few targeted changes can move you from developing to much more employer-ready."
              />
              <div className="mt-5 space-y-3">
                {careerInsights.gaps.map((item) => (
                  <div
                    key={item}
                    className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-[var(--dashboard-muted)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <SectionHeader
              eyebrow="Recommended next steps"
              title="What to do from here"
              subtitle="Use these actions to strengthen your strongest path instead of preparing too broadly."
            />
            <div className="grid gap-4 xl:grid-cols-3">
              {careerInsights.nextSteps.map((step) => (
                <CareerNextStepCard key={step.title} step={step} />
              ))}
            </div>
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
