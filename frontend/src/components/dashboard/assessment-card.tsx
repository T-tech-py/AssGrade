'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Assessment } from '@/data/student-dashboard';

export function AssessmentCard({ assessment }: { assessment: Assessment }) {
  const difficultyTone =
    assessment.difficulty === 'Beginner'
      ? 'bg-[var(--card-accent)] text-[var(--accent)]'
      : assessment.difficulty === 'Intermediate'
        ? 'bg-[var(--card-warm)] text-[var(--accent-alt)]'
        : 'bg-[var(--card-muted)] text-[var(--foreground)]';

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="dashboard-panel flex h-full min-h-[25rem] flex-col rounded-[1.7rem] p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-accent-foreground)]">{assessment.field}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">{assessment.title}</h3>
          <p className="mt-2 line-clamp-6 text-sm leading-6 text-[var(--dashboard-muted)]">{assessment.description}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${difficultyTone}`}>{assessment.difficulty}</span>
      </div>

      <div className="mt-auto pt-5">
        <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-[var(--dashboard-icon-surface)] px-3 py-1 text-xs font-medium text-[var(--dashboard-text)]">{assessment.duration}</span>
        <span className="rounded-full bg-[var(--dashboard-icon-surface)] px-3 py-1 text-xs font-medium text-[var(--dashboard-text)]">{assessment.questions} questions</span>
        </div>

        <Link
          href={assessment.href}
          className="dashboard-dark-button mt-6 inline-flex w-fit rounded-2xl px-5 py-3 text-sm font-semibold transition"
        >
          Start Assessment
        </Link>
      </div>
    </motion.div>
  );
}
