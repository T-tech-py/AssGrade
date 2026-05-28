'use client';

import { useEffect, useState } from 'react';
import { type Assessment } from '@/data/student-dashboard';
import { getStudentAssessmentsRequest } from '@/lib/student-dashboard-api';
import { AssessmentFilters } from './assessment-filters';
import { AssessmentLibraryOverview } from './assessment-library-overview';
import { DashboardLayout } from './dashboard-layout';
import { EmptyState } from './empty-state';
import { SectionHeader } from './section-header';

export function StudentAssessmentsPageClient() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadAssessments = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getStudentAssessmentsRequest();
        if (isCancelled) return;
        setAssessments(response);
        setHasLoadedOnce(true);
      } catch (error) {
        if (isCancelled) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'We could not load your assessments right now.',
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadAssessments();

    return () => {
      isCancelled = true;
    };
  }, []);

  const showInitialLoading = isLoading && !hasLoadedOnce;
  const showRefreshingState = isLoading && hasLoadedOnce;

  return (
    <DashboardLayout
      title="Assessments"
      subtitle="Browse available readiness tests, search by field, and start the next assessment when you're ready."
    >
      {showRefreshingState ? (
        <div className="dashboard-panel rounded-[1.4rem] px-4 py-3 text-sm text-[var(--dashboard-muted)]">
          Refreshing available assessments...
        </div>
      ) : null}

      <AssessmentLibraryOverview total={assessments.length} />

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Assessment catalog"
          title="Available Assessments"
          subtitle="Search and explore the current assessment options available to you."
        />

        {showInitialLoading ? (
          <div className="space-y-4">
            <div className="dashboard-panel h-16 animate-pulse rounded-[1.7rem]" />
            <div className="grid gap-4 xl:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={`assessment-loading-${index}`}
                  className="dashboard-panel h-[27rem] animate-pulse rounded-[1.9rem]"
                />
              ))}
            </div>
          </div>
        ) : errorMessage && !hasLoadedOnce ? (
          <div className="dashboard-panel rounded-[1.6rem] p-5 text-sm text-[var(--dashboard-muted)]">
            <p className="font-semibold text-[var(--dashboard-text)]">
              We could not load your assessments.
            </p>
            <p className="mt-2 leading-6">{errorMessage}</p>
          </div>
        ) : assessments.length ? (
          <AssessmentFilters assessments={assessments} />
        ) : (
          <EmptyState
            title="No published assessments yet"
            description="Your institution has not published any assessments for you yet. Check back shortly."
            actionLabel="Back to Dashboard"
            actionHref="/dashboard"
          />
        )}
      </section>
    </DashboardLayout>
  );
}
