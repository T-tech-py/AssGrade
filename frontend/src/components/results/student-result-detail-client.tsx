'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { SectionHeader } from '@/components/dashboard/section-header';
import { EmptyState } from '@/components/dashboard/empty-state';
import { CompetencyBreakdownCard } from '@/components/results/competency-breakdown-card';
import { getStudentResultDetailRequest, type StudentResultDetailResponse } from '@/lib/student-dashboard-api';
import { ArrowUpRightIcon } from '@/components/dashboard/icons';

export function StudentResultDetailClient({ id }: { id: string }) {
  const [result, setResult] = useState<StudentResultDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadResult = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getStudentResultDetailRequest(id);
        if (isCancelled) return;
        setResult(response);
      } catch (error) {
        if (isCancelled) return;
        setErrorMessage(
          error instanceof Error ? error.message : 'We could not load this result right now.',
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadResult();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  return (
    <DashboardLayout
      title="Result Breakdown"
      subtitle="Review the outcome of this completed assessment and see which signals were strongest."
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="dashboard-panel h-[16rem] animate-pulse rounded-[2rem]" />
          <div className="dashboard-panel h-[20rem] animate-pulse rounded-[1.8rem]" />
        </div>
      ) : errorMessage || !result ? (
        <EmptyState
          title="Result not available"
          description={errorMessage ?? 'We could not find this completed assessment result.'}
          actionLabel="Back to Results"
          actionHref="/results"
        />
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="dashboard-panel-strong rounded-[2rem] p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">
                Result detail
              </p>
              <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--dashboard-text)] sm:text-[2.5rem]">
                {result.hero.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--dashboard-muted)]">
                Completed on {result.hero.completedAt} across {result.hero.questionCount} items in {result.hero.duration}.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="dashboard-lime-panel rounded-[1.5rem] px-5 py-4 text-[#223200]">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em]">Score</p>
                  <p className="mt-2 text-[2rem] font-semibold tracking-[-0.05em]">{result.hero.score}%</p>
                </div>
                <div className="dashboard-soft-tile rounded-[1.5rem] px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-subtle)]">Grade</p>
                  <p className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--dashboard-text)]">{result.hero.grade}</p>
                </div>
                <div className="dashboard-soft-tile rounded-[1.5rem] px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-subtle)]">Outcome</p>
                  <p className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--dashboard-text)]">{result.hero.status}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/results"
                  className="dashboard-dark-button inline-flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition"
                >
                  Back to Results
                </Link>
                {result.hero.certificateHref ? (
                  <Link
                    href={result.hero.certificateHref}
                    className="dashboard-lime-panel inline-flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold text-[#223200]"
                  >
                    View Certificate
                    <ArrowUpRightIcon className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="dashboard-panel rounded-[1.8rem] p-5">
                <p className="text-sm font-semibold text-[var(--dashboard-text)]">Strongest signal</p>
                <p className="mt-3 text-sm leading-6 text-[var(--dashboard-muted)]">
                  {result.summary.strongestSignal}
                </p>
              </div>
              <div className="dashboard-panel rounded-[1.8rem] p-5">
                <p className="text-sm font-semibold text-[var(--dashboard-text)]">Weakest signal</p>
                <p className="mt-3 text-sm leading-6 text-[var(--dashboard-muted)]">
                  {result.summary.weakestSignal}
                </p>
              </div>
              <div className="dashboard-panel rounded-[1.8rem] p-5">
                <p className="text-sm font-semibold text-[var(--dashboard-text)]">Interpretation</p>
                <p className="mt-3 text-sm leading-6 text-[var(--dashboard-muted)]">
                  {result.summary.note}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <SectionHeader
              eyebrow="Breakdown"
              title="Performance by competency and question type"
              subtitle="A closer look at the signals that shaped this assessment result."
            />
            <CompetencyBreakdownCard competencies={result.competencies} formats={result.formats} />
          </section>

          <section className="space-y-4">
            <SectionHeader
              eyebrow="Question review"
              title="Per-question grading summary"
              subtitle="A concise review of marks awarded across the questions in this assessment."
            />
            <div className="grid gap-4">
              {result.responses.map((response, index) => (
                <div key={response.id} className="dashboard-panel rounded-[1.7rem] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-accent-foreground)]">
                        Question {index + 1}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[var(--dashboard-text)]">
                        {response.prompt}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[var(--dashboard-text)]">{response.type}</p>
                      <p className="mt-1 text-sm text-[var(--dashboard-muted)]">
                        {response.awardedMarks}/{response.marks} marks
                      </p>
                    </div>
                  </div>

                  {response.autoFeedback ? (
                    <div className="dashboard-soft-tile mt-4 rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-[var(--dashboard-muted)]">
                      {response.autoFeedback}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
