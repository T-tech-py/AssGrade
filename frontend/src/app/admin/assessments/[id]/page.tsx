'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminSectionHeader } from '@/components/admin/admin-section-header';
import { MobileDataCard } from '@/components/admin/mobile-data-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { TabsSection } from '@/components/admin/tabs-section';
import { emitAppToast } from '@/components/ui/app-toast';
import type { AdminAssessmentDetailResponse } from '@/lib/admin-api';
import {
  duplicateAdminAssessmentRequest,
  getAdminAssessmentDetailRequest,
  updateAdminAssessmentStatusRequest,
} from '@/lib/admin-api';

type AssessmentDetailPageProps = {
  params: Promise<{ id: string }>;
};

type DetailTab = 'overview' | 'questions' | 'attempts' | 'settings';

export default function AssessmentDetailPage({ params }: AssessmentDetailPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [assessment, setAssessment] = useState<AdminAssessmentDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActioning, setIsActioning] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAssessment() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getAdminAssessmentDetailRequest(resolvedParams.id);
        if (!cancelled) {
          setAssessment(response);
        }
      } catch (requestError) {
        if (!cancelled) {
          const message = requestError instanceof Error ? requestError.message : 'Unable to load assessment.';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadAssessment();
    return () => {
      cancelled = true;
    };
  }, [resolvedParams.id]);

  const handleStatusChange = async (next: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    if (!assessment) return;

    setIsActioning(true);
    try {
      const response = await updateAdminAssessmentStatusRequest(assessment.id, next);
      emitAppToast({
        title: 'Assessment updated',
        description: response.message,
        tone: 'success',
      });
      const refreshed = await getAdminAssessmentDetailRequest(assessment.id);
      setAssessment(refreshed);
    } catch (requestError) {
      emitAppToast({
        title: 'Unable to update assessment',
        description: requestError instanceof Error ? requestError.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setIsActioning(false);
    }
  };

  const handleDuplicate = async () => {
    if (!assessment) return;

    setIsActioning(true);
    try {
      const response = await duplicateAdminAssessmentRequest(assessment.id);
      emitAppToast({
        title: 'Draft duplicated',
        description: response.message,
        tone: 'success',
      });
      router.push(`/admin/assessments/${response.item.id}`);
    } catch (requestError) {
      emitAppToast({
        title: 'Unable to duplicate assessment',
        description: requestError instanceof Error ? requestError.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setIsActioning(false);
    }
  };

  const badgeTone =
    assessment?.status === 'Active'
      ? 'active'
      : assessment?.status === 'Draft'
        ? 'draft'
        : 'archived';

  return (
    <AdminLayout
      title={assessment?.title ?? 'Assessment'}
      subtitle="Review overview metrics, manage question inventory, and monitor attempt quality from one place."
    >
      <div className="mb-4">
        <Link
          href="/admin/assessments"
          className="dashboard-dark-button inline-flex items-center rounded-2xl px-4 py-3 text-sm font-semibold"
        >
          ← Back to Assessments
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          <div className="dashboard-panel-strong h-64 rounded-[1.9rem] animate-pulse" />
          <div className="dashboard-panel h-64 rounded-[1.9rem] animate-pulse" />
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="dashboard-panel rounded-[1.8rem] p-6">
          <p className="text-sm font-semibold text-rose-400">Unable to load assessment</p>
          <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{error}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.refresh()}
              className="dashboard-dark-button rounded-2xl px-4 py-3 text-sm font-semibold"
            >
              Retry
            </button>
            <Link
              href="/admin/assessments"
              className="dashboard-lime-panel rounded-2xl px-4 py-3 text-sm font-semibold text-[#223200]"
            >
              Back to Assessments
            </Link>
          </div>
        </div>
      ) : null}

      {!isLoading && !error && assessment ? (
        <>
          <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="dashboard-panel-strong rounded-[1.9rem] p-6">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge value={assessment.status} tone={badgeTone} />
                <StatusBadge value={assessment.field} tone="neutral" />
              </div>
              <h2 className="mt-4 text-[2.1rem] font-semibold tracking-[-0.05em] text-[var(--dashboard-text)]">
                {assessment.title}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--dashboard-muted)]">
                {assessment.description}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Duration', assessment.duration],
                  ['Question count', `${assessment.questionCount}`],
                  ['Difficulty', assessment.difficulty],
                  ['Formats', assessment.formats.join(', ')],
                ].map(([label, value]) => (
                  <div key={label} className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-panel rounded-[1.9rem] p-6">
              <AdminSectionHeader
                eyebrow="Assessment health"
                title="Operational snapshot"
                subtitle="A quick read of attempt volume, scoring performance, and maintenance status."
              />
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ['Attempts', `${assessment.metrics.attempts}`],
                  ['Average score', assessment.metrics.averageScore],
                  ['Pass rate', assessment.metrics.passRate],
                  ['Last updated', assessment.updatedAt],
                ].map(([label, value]) => (
                  <div key={label} className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/admin/assessments/${assessment.id}/edit`}
                  className="dashboard-dark-button rounded-2xl px-4 py-3 text-sm font-semibold"
                >
                  Edit assessment
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange(assessment.status === 'Active' ? 'ARCHIVED' : 'PUBLISHED')
                  }
                  disabled={isActioning}
                  className="dashboard-lime-panel rounded-2xl px-4 py-3 text-sm font-semibold text-[#223200] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {assessment.status === 'Active' ? 'Archive assessment' : 'Publish assessment'}
                </button>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  disabled={isActioning}
                  className="dashboard-dark-button rounded-2xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Duplicate draft
                </button>
              </div>
            </div>
          </section>

          <TabsSection
            items={[
              { key: 'overview', label: 'Overview' },
              { key: 'questions', label: 'Questions' },
              { key: 'attempts', label: 'Attempts' },
              { key: 'settings', label: 'Settings' },
            ]}
            active={activeTab}
            onChange={setActiveTab}
          />

          {activeTab === 'overview' ? (
            <section className="grid gap-4 xl:grid-cols-2">
              <div className="dashboard-panel rounded-[1.8rem] p-5">
                <AdminSectionHeader
                  eyebrow="Metadata"
                  title="Assessment details"
                  subtitle="Core definition and publishing metadata for this assessment."
                />
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    ['Created date', assessment.createdAt],
                    ['Updated date', assessment.updatedAt],
                    ['Status', assessment.status],
                    ['Certificate threshold', `${assessment.passingMarks}%`],
                    ['Question shuffle', assessment.shuffleQuestions ? 'Enabled' : 'Disabled'],
                    ['Option shuffle', assessment.shuffleOptions ? 'Enabled' : 'Disabled'],
                  ].map(([label, value]) => (
                    <div key={label} className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                        {label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="dashboard-panel rounded-[1.8rem] p-5">
                <AdminSectionHeader
                  eyebrow="Instructions"
                  title="Candidate guidance"
                  subtitle="The instructions students see before they begin the assessment."
                />
                <div className="mt-5 dashboard-soft-tile rounded-[1.2rem] px-4 py-4 text-sm leading-7 text-[var(--dashboard-text)]">
                  {assessment.instructions || 'No specific instructions have been set for this assessment yet.'}
                </div>
              </div>
            </section>
          ) : null}

          {activeTab === 'questions' ? (
            <section className="space-y-4">
              <AdminSectionHeader
                eyebrow="Question set"
                title="Assessment questions"
                subtitle="Review the live question inventory tied to this assessment and jump into question management."
              />
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/admin/assessments/${assessment.id}/edit`}
                  className="dashboard-lime-panel rounded-2xl px-4 py-3 text-sm font-semibold text-[#223200]"
                >
                  Edit question bank
                </Link>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                {assessment.questions.map((question) => (
                  <div key={question.id} className="dashboard-panel rounded-[1.6rem] p-5">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge value={question.type} tone="draft" />
                      <StatusBadge value={question.difficulty} tone="warning" />
                      <StatusBadge value={question.source} tone="neutral" />
                    </div>
                    <p className="mt-4 text-base font-semibold text-[var(--dashboard-text)]">{question.prompt}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
                      {question.marks} marks • {question.optionCount} options • Updated{' '}
                      {new Date(question.lastUpdated).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {activeTab === 'attempts' ? (
            <section className="space-y-4">
              <AdminSectionHeader
                eyebrow="Attempt review"
                title="Recent attempts"
                subtitle="Monitor grading health and identify students or sessions that need review."
              />
              <div className="grid gap-4 lg:hidden">
                {assessment.attempts.map((attempt) => (
                  <MobileDataCard
                    key={attempt.id}
                    title={attempt.student}
                    subtitle={assessment.title}
                    badges={
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
                    }
                    rows={[
                      { label: 'Score', value: attempt.score },
                      { label: 'Grade', value: attempt.grade },
                      { label: 'Security', value: attempt.security },
                      { label: 'Submitted', value: attempt.submittedAt },
                    ]}
                  />
                ))}
              </div>
              <div className="hidden lg:grid gap-3">
                {assessment.attempts.map((attempt) => (
                  <div key={attempt.id} className="dashboard-panel rounded-[1.4rem] px-5 py-4">
                    <div className="grid grid-cols-[1.2fr_0.9fr_0.8fr_0.9fr_1fr_1fr] gap-4">
                      <div className="text-sm font-semibold text-[var(--dashboard-text)]">{attempt.student}</div>
                      <div className="text-sm text-[var(--dashboard-text)]">{attempt.score}</div>
                      <div className="text-sm text-[var(--dashboard-text)]">{attempt.grade}</div>
                      <div>
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
                      <div className="text-sm text-[var(--dashboard-muted)]">{attempt.submittedAt}</div>
                      <div className="text-sm text-[var(--dashboard-muted)]">{attempt.security}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {activeTab === 'settings' ? (
            <section className="grid gap-4 xl:grid-cols-2">
              <div className="dashboard-panel rounded-[1.8rem] p-5">
                <AdminSectionHeader
                  eyebrow="Publishing"
                  title="Assessment settings"
                  subtitle="Operational controls tied to availability and assessment integrity."
                />
                <div className="mt-5 space-y-3">
                  {[
                    ['Assessment visibility', assessment.status === 'Active' ? 'Live to students' : 'Not live'],
                    ['Time limit', assessment.duration],
                    ['Fullscreen requirement', assessment.fullscreenRequired ? 'Enabled' : 'Disabled'],
                    ['Webcam requirement', assessment.webcamRequired ? 'Enabled' : 'Disabled'],
                    ['Tab switch limit', `${assessment.tabSwitchLimit}`],
                  ].map(([label, value]) => (
                    <div key={label} className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                        {label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="dashboard-panel rounded-[1.8rem] p-5">
                <AdminSectionHeader
                  eyebrow="Controls"
                  title="Publish actions"
                  subtitle="Use these controls when moving the assessment between draft, active, and archived states."
                />
                <div className="mt-5 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleStatusChange(assessment.status === 'Active' ? 'ARCHIVED' : 'PUBLISHED')
                    }
                    disabled={isActioning}
                    className="dashboard-lime-panel rounded-2xl px-4 py-3 text-sm font-semibold text-[#223200] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {assessment.status === 'Active' ? 'Archive assessment' : 'Publish assessment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange('DRAFT')}
                    disabled={isActioning}
                    className="dashboard-dark-button rounded-2xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Move to draft
                  </button>
                </div>
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </AdminLayout>
  );
}
