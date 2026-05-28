'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { SectionHeader } from '@/components/dashboard/section-header';
import { EmptyState } from '@/components/dashboard/empty-state';
import { ResultAttemptCard } from '@/components/results/result-attempt-card';
import { ResultSummaryCard } from '@/components/results/result-summary-card';
import { ResultsTrendCard } from '@/components/results/results-trend-card';
import { CompetencyBreakdownCard } from '@/components/results/competency-breakdown-card';
import { ResultsHighlightPanel } from '@/components/results/results-highlight-panel';
import {
  CertificateOutlineIcon,
  GrowthIcon,
  ReadinessIcon,
  ScoreIcon,
} from '@/components/results/results-icons';
import { getStudentResultsRequest, type StudentResultsResponse } from '@/lib/student-dashboard-api';

const emptyResultsState: StudentResultsResponse = {
  highlights: {
    latestTitle: 'No completed assessments yet',
    latestScore: 0,
    latestGrade: 'Pending',
    latestSummary: 'Complete an assessment to start building your performance history.',
    strengths: [],
    focusAreas: [],
    latestCertificateHref: '/certificates',
  },
  metrics: [],
  trend: [],
  readinessNote: {
    strongestSignal: 'Assessment accuracy',
    currentBlocker: 'Written communication',
    recommendedNextMove: 'Complete your first assessment to unlock a real readiness signal.',
  },
  attempts: [],
  breakdown: {
    competencies: [],
    formats: [],
  },
  pagination: {
    page: 1,
    pageSize: 6,
    total: 0,
    totalPages: 1,
  },
  overview: {
    latestIssued: 'Not issued yet',
  },
};

export function StudentResultsPageClient() {
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<StudentResultsResponse>(emptyResultsState);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadResults = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getStudentResultsRequest({ page, pageSize: 6 });
        if (isCancelled) return;
        setResults(response);
        setHasLoadedOnce(true);
      } catch (error) {
        if (isCancelled) return;
        setErrorMessage(
          error instanceof Error ? error.message : 'We could not load your results right now.',
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadResults();

    return () => {
      isCancelled = true;
    };
  }, [page]);

  const showInitialLoading = isLoading && !hasLoadedOnce;
  const showRefreshingState = isLoading && hasLoadedOnce;
  const startIndex =
    results.pagination.total === 0
      ? 0
      : (results.pagination.page - 1) * results.pagination.pageSize + 1;
  const endIndex = Math.min(
    results.pagination.page * results.pagination.pageSize,
    results.pagination.total,
  );

  return (
    <DashboardLayout
      title="Results"
      subtitle="Review completed assessments, understand your performance patterns, and see where your readiness is getting stronger."
    >
      {showRefreshingState ? (
        <div className="dashboard-panel rounded-[1.4rem] px-4 py-3 text-sm text-[var(--dashboard-muted)]">
          Refreshing your results...
        </div>
      ) : null}

      {showInitialLoading ? (
        <div className="space-y-4">
          <div className="dashboard-panel h-[18rem] animate-pulse rounded-[2rem]" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={`result-metric-loading-${index}`}
                className="dashboard-panel h-[10.5rem] animate-pulse rounded-[1.7rem]"
              />
            ))}
          </div>
        </div>
      ) : errorMessage && !hasLoadedOnce ? (
        <div className="dashboard-panel rounded-[1.6rem] p-5 text-sm text-[var(--dashboard-muted)]">
          <p className="font-semibold text-[var(--dashboard-text)]">
            We could not load your results.
          </p>
          <p className="mt-2 leading-6">{errorMessage}</p>
        </div>
      ) : results.attempts.length === 0 ? (
        <EmptyState
          title="No completed results yet"
          description="Submit your first assessment to start building a live results history."
          actionLabel="Browse assessments"
          actionHref="/assessments"
        />
      ) : (
        <>
          <ResultsHighlightPanel
            title={results.highlights.latestTitle}
            score={results.highlights.latestScore}
            grade={results.highlights.latestGrade}
            summary={results.highlights.latestSummary}
            strengths={results.highlights.strengths}
            focusAreas={results.highlights.focusAreas}
            certificateHref={results.highlights.latestCertificateHref}
          />

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {results.metrics.map((metric) => {
              const icon =
                metric.icon === 'score' ? (
                  <ScoreIcon className="h-4.5 w-4.5" />
                ) : metric.icon === 'growth' ? (
                  <GrowthIcon className="h-4.5 w-4.5" />
                ) : metric.icon === 'certificate' ? (
                  <CertificateOutlineIcon className="h-4.5 w-4.5" />
                ) : (
                  <ReadinessIcon className="h-4.5 w-4.5" />
                );

              return (
                <ResultSummaryCard
                  key={metric.title}
                  title={metric.title}
                  value={metric.value}
                  helper={metric.helper}
                  icon={icon}
                />
              );
            })}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
            <ResultsTrendCard data={results.trend.length ? results.trend : [{ label: 'Now', score: 0 }]} />

            <div className="dashboard-panel-strong rounded-[1.9rem] p-5 sm:p-6">
              <SectionHeader
                eyebrow="Readiness note"
                title="What your results are saying"
                subtitle="A quick interpretation of the patterns showing up in your completed assessments."
              />
              <div className="mt-6 space-y-3">
                <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                  <p className="text-sm font-semibold text-[var(--dashboard-text)]">Strongest signal</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
                    {results.readinessNote.strongestSignal} is currently your clearest performance signal.
                  </p>
                </div>
                <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                  <p className="text-sm font-semibold text-[var(--dashboard-text)]">Current blocker</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
                    {results.readinessNote.currentBlocker} is the area that needs the most attention next.
                  </p>
                </div>
                <div className="dashboard-lime-panel rounded-[1.4rem] px-4 py-4 text-[#223200]">
                  <p className="text-sm font-semibold">Recommended next move</p>
                  <p className="mt-2 text-sm leading-6">
                    {results.readinessNote.recommendedNextMove}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <SectionHeader
              eyebrow="Assessment history"
              title="Recent completed results"
              subtitle="Open your certificate or review the outcome patterns from your latest completed assessments."
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--dashboard-muted)]">
                Showing {startIndex}-{endIndex} of {results.pagination.total} completed results
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={results.pagination.page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="dashboard-dark-button rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={results.pagination.page >= results.pagination.totalPages}
                  onClick={() =>
                    setPage((current) => Math.min(results.pagination.totalPages, current + 1))
                  }
                  className="dashboard-dark-button rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {results.attempts.map((attempt) => (
                <ResultAttemptCard key={attempt.id} attempt={attempt} />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <SectionHeader
              eyebrow="Breakdown"
              title="Performance by competency and question type"
              subtitle="A clearer look at the skills and formats shaping your current readiness score."
            />
            <CompetencyBreakdownCard
              competencies={results.breakdown.competencies}
              formats={results.breakdown.formats}
            />
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
