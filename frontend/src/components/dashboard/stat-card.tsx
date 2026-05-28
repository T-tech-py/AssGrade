'use client';

import { motion } from 'framer-motion';
import type { SummaryStat } from '@/data/student-dashboard';
import { MaterialIcon, StatIcon } from './icons';

export function StatCard({ stat, index }: { stat: SummaryStat; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ y: -4 }}
      className="dashboard-panel rounded-[1.7rem] p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-sm font-medium text-[var(--dashboard-muted)]">{stat.title}</p>
          <div>
            <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">{stat.value}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--dashboard-muted)]">{stat.helper}</p>
          </div>
        </div>
        <StatIcon tone={stat.tone}>
          <MaterialIcon name={stat.icon} className="h-[18px] w-[18px]" />
        </StatIcon>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-[var(--dashboard-panel-border)] pt-4">
        <span className="rounded-full bg-[var(--dashboard-icon-surface)] px-3 py-1 text-xs font-semibold text-[var(--dashboard-text)]">
          {stat.trend}
        </span>
        <span className="text-xs uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">Overview</span>
      </div>
    </motion.div>
  );
}
