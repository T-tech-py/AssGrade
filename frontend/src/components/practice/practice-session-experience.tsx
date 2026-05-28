'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { PracticeQuestion, PracticeStyle } from '@/data/practice-mode';
import { FeedbackCard } from './feedback-card';
import { FocusAreasCard } from './focus-areas-card';
import { PracticeLayout } from './practice-layout';
import { PracticeQuestionRenderer } from './practice-question-renderer';
import { PracticeSessionHeader } from './practice-session-header';
import { SessionProgressCard } from './session-progress-card';
import { StudyPlanCard } from './study-plan-card';
import {
  getPracticeQuestionFeedbackRequest,
  getPracticeSessionRequest,
  reviewPracticeSessionRequest,
  type PracticeQuestionFeedbackResponse,
  type PracticeSessionResponse,
} from '@/lib/practice-api';
import {
  getStoredPracticeSession,
  setStoredPracticeReview,
} from '@/lib/practice-session-store';
import { emitAppToast } from '@/components/ui/app-toast';
import {
  ArrowRightIcon,
  BookIcon,
  BrainIcon,
  CheckCircleIcon,
  CodeIcon,
  MessageIcon,
} from './practice-icons';

type Answers = Record<string, string>;

function getQuestionTypeLabel(question: PracticeQuestion) {
  if (question.type === 'mcq') return 'MCQ';
  if (question.type === 'theory') return 'Theory';
  return 'Coding';
}

export function PracticeSessionExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const [sessionResponse, setSessionResponse] = useState<PracticeSessionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState<string[]>([]);
  const [feedbackByQuestionId, setFeedbackByQuestionId] = useState<
    Record<string, PracticeQuestionFeedbackResponse>
  >({});
  const [showDeferredMessage, setShowDeferredMessage] = useState(false);
  const [saveStatus, setSaveStatus] = useState('All responses saved');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadSession = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const stored = getStoredPracticeSession();
        if (!isCancelled && stored && (!sessionId || stored.sessionId === sessionId)) {
          setSessionResponse(stored);
          setIsLoading(false);
          return;
        }

        if (!sessionId) {
          throw new Error('No practice session was found. Generate a new session to continue.');
        }

        const response = await getPracticeSessionRequest(sessionId);
        if (isCancelled) return;
        setSessionResponse(response);
      } catch (error) {
        if (isCancelled) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'We could not load this practice session right now.',
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadSession();

    return () => {
      isCancelled = true;
    };
  }, [sessionId]);

  const session = sessionResponse?.session;
  const questions = session?.questions ?? [];
  const currentQuestion = questions[currentIndex];
  const sessionStyle = (session?.style ?? 'Instant Feedback') as PracticeStyle;

  const answeredCount = useMemo(
    () => questions.filter((question) => Boolean(answers[question.id]?.trim())).length,
    [answers, questions],
  );

  const currentAnswer =
    currentQuestion
      ? answers[currentQuestion.id] ?? (currentQuestion.type === 'coding' ? currentQuestion.starterCode : '')
      : '';
  const hasAnswer = Boolean(currentAnswer.trim());
  const isSubmitted = currentQuestion ? submitted.includes(currentQuestion.id) : false;
  const currentFeedback = currentQuestion ? feedbackByQuestionId[currentQuestion.id] : undefined;

  const updateAnswer = (value: string) => {
    if (!currentQuestion) return;
    setShowDeferredMessage(false);
    setSaveStatus('Saving...');
    setAnswers((current) => ({ ...current, [currentQuestion.id]: value }));
    window.setTimeout(() => setSaveStatus('All responses saved'), 350);
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !sessionResponse || !hasAnswer) return;

    setIsSubmittingAnswer(true);
    setShowDeferredMessage(false);
    setSaveStatus('All responses saved');

    try {
      setSubmitted((current) =>
        current.includes(currentQuestion.id) ? current : [...current, currentQuestion.id],
      );

      if (sessionStyle === 'Instant Feedback') {
        const feedback = await getPracticeQuestionFeedbackRequest({
          sessionId: sessionResponse.sessionId,
          questionId: currentQuestion.id,
          answer: currentAnswer,
        });

        setFeedbackByQuestionId((current) => ({
          ...current,
          [currentQuestion.id]: feedback,
        }));
      } else {
        setShowDeferredMessage(true);
      }
    } catch (error) {
      emitAppToast({
        title: 'Answer review failed',
        description:
          error instanceof Error
            ? error.message
            : 'We could not review this answer right now.',
        tone: 'error',
      });
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const moveQuestion = (direction: 'previous' | 'next') => {
    setShowDeferredMessage(false);
    setCurrentIndex((current) => {
      const nextIndex = direction === 'previous' ? current - 1 : current + 1;
      return Math.max(0, Math.min(questions.length - 1, nextIndex));
    });
  };

  const finishSession = async () => {
    if (!sessionResponse || answeredCount === 0) {
      emitAppToast({
        title: 'Answer at least one question',
        description: 'Submit one response before opening the review screen.',
        tone: 'error',
      });
      return;
    }

    setIsFinishing(true);

    try {
      const review = await reviewPracticeSessionRequest({
        sessionId: sessionResponse.sessionId,
        answers: questions.map((question) => ({
          questionId: question.id,
          answer:
            answers[question.id] ??
            (question.type === 'coding' ? question.starterCode : ''),
        })),
      });

      setStoredPracticeReview(review);

      router.push(`/practice/review?reviewId=${review.reviewId}`);
    } catch (error) {
      emitAppToast({
        title: 'Review generation failed',
        description:
          error instanceof Error
            ? error.message
            : 'We could not finish this session right now.',
        tone: 'error',
      });
    } finally {
      setIsFinishing(false);
    }
  };

  if (isLoading) {
    return (
      <PracticeLayout
        variant="session"
        title="Guided practice session"
        subtitle="A calmer, more helpful environment for building readiness one answer at a time."
      >
        <div className="space-y-4">
          <div className="practice-panel h-[8rem] animate-pulse rounded-[1.8rem]" />
          <div className="practice-panel h-[32rem] animate-pulse rounded-[2rem]" />
        </div>
      </PracticeLayout>
    );
  }

  if (errorMessage || !session || !currentQuestion) {
    return (
      <PracticeLayout
        variant="session"
        title="Guided practice session"
        subtitle="A calmer, more helpful environment for building readiness one answer at a time."
      >
        <div className="practice-panel rounded-[1.7rem] p-6 text-sm text-[var(--practice-muted)]">
          <p className="font-semibold text-[var(--practice-text)]">We could not load this practice session.</p>
          <p className="mt-2 leading-7">
            {errorMessage ?? 'Generate a new session to continue.'}
          </p>
          <div className="mt-5">
            <Link
              href="/practice"
              className="practice-dark-button inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold"
            >
              Back to Practice
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </PracticeLayout>
    );
  }

  return (
    <PracticeLayout
      variant="session"
      title="Guided practice session"
      subtitle="A calmer, more helpful environment for building readiness one answer at a time."
    >
      <div className="space-y-4 lg:space-y-5">
        <PracticeSessionHeader
          title={session.title}
          topic={`${session.category} • ${session.difficulty} • ${session.questionType}`}
          currentQuestion={currentQuestion.number}
          totalQuestions={questions.length}
          style={sessionStyle}
          progressNote={session.progressNote}
        />

        <div className="grid gap-4 xl:grid-cols-[1.28fr_0.72fr]">
          <section className="space-y-4">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="practice-panel-strong rounded-[2rem] p-5 sm:p-6 lg:p-7"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[var(--practice-soft-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--practice-text)]">
                  Question {currentQuestion.number}
                </span>
                <span className="rounded-full bg-[var(--practice-accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--practice-accent-foreground)]">
                  {getQuestionTypeLabel(currentQuestion)}
                </span>
                <span className="rounded-full bg-[var(--practice-warm-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--practice-warm-foreground)]">
                  {currentQuestion.difficulty}
                </span>
              </div>

              <div className="mt-5">
                <h3 className="text-[1.55rem] font-semibold leading-[1.2] tracking-[-0.04em] text-[var(--practice-text)] sm:text-[1.8rem]">
                  {currentQuestion.prompt}
                </h3>
                {currentQuestion.supportingText ? (
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--practice-muted)]">
                    {currentQuestion.supportingText}
                  </p>
                ) : null}
              </div>

              <div className="mt-6">
                <PracticeQuestionRenderer
                  question={currentQuestion}
                  answer={currentAnswer}
                  onChange={updateAnswer}
                  disabled={isSubmittingAnswer}
                />
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-[var(--practice-panel-border)] pt-5 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => moveQuestion('previous')}
                  disabled={currentIndex === 0}
                  className="practice-dark-button inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => void handleSubmitAnswer()}
                  disabled={!hasAnswer || isSubmittingAnswer}
                  className="dashboard-lime-panel inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold text-[#223200] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmittingAnswer ? 'Reviewing...' : 'Submit Answer'}
                </button>
                <button
                  type="button"
                  onClick={() => moveQuestion('next')}
                  disabled={currentIndex === questions.length - 1}
                  className="practice-dark-button inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => void finishSession()}
                  disabled={isFinishing}
                  className="practice-dark-button inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 sm:ml-auto disabled:cursor-wait disabled:opacity-60"
                >
                  {isFinishing ? 'Finishing...' : 'End Session'}
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {sessionStyle === 'Instant Feedback' && isSubmitted && currentFeedback ? (
                <motion.div
                  key={`feedback-${currentQuestion.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.22 }}
                >
                  <FeedbackCard
                    question={currentQuestion}
                    feedback={currentFeedback}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            {sessionStyle === 'End-of-Session Review' && showDeferredMessage ? (
              <div className="practice-panel rounded-[1.6rem] p-5">
                <p className="text-sm font-semibold text-[var(--practice-text)]">Answer saved for review</p>
                <p className="mt-2 text-sm leading-6 text-[var(--practice-muted)]">
                  You are in review-later mode, so explanations and coaching will appear on the end-of-session review screen.
                </p>
              </div>
            ) : null}
          </section>

          <aside className="space-y-4">
            <SessionProgressCard
              answeredCount={answeredCount}
              totalQuestions={questions.length}
              style={sessionStyle}
              topic={session.topic}
              saveStatus={saveStatus}
            />

            <FocusAreasCard
              title="Focus areas"
              helper="Suggestions refreshed from your recent results and current topic."
              items={session.focusAreas}
            />

            <FocusAreasCard
              title="Recommended next topics"
              helper="Helpful follow-on topics if you want to extend this session."
              items={session.recommendedTopics}
            />

            <div className="practice-panel rounded-[1.6rem] p-5">
              <p className="text-sm font-semibold text-[var(--practice-text)]">Quick study tips</p>
              <div className="mt-4 space-y-3">
                {session.studyTips.map((tip) => (
                  <div key={tip} className="practice-soft-tile flex gap-3 rounded-[1.1rem] px-3 py-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.65)] text-[var(--practice-accent-foreground)]">
                      <BrainIcon className="h-4 w-4" />
                    </div>
                    <p className="text-sm leading-6 text-[var(--practice-muted)]">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="practice-highlight rounded-[1.6rem] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--practice-warm-foreground)]">Session settings</p>
              <div className="mt-4 space-y-3 text-sm text-[var(--practice-text)]">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2"><BookIcon className="h-4 w-4" /> Topic</span>
                  <span className="font-semibold">{session.topic}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2"><MessageIcon className="h-4 w-4" /> Review style</span>
                  <span className="font-semibold">{sessionStyle}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2"><CodeIcon className="h-4 w-4" /> Format</span>
                  <span className="font-semibold">{session.questionType}</span>
                </div>
              </div>
            </div>

            <StudyPlanCard
              title="Suggested follow-up"
              subtitle="A quick plan to keep the learning momentum going after this session."
              items={[
                { day: 'Today', focus: 'Review the explanation card and note one pattern you missed.' },
                { day: 'Tomorrow', focus: `Generate a short follow-up set on ${session.focusAreas[0]?.toLowerCase() ?? session.topic.toLowerCase()}.` },
                { day: 'This week', focus: 'Pair guided practice with one readiness assessment to measure progress.' },
              ]}
            />

            <div className="practice-panel rounded-[1.6rem] p-5">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--practice-text)]">
                <CheckCircleIcon className="h-4 w-4 text-[var(--practice-accent-foreground)]" />
                AI coaching active
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--practice-muted)]">
                This session is using backend AI generation and review to give you guided questions and answer feedback.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </PracticeLayout>
  );
}
