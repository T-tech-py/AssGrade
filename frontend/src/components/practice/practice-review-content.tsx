'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPracticeReviewRequest, type PracticeReviewResponse } from '@/lib/practice-api';
import { getStoredPracticeReview } from '@/lib/practice-session-store';
import { FocusAreasCard } from './focus-areas-card';
import { PracticeLayout } from './practice-layout';
import { PracticeSummaryCard } from './practice-summary-card';
import { ReviewQuestionCard } from './review-question-card';
import { StudyPlanCard } from './study-plan-card';
import {
  ArrowRightIcon,
  BrainIcon,
  CheckCircleIcon,
  MessageIcon,
  SparklesIcon,
  TargetIcon,
} from './practice-icons';

export function PracticeReviewContent() {
  const searchParams = useSearchParams();
  const reviewId = searchParams.get('reviewId');
  const [reviewResponse, setReviewResponse] = useState<PracticeReviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadReview = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const stored = getStoredPracticeReview();
        if (!isCancelled && stored && (!reviewId || stored.reviewId === reviewId)) {
          setReviewResponse(stored);
          setIsLoading(false);
          return;
        }

        if (!reviewId) {
          throw new Error('No practice review was found. Finish a session to see your review here.');
        }

        const response = await getPracticeReviewRequest(reviewId);
        if (isCancelled) return;
        setReviewResponse(response);
      } catch (error) {
        if (isCancelled) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'We could not load this practice review right now.',
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadReview();

    return () => {
      isCancelled = true;
    };
  }, [reviewId]);

  if (isLoading) {
    return (
      <PracticeLayout
        title="Practice review"
        subtitle="A supportive breakdown of what went well, what needs work, and how to improve next."
      >
        <div className="space-y-4">
          <div className="practice-panel h-[10rem] animate-pulse rounded-[2rem]" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={`practice-review-loading-${index}`}
                className="practice-panel h-[10rem] animate-pulse rounded-[1.8rem]"
              />
            ))}
          </div>
        </div>
      </PracticeLayout>
    );
  }

  if (errorMessage || !reviewResponse) {
    return (
      <PracticeLayout
        title="Practice review"
        subtitle="A supportive breakdown of what went well, what needs work, and how to improve next."
      >
        <div className="practice-panel rounded-[1.8rem] p-5 sm:p-6">
          <p className="text-sm font-semibold text-[var(--practice-text)]">
            We could not load this practice review.
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--practice-muted)]">
            {errorMessage ?? 'Start a practice session to generate a review.'}
          </p>
          <div className="mt-5">
            <Link
              href="/practice"
              className="dashboard-lime-panel inline-flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold text-[#223200]"
            >
              Back to Practice
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </PracticeLayout>
    );
  }

  const { review } = reviewResponse;

  return (
    <PracticeLayout
      title="Practice review"
      subtitle="A supportive breakdown of what went well, what needs work, and how to improve next."
    >
      <section className="practice-panel-strong rounded-[2rem] p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--practice-accent-foreground)]">Session summary</p>
            <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--practice-text)]">
              {review.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--practice-muted)]">
              {review.field} • {review.topic} • {review.difficulty} • {review.completedAt}
            </p>
          </div>

          <div className="practice-highlight rounded-[1.6rem] px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--practice-warm-foreground)]">Session score</p>
            <p className="mt-3 text-[2.2rem] font-semibold tracking-[-0.05em] text-[var(--practice-text)]">{review.score}</p>
            <p className="mt-2 text-sm text-[var(--practice-muted)]">{review.completion}</p>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {review.summaryMetrics.map((item) => {
          const icon =
            item.title === 'Correct answers' ? (
              <CheckCircleIcon className="h-4.5 w-4.5" />
            ) : item.title === 'Accuracy rate' ? (
              <TargetIcon className="h-4.5 w-4.5" />
            ) : item.title === 'Strongest area' ? (
              <SparklesIcon className="h-4.5 w-4.5" />
            ) : (
              <MessageIcon className="h-4.5 w-4.5" />
            );

          return (
            <PracticeSummaryCard
              key={item.title}
              title={item.title}
              value={item.value}
              helper={item.helper}
              icon={icon}
            />
          );
        })}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <FocusAreasCard
          title="Topics to strengthen"
          helper="These are the clearest opportunities for your next guided session."
          items={review.weakAreas}
        />

        <div className="practice-highlight rounded-[1.8rem] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(35,52,0,0.1)] text-[var(--practice-warm-foreground)]">
              <SparklesIcon className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--practice-text)]">Career insight</p>
              <p className="text-xs text-[var(--practice-muted)]">A small nudge from your current practice signals</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-[var(--practice-text)]">{review.careerInsight}</p>
        </div>
      </section>

      <section className="mt-4 space-y-4">
        {review.questions.map((question) => (
          <ReviewQuestionCard key={question.id} question={question} />
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <StudyPlanCard items={review.studyPlan} />

        <div className="practice-panel-strong rounded-[1.8rem] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--practice-accent-soft)] text-[var(--practice-accent-foreground)]">
              <BrainIcon className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-[1.35rem] font-semibold tracking-[-0.04em] text-[var(--practice-text)]">Keep the momentum</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--practice-muted)]">
                The best next step is another guided session on the weakest area you just uncovered.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href="/practice"
              className="dashboard-lime-panel inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold text-[#223200] transition hover:-translate-y-0.5"
            >
              Start Another Practice Session
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/practice"
              className="practice-dark-button inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5"
            >
              View Study Plan
            </Link>
            <Link
              href="/dashboard"
              className="practice-dark-button inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </PracticeLayout>
  );
}
