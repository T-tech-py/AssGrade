'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { SectionHeader } from '@/components/dashboard/section-header';
import { practiceRecommendation, recentPracticeSessions } from '@/data/practice-mode';
import { PracticeSetupCard } from '@/components/practice/practice-setup-card';
import { PracticeLayout } from '@/components/practice/practice-layout';
import { RecommendedSetupCard } from '@/components/practice/recommended-setup-card';
import { RecentPracticeCard } from '@/components/practice/recent-practice-card';
import { StudyPlanCard } from '@/components/practice/study-plan-card';
import { BrainIcon, SparklesIcon } from '@/components/practice/practice-icons';
import { getPracticeBootstrapRequest, type PracticeBootstrapResponse } from '@/lib/practice-api';

const fallbackBootstrap: PracticeBootstrapResponse = {
  recommendation: practiceRecommendation,
  recentSessions: recentPracticeSessions,
  studyPlan: [
    { day: 'Monday', focus: 'Run a short guided session on your weakest topic.' },
    { day: 'Wednesday', focus: 'Review explanations and rewrite one theory answer more clearly.' },
    { day: 'Friday', focus: 'Take a mixed mini-session to test retention and confidence.' },
  ],
};

export default function PracticePage() {
  const [bootstrap, setBootstrap] = useState<PracticeBootstrapResponse>(fallbackBootstrap);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const loadBootstrap = async () => {
      setIsLoading(true);

      try {
        const response = await getPracticeBootstrapRequest();
        if (isCancelled) return;
        setBootstrap(response);
        setHasLoadedOnce(true);
      } catch {
        if (isCancelled) return;
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadBootstrap();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <PracticeLayout
      title="Practice smarter with AI"
      subtitle="Generate personalized questions, strengthen weak areas, and improve your job-readiness with guided practice."
    >
      {isLoading && hasLoadedOnce ? (
        <div className="practice-panel rounded-[1.6rem] px-4 py-3 text-sm text-[var(--practice-muted)]">
          Refreshing your practice recommendations...
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className="practice-panel-strong rounded-[2rem] p-6 sm:p-7"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--practice-accent-foreground)]">
                Practice mode
              </p>
              <h2 className="mt-3 max-w-2xl text-[2.1rem] font-semibold tracking-[-0.05em] text-[var(--practice-text)] sm:text-[2.6rem]">
                A gentler way to build real employability confidence
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--practice-muted)] sm:text-base">
                Practice Mode gives you AI-guided questions, instant explanations, and a clear follow-up plan so you can improve without the pressure of a live assessment.
              </p>
            </div>

            <div className="practice-highlight rounded-[1.6rem] px-5 py-5">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--practice-warm-foreground)]">
                <SparklesIcon className="h-3.5 w-3.5" />
                Recommended for you
              </p>
              <p className="mt-3 text-lg font-semibold text-[var(--practice-text)]">{bootstrap.recommendation.topic}</p>
              <p className="mt-2 text-sm text-[var(--practice-muted)]">
                {bootstrap.recommendation.questionCount} questions • {bootstrap.recommendation.style}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="practice-soft-tile rounded-[1.4rem] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--practice-subtle)]">Adaptive help</p>
              <p className="mt-2 text-sm font-semibold text-[var(--practice-text)]">Explanations when you need them</p>
            </div>
            <div className="practice-soft-tile rounded-[1.4rem] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--practice-subtle)]">Focus areas</p>
              <p className="mt-2 text-sm font-semibold text-[var(--practice-text)]">Target weak spots faster</p>
            </div>
            <div className="practice-soft-tile rounded-[1.4rem] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--practice-subtle)]">Study guidance</p>
              <p className="mt-2 text-sm font-semibold text-[var(--practice-text)]">Turn feedback into a real plan</p>
            </div>
          </div>
        </motion.div>

        <RecommendedSetupCard recommendation={bootstrap.recommendation} />
      </section>

      <section className="mt-4">
        <PracticeSetupCard defaults={bootstrap.recommendation} />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <SectionHeader
            eyebrow="Recent sessions"
            title="Keep building from where you left off"
            subtitle="Open a previous practice review or continue from the topics that still need attention."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {bootstrap.recentSessions.map((session) => (
              <RecentPracticeCard key={session.id} session={session} />
            ))}
          </div>
        </div>

        <StudyPlanCard
          title="Suggested weekly rhythm"
          subtitle="A light study cadence that keeps you improving without burning out before real assessments."
          items={bootstrap.studyPlan}
        />
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="practice-panel rounded-[1.8rem] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--practice-accent-soft)] text-[var(--practice-accent-foreground)]">
              <BrainIcon className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[1.2rem] font-semibold tracking-[-0.03em] text-[var(--practice-text)]">AI-generated guidance</p>
              <p className="mt-1 text-sm leading-6 text-[var(--practice-muted)]">
                Practice Mode is designed to explain the why behind each answer, not just whether it was right.
              </p>
            </div>
          </div>
        </div>

        <div className="practice-panel rounded-[1.8rem] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--practice-warm-soft)] text-[var(--practice-warm-foreground)]">
              <SparklesIcon className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[1.2rem] font-semibold tracking-[-0.03em] text-[var(--practice-text)]">AI-powered now</p>
              <p className="mt-1 text-sm leading-6 text-[var(--practice-muted)]">
                Practice generation and feedback are now connected through the backend AI service for guided question creation and review.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PracticeLayout>
  );
}
