'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminSectionHeader } from '@/components/admin/admin-section-header';
import { RiskBadge } from '@/components/admin/risk-badge';
import { StatusBadge } from '@/components/admin/status-badge';
import type { AdminAttemptDetailResponse } from '@/lib/admin-api';
import { getAdminAttemptDetailRequest } from '@/lib/admin-api';

type AttemptDetailPageProps = {
  params: Promise<{ id: string }>;
};

function severityTone(value: 'Low' | 'Medium' | 'High') {
  return value === 'High' ? 'danger' : value === 'Medium' ? 'warning' : 'neutral';
}

function answerTone(value: 'Strong' | 'Needs Review' | 'Flagged') {
  return value === 'Strong' ? 'active' : value === 'Flagged' ? 'danger' : 'warning';
}

export default function AdminAttemptDetailPage({ params }: AttemptDetailPageProps) {
  const resolvedParams = use(params);
  const [attempt, setAttempt] = useState<AdminAttemptDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAttempt() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getAdminAttemptDetailRequest(resolvedParams.id);
        if (!cancelled) {
          setAttempt(response);
          setMissing(false);
        }
      } catch (requestError) {
        if (!cancelled) {
          const message = requestError instanceof Error ? requestError.message : 'Unable to load attempt.';
          if (message.toLowerCase().includes('not found')) {
            setMissing(true);
          } else {
            setError(message);
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadAttempt();
    return () => {
      cancelled = true;
    };
  }, [resolvedParams.id]);

  if (missing) {
    notFound();
  }

  return (
    <AdminLayout
      title={attempt ? `${attempt.student} Attempt` : 'Attempt Detail'}
      subtitle="Inspect response quality, grading signals, and integrity events from one operational review page."
    >
      <div className="mb-4">
        <Link
          href="/admin/attempts"
          className="dashboard-dark-button inline-flex items-center rounded-2xl px-4 py-3 text-sm font-semibold"
        >
          ← Back to Attempts
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          <div className="dashboard-panel-strong h-64 rounded-[1.9rem] animate-pulse" />
          <div className="dashboard-panel h-[34rem] rounded-[1.9rem] animate-pulse" />
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="dashboard-panel rounded-[1.8rem] p-6">
          <p className="text-sm font-semibold text-rose-400">Unable to load attempt</p>
          <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{error}</p>
        </div>
      ) : null}

      {!isLoading && !error && attempt ? (
        <>
          <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="dashboard-panel-strong rounded-[1.9rem] p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
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
                <RiskBadge
                  value={
                    attempt.security === 'High Risk'
                      ? 'High'
                      : attempt.security === 'Flagged'
                        ? 'Medium'
                        : 'Low'
                  }
                />
                <StatusBadge value={attempt.field} tone="neutral" />
              </div>

              <h2 className="mt-4 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--dashboard-text)]">
                {attempt.student}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
                {attempt.studentEmail} • {attempt.studentSchool}
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--dashboard-muted)]">
                {attempt.readinessNote}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Assessment', attempt.assessment],
                  ['Score', `${attempt.score} • ${attempt.grade}`],
                  ['Submitted', attempt.submittedAt],
                  ['Duration', attempt.duration],
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

            <div className="dashboard-panel rounded-[1.9rem] p-5 sm:p-6">
              <AdminSectionHeader
                eyebrow="Session profile"
                title="Integrity and device review"
                subtitle="Use this view to validate the environment before relying on the attempt outcome."
              />

              <div className="mt-5 space-y-3">
                {[
                  ['Started at', attempt.startedAt],
                  ['Device', attempt.device],
                  ['IP address', attempt.ipAddress],
                  ['Warnings', `${attempt.warningCount}`],
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
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
            <div className="dashboard-panel rounded-[1.8rem] p-5">
              <AdminSectionHeader
                eyebrow="Answer review"
                title="Submitted responses"
                subtitle="Inspect what the student wrote for each question alongside the review signal and awarded marks."
              />

              <div className="mt-5 space-y-4">
                {attempt.answers.map((answer) => (
                  <div
                    key={answer.id}
                    className="dashboard-soft-tile rounded-[1.35rem] border border-[var(--dashboard-panel-border)] p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[var(--dashboard-icon-surface)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]">
                        Question {answer.number}
                      </span>
                      <StatusBadge value={answer.type} tone="draft" />
                      <StatusBadge value={answer.status} tone={answerTone(answer.status)} />
                      <span className="text-xs font-semibold text-[var(--dashboard-muted)]">{answer.awardedMarks}</span>
                    </div>

                    <p className="mt-4 text-base font-semibold leading-7 text-[var(--dashboard-text)]">
                      {answer.prompt}
                    </p>

                    <div className="mt-4 rounded-[1.15rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-panel-bg)] px-4 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                        Student answer
                      </p>
                      <pre className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--dashboard-text)]">
                        {answer.answer}
                      </pre>
                    </div>

                    <div className="mt-4 rounded-[1.15rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-panel-bg)] px-4 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">
                        Review note
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[var(--dashboard-muted)]">{answer.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="dashboard-panel rounded-[1.8rem] p-5">
                <AdminSectionHeader
                  eyebrow="Performance signal"
                  title="Attempt summary"
                  subtitle="A high-level read of how this attempt performed across formats."
                />

                <div className="mt-5 grid gap-3">
                  {[
                    ['MCQ correctness', attempt.summary.mcqCorrect],
                    ['Theory quality', attempt.summary.theoryQuality],
                    ['Coding quality', attempt.summary.codingQuality],
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
                  eyebrow="Security timeline"
                  title="Integrity events"
                  subtitle="Chronological review of the events captured during this session."
                />

                <div className="mt-5 space-y-3">
                  {attempt.securityTimeline.map((event) => (
                    <div key={`${event.time}-${event.title}`} className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[var(--dashboard-text)]">{event.title}</p>
                        <StatusBadge value={event.severity} tone={severityTone(event.severity)} />
                      </div>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">{event.time}</p>
                      <p className="mt-3 text-sm leading-6 text-[var(--dashboard-muted)]">{event.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </AdminLayout>
  );
}
