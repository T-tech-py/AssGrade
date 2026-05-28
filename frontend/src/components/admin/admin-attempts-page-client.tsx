'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ActionMenu } from '@/components/admin/action-menu';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminSectionHeader } from '@/components/admin/admin-section-header';
import { DataTable } from '@/components/admin/data-table';
import { MobileDataCard } from '@/components/admin/mobile-data-card';
import { RiskBadge } from '@/components/admin/risk-badge';
import { StatusBadge } from '@/components/admin/status-badge';
import { emitAppToast } from '@/components/ui/app-toast';
import { exportAdminAttemptsCsvRequest, getAdminAttemptsRequest } from '@/lib/admin-api';

function getRiskValue(security: string) {
  return security === 'High Risk' ? 'High' : security === 'Flagged' ? 'Medium' : 'Low';
}

export function AdminAttemptsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<
    Array<{
      id: string;
      student: string;
      assessment: string;
      score: string;
      grade: string;
      status: string;
      submittedAt: string;
      security: string;
      field: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [assessment, setAssessment] = useState('all');
  const [field, setField] = useState('all');
  const [grade, setGrade] = useState('all');
  const [status, setStatus] = useState('all');
  const [date, setDate] = useState<'all' | '7d' | '30d' | '90d'>('30d');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [availableAssessments, setAvailableAssessments] = useState<string[]>([]);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const studentFilter = searchParams.get('student') ?? '';

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getAdminAttemptsRequest({
          page,
          pageSize: 12,
          search,
          assessment,
          field,
          grade,
          status,
          date,
          student: studentFilter || undefined,
        });

        setItems(response.items);
        setTotalPages(response.meta.totalPages);
        setAvailableAssessments(response.meta.availableAssessments);
        setAvailableFields(response.meta.availableFields);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load attempts.');
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [assessment, date, field, grade, page, search, status, studentFilter]);

  const reviewedCount = items.filter((attempt) => attempt.status === 'Reviewed').length;
  const flaggedCount = items.filter((attempt) => attempt.security !== 'Clean').length;
  const averageScore = items.length
    ? Math.round(
        items.reduce((sum, attempt) => sum + (Number.parseInt(attempt.score, 10) || 0), 0) /
          Math.max(items.length, 1),
      )
    : 0;

  async function handleExport() {
    try {
      setIsExporting(true);
      const { blob, filename } = await exportAdminAttemptsCsvRequest({
        search,
        assessment,
        field,
        grade,
        status,
        date,
        student: studentFilter || undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      emitAppToast({
        tone: 'success',
        title: 'Attempt log exported',
        description: 'The filtered attempt log has been downloaded as a CSV file.',
      });
    } catch (requestError) {
      emitAppToast({
        tone: 'error',
        title: 'Export failed',
        description:
          requestError instanceof Error ? requestError.message : 'Unable to export attempt data right now.',
      });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <AdminLayout
      title="Attempts"
      subtitle="Monitor submissions, result states, and assessment integrity across student attempts."
    >
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="dashboard-panel-strong rounded-[1.9rem] p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">
            Attempt operations
          </p>
          <h2 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">
            Review exam attempts with better signal
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--dashboard-muted)]">
            Keep an eye on grading progress, high-risk sessions, and the assessment outcomes that need admin action.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                Total attempts
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">
                {items.length}
              </p>
              <p className="mt-1 text-xs text-[var(--dashboard-muted)]">Across the latest monitored sessions</p>
            </div>
            <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                Reviewed
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">
                {reviewedCount}
              </p>
              <p className="mt-1 text-xs text-[var(--dashboard-muted)]">Fully scored and review-ready attempts</p>
            </div>
            <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                Flagged
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">
                {flaggedCount}
              </p>
              <p className="mt-1 text-xs text-[var(--dashboard-muted)]">Sessions carrying integrity concerns</p>
            </div>
            <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                Avg. score
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">
                {averageScore}%
              </p>
              <p className="mt-1 text-xs text-[var(--dashboard-muted)]">Average across the visible attempt set</p>
            </div>
          </div>
        </div>

        <div className="dashboard-panel rounded-[1.9rem] p-5 sm:p-6">
          <AdminSectionHeader
            eyebrow="Focus queue"
            title="What needs action"
            subtitle="Quick priorities for the admin team before moving deeper into the logs."
          />
          <div className="mt-5 space-y-3">
            {[
              'Review flagged attempts before certificates are issued.',
              'Prioritize high-risk sessions with repeated tab-switch or webcam concerns.',
              'Confirm reviewed scores before sharing assessment outcomes externally.',
            ].map((item) => (
              <div
                key={item}
                className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-[var(--dashboard-text)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="dashboard-panel rounded-[1.6rem] p-4 sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div className="space-y-4">
            <label className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] px-3.5 py-2.5">
              <span className="text-sm text-[var(--dashboard-muted)]">⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
                placeholder="Search attempts by student, assessment, grade, or flag"
                className="w-full bg-transparent text-sm text-[var(--dashboard-text)] outline-none placeholder:text-[var(--dashboard-muted)]"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <select
                value={assessment}
                onChange={(event) => {
                  setPage(1);
                  setAssessment(event.target.value);
                }}
                className="dashboard-soft-tile min-h-11 rounded-xl border border-[var(--dashboard-panel-border)] px-3 py-2 text-sm text-[var(--dashboard-text)] outline-none"
              >
                <option value="all">All assessments</option>
                {availableAssessments.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                value={field}
                onChange={(event) => {
                  setPage(1);
                  setField(event.target.value);
                }}
                className="dashboard-soft-tile min-h-11 rounded-xl border border-[var(--dashboard-panel-border)] px-3 py-2 text-sm text-[var(--dashboard-text)] outline-none"
              >
                <option value="all">All fields</option>
                {availableFields.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                value={grade}
                onChange={(event) => {
                  setPage(1);
                  setGrade(event.target.value);
                }}
                className="dashboard-soft-tile min-h-11 rounded-xl border border-[var(--dashboard-panel-border)] px-3 py-2 text-sm text-[var(--dashboard-text)] outline-none"
              >
                <option value="all">All grades</option>
                <option value="fairly-passed">Fairly passed</option>
                <option value="passed">Passed</option>
                <option value="credit">Credit</option>
                <option value="excellent">Excellent</option>
                <option value="fail">Fail</option>
              </select>
              <select
                value={status}
                onChange={(event) => {
                  setPage(1);
                  setStatus(event.target.value);
                }}
                className="dashboard-soft-tile min-h-11 rounded-xl border border-[var(--dashboard-panel-border)] px-3 py-2 text-sm text-[var(--dashboard-text)] outline-none"
              >
                <option value="all">All statuses</option>
                <option value="submitted">Submitted</option>
                <option value="reviewed">Reviewed</option>
                <option value="flagged">Flagged</option>
                <option value="in-progress">In progress</option>
              </select>
              <select
                value={date}
                onChange={(event) => {
                  setPage(1);
                  setDate(event.target.value as 'all' | '7d' | '30d' | '90d');
                }}
                className="dashboard-soft-tile min-h-11 rounded-xl border border-[var(--dashboard-panel-border)] px-3 py-2 text-sm text-[var(--dashboard-text)] outline-none"
              >
                <option value="all">All time</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>

          <div className="flex xl:justify-end">
            <button
              type="button"
              onClick={() => {
                void handleExport();
              }}
              disabled={isExporting}
              className="dashboard-dark-button inline-flex min-h-11 items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold max-xl:w-full"
            >
              {isExporting ? 'Exporting...' : 'Export attempt log'}
            </button>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <AdminSectionHeader
          eyebrow="Attempt monitoring"
          title="Exam attempts and outcomes"
          subtitle="Track submission quality, grading state, and security signals for each attempt."
        />

        {studentFilter ? (
          <div className="dashboard-panel rounded-[1.4rem] border border-[var(--dashboard-panel-border)] px-4 py-3 text-sm text-[var(--dashboard-muted)]">
            This view is filtered to a selected student from the Users tab.
          </div>
        ) : null}

        {error ? (
          <div className="dashboard-panel rounded-[1.8rem] p-6">
            <p className="text-sm font-semibold text-rose-400">Unable to load attempts</p>
            <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{error}</p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="dashboard-panel h-28 rounded-[1.6rem] animate-pulse" />
            ))}
          </div>
        ) : null}

        {!isLoading ? (
          <div className="space-y-4 xl:hidden">
            {items.map((attempt) => (
              <MobileDataCard
                key={attempt.id}
                href={`/admin/attempts/${attempt.id}`}
                title={attempt.student}
                subtitle={attempt.assessment}
                meta={attempt.submittedAt}
                badges={
                  <>
                    <StatusBadge
                      value={attempt.status}
                      tone={
                        attempt.status === 'Reviewed'
                          ? 'active'
                          : attempt.status === 'Flagged'
                            ? 'danger'
                            : 'draft'
                      }
                    />
                    <RiskBadge value={getRiskValue(attempt.security)} />
                  </>
                }
                rows={[
                  { label: 'Score', value: attempt.score },
                  { label: 'Grade', value: attempt.grade },
                  { label: 'Field', value: attempt.field },
                  { label: 'Security', value: attempt.security },
                ]}
                actions={
                  <ActionMenu
                    variant="icon"
                    actions={[
                      {
                        label: 'View attempt',
                        onClick: () => router.push(`/admin/attempts/${attempt.id}`),
                      },
                      {
                        label: 'Review security log',
                        onClick: () => router.push(`/admin/attempts/${attempt.id}`),
                      },
                    ]}
                  />
                }
              />
            ))}
          </div>
        ) : null}

        {!isLoading ? (
          <DataTable
            columns={['Student', 'Assessment', 'Outcome', 'Status', 'Security', 'Submitted', 'Actions']}
            gridTemplate="1.15fr 1.45fr 0.9fr 0.85fr 0.9fr 1fr 0.45fr"
          >
            {items.map((attempt) => (
              <div
                key={attempt.id}
                className="grid min-w-0 cursor-pointer gap-4 border-b border-[var(--dashboard-panel-border)] px-5 py-4 last:border-b-0"
                style={{ gridTemplateColumns: '1.15fr 1.45fr 0.9fr 0.85fr 0.9fr 1fr 0.45fr' }}
                onClick={() => router.push(`/admin/attempts/${attempt.id}`)}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--dashboard-text)]">{attempt.student}</p>
                  <p className="mt-1 truncate text-xs text-[var(--dashboard-muted)]">{attempt.field}</p>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--dashboard-text)]">{attempt.assessment}</p>
                  <p className="mt-1 truncate text-xs text-[var(--dashboard-muted)]">Assessment submission record</p>
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--dashboard-text)]">{attempt.score}</p>
                  <p className="mt-1 text-xs text-[var(--dashboard-muted)]">Grade {attempt.grade}</p>
                </div>

                <div className="min-w-0">
                  <StatusBadge
                    value={attempt.status}
                    tone={
                      attempt.status === 'Reviewed'
                        ? 'active'
                        : attempt.status === 'Flagged'
                          ? 'danger'
                          : 'draft'
                    }
                  />
                </div>

                <div className="min-w-0">
                  <RiskBadge value={getRiskValue(attempt.security)} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-[var(--dashboard-text)]">{attempt.submittedAt}</p>
                </div>

                <div className="flex justify-end">
                  <ActionMenu
                    variant="icon"
                    actions={[
                      {
                        label: 'View attempt',
                        onClick: () => router.push(`/admin/attempts/${attempt.id}`),
                      },
                      {
                        label: 'Review security log',
                        onClick: () => router.push(`/admin/attempts/${attempt.id}`),
                      },
                    ]}
                  />
                </div>
              </div>
            ))}
          </DataTable>
        ) : null}

        {!isLoading && !items.length ? (
          <div className="dashboard-panel rounded-[1.8rem] p-6">
            <p className="text-sm font-semibold text-[var(--dashboard-text)]">No attempts match the current filters</p>
            <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
              Adjust the search or filters to surface a different submission set.
            </p>
          </div>
        ) : null}

        {!isLoading && items.length ? (
          <div className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-panel-bg)] px-4 py-3">
            <p className="text-sm text-[var(--dashboard-muted)]">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="dashboard-dark-button rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page === totalPages}
                className="dashboard-dark-button rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </AdminLayout>
  );
}
