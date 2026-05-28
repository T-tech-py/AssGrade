'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { CareerInsight } from '@/data/student-dashboard';
import { ArrowUpRightIcon } from './icons';

export function CareerCard({ career }: { career: CareerInsight }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="dashboard-panel rounded-[1.7rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">Career match</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">{career.title}</h3>
        </div>
        <div className="rounded-2xl bg-[var(--dashboard-accent-soft)] px-3 py-2 text-right">
          <p className="text-lg font-semibold text-[var(--dashboard-accent-foreground)]">{career.match}%</p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--dashboard-muted)]">Match</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-[var(--dashboard-muted)]">{career.summary}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {career.skills.map((skill) => (
          <span key={skill} className="rounded-full bg-[var(--dashboard-icon-surface)] px-3 py-1 text-xs font-medium text-[var(--dashboard-text)]">
            {skill}
          </span>
        ))}
      </div>

      <Link href={career.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--dashboard-accent-foreground)] transition hover:opacity-80">
        Explore Career Path
        <ArrowUpRightIcon className="h-4 w-4" />
      </Link>
    </motion.div>
  );
}
