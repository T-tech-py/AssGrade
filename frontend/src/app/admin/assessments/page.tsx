'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ActionMenu } from '@/components/admin/action-menu';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminSectionHeader } from '@/components/admin/admin-section-header';
import { MobileDataCard } from '@/components/admin/mobile-data-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { emitAppToast } from '@/components/ui/app-toast';
import type { AdminAssessment } from '@/data/admin-dashboard';
import {
  duplicateAdminAssessmentRequest,
  getAdminAssessmentsRequest,
  updateAdminAssessmentStatusRequest,
} from '@/lib/admin-api';

type AssessmentStatusFilter = 'all' | 'draft' | 'active' | 'archived';
type AssessmentDifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';
type AssessmentCreatedFilter = 'all' | '30d' | '90d' | 'year';

export default function AdminAssessmentsPage() {
  const router = useRouter();
  const [items, setItems] = useState<AdminAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AssessmentStatusFilter>('all');
  const [field, setField] = useState('all');
  const [difficulty, setDifficulty] = useState<AssessmentDifficultyFilter>('all');
  const [created, setCreated] = useState<AssessmentCreatedFilter>('90d');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getAdminAssessmentsRequest({
          page,
          pageSize: 9,
          search,
          status,
          field,
          difficulty,
          created,
        });

        setItems(response.items);
        setTotalPages(response.meta.totalPages);
        setAvailableFields(response.meta.availableFields);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load assessments.');
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [created, difficulty, field, page, search, status]);

  const filters = useMemo(
    () => [
      { label: 'Field', value: field === 'all' ? 'All' : field },
      { label: 'Status', value: status === 'all' ? 'All' : status[0].toUpperCase() + status.slice(1) },
      {
        label: 'Difficulty',
        value: difficulty === 'all' ? 'All' : difficulty[0].toUpperCase() + difficulty.slice(1),
      },
      {
        label: 'Date created',
        value:
          created === 'all'
            ? 'All time'
            : created === '30d'
              ? 'Last 30 days'
              : created === '90d'
                ? 'Last 90 days'
                : 'Last year',
      },
    ],
    [created, difficulty, field, status],
  );

  const handleStatusChange = async (assessment: AdminAssessment, next: 'PUBLISHED' | 'ARCHIVED' | 'DRAFT') => {
    setActiveActionId(assessment.id);
    try {
      const response = await updateAdminAssessmentStatusRequest(assessment.id, next);
      setItems((current) => current.map((item) => (item.id === assessment.id ? (response.item as AdminAssessment) : item)));
      emitAppToast({
        title: 'Assessment updated',
        description: response.message,
        tone: 'success',
      });
    } catch (requestError) {
      emitAppToast({
        title: 'Unable to update assessment',
        description: requestError instanceof Error ? requestError.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setActiveActionId(null);
    }
  };

  const handleDuplicate = async (assessment: AdminAssessment) => {
    setActiveActionId(assessment.id);
    try {
      const response = await duplicateAdminAssessmentRequest(assessment.id);
      emitAppToast({
        title: 'Draft duplicated',
        description: response.message,
        tone: 'success',
      });
      setPage(1);
      const refreshed = await getAdminAssessmentsRequest({
        page: 1,
        pageSize: 9,
        search,
        status,
        field,
        difficulty,
        created,
      });
      setItems(refreshed.items);
      setTotalPages(refreshed.meta.totalPages);
      setAvailableFields(refreshed.meta.availableFields);
    } catch (requestError) {
      emitAppToast({
        title: 'Unable to duplicate assessment',
        description: requestError instanceof Error ? requestError.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setActiveActionId(null);
    }
  };

  return (
    <AdminLayout
      title="Assessments"
      subtitle="Create, monitor, and maintain all readiness assessments across disciplines."
    >
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
                placeholder="Search assessments by title, category, or status"
                className="w-full bg-transparent text-sm text-[var(--dashboard-text)] outline-none placeholder:text-[var(--dashboard-muted)]"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                value={status}
                onChange={(event) => {
                  setPage(1);
                  setStatus(event.target.value as AssessmentStatusFilter);
                }}
                className="dashboard-soft-tile min-h-11 rounded-xl border border-[var(--dashboard-panel-border)] px-3 py-2 text-sm text-[var(--dashboard-text)] outline-none"
              >
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={difficulty}
                onChange={(event) => {
                  setPage(1);
                  setDifficulty(event.target.value as AssessmentDifficultyFilter);
                }}
                className="dashboard-soft-tile min-h-11 rounded-xl border border-[var(--dashboard-panel-border)] px-3 py-2 text-sm text-[var(--dashboard-text)] outline-none"
              >
                <option value="all">All difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <select
                value={created}
                onChange={(event) => {
                  setPage(1);
                  setCreated(event.target.value as AssessmentCreatedFilter);
                }}
                className="dashboard-soft-tile min-h-11 rounded-xl border border-[var(--dashboard-panel-border)] px-3 py-2 text-sm text-[var(--dashboard-text)] outline-none"
              >
                <option value="all">All time</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="year">Last year</option>
              </select>
            </div>
          </div>

          <div className="flex xl:justify-end">
            <Link
              href="/admin/assessments/create"
              className="dashboard-lime-panel inline-flex min-h-11 items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-[#223200] max-xl:w-full"
            >
              Create Assessment
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--dashboard-panel-border)] pt-4">
          {filters.map((filter) => (
            <span
              key={filter.label}
              className="rounded-xl border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]"
            >
              {filter.label}: {filter.value}
            </span>
          ))}
        </div>
      </div>

      <section className="space-y-4">
        <AdminSectionHeader
          eyebrow="Assessment management"
          title="Assessment inventory"
          subtitle="Keep published assessments healthy and move draft work into production when it is ready."
        />

        {error ? (
          <div className="dashboard-panel rounded-[1.8rem] p-6">
            <p className="text-sm font-semibold text-rose-400">Unable to load assessments</p>
            <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{error}</p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid gap-4 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="dashboard-panel-strong h-[22rem] rounded-[1.8rem] animate-pulse" />
            ))}
          </div>
        ) : null}

        {!isLoading && !error ? (
          <>
            <div className="grid gap-4 lg:hidden">
              {items.map((assessment) => (
                <MobileDataCard
                  key={assessment.id}
                  title={assessment.title}
                  subtitle={`${assessment.field} • ${assessment.description}`}
                  badges={
                    <StatusBadge
                      value={assessment.status}
                      tone={
                        assessment.status === 'Active'
                          ? 'active'
                          : assessment.status === 'Draft'
                            ? 'draft'
                            : 'archived'
                      }
                    />
                  }
                  rows={[
                    { label: 'Duration', value: assessment.duration },
                    { label: 'Questions', value: `${assessment.questionCount}` },
                    { label: 'Difficulty', value: assessment.difficulty },
                    { label: 'Attempts', value: `${assessment.attemptsCount}` },
                  ]}
                  actions={
                    <ActionMenu
                      variant="icon"
                      actions={[
                        { label: 'View assessment', onClick: () => router.push(`/admin/assessments/${assessment.id}`) },
                        {
                          label: assessment.status === 'Active' ? 'Archive assessment' : 'Publish assessment',
                          onClick: () =>
                            handleStatusChange(
                              assessment,
                              assessment.status === 'Active' ? 'ARCHIVED' : 'PUBLISHED',
                            ),
                        },
                        { label: 'Duplicate', onClick: () => handleDuplicate(assessment) },
                      ]}
                    />
                  }
                />
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {items.map((assessment) => (
                <div key={assessment.id} className="dashboard-panel-strong flex h-full flex-col rounded-[1.8rem] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-accent-foreground)]">
                        {assessment.field}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">
                        {assessment.title}
                      </h3>
                    </div>
                    <StatusBadge
                      value={assessment.status}
                      tone={
                        assessment.status === 'Active'
                          ? 'active'
                          : assessment.status === 'Draft'
                            ? 'draft'
                            : 'archived'
                      }
                    />
                  </div>

                  <p className="mt-3 min-h-[72px] text-sm leading-6 text-[var(--dashboard-muted)]">
                    {assessment.description}
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                        Duration
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{assessment.duration}</p>
                    </div>
                    <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                        Questions
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{assessment.questionCount}</p>
                    </div>
                    <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                        Difficulty
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{assessment.difficulty}</p>
                    </div>
                    <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                        Attempts
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{assessment.attemptsCount}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3">
                    <Link
                      href={`/admin/assessments/${assessment.id}`}
                      className="dashboard-lime-panel inline-flex justify-center rounded-2xl px-4 py-3 text-sm font-semibold text-[#223200]"
                    >
                      View Assessment
                    </Link>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-[var(--dashboard-muted)]">
                        {activeActionId === assessment.id ? 'Updating…' : `Updated ${assessment.updatedAt}`}
                      </p>
                      <ActionMenu
                        variant="icon"
                        actions={[
                          { label: 'Open workspace', onClick: () => router.push(`/admin/assessments/${assessment.id}`) },
                          {
                            label: assessment.status === 'Active' ? 'Archive assessment' : 'Publish assessment',
                            onClick: () =>
                              handleStatusChange(
                                assessment,
                                assessment.status === 'Active' ? 'ARCHIVED' : 'PUBLISHED',
                              ),
                          },
                          {
                            label: 'Move to draft',
                            onClick: () => handleStatusChange(assessment, 'DRAFT'),
                          },
                          { label: 'Duplicate', onClick: () => handleDuplicate(assessment) },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!items.length ? (
              <div className="dashboard-panel rounded-[1.8rem] p-6">
                <p className="text-sm font-semibold text-[var(--dashboard-text)]">No assessments match the current filters</p>
                <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
                  Adjust the search or filter values, or create a new assessment to grow the inventory.
                </p>
              </div>
            ) : null}

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
          </>
        ) : null}
      </section>
    </AdminLayout>
  );
}
