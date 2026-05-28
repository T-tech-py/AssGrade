'use client';

import { motion } from 'framer-motion';

type StepCardProps = {
  index: number;
  title: string;
  description?: string;
};

export function StepCard({ index, title, description }: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ y: -7, scale: 1.015, rotateX: 3 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      className="landing-card rounded-[1.75rem] p-5 sm:p-6"
    >
      <div className="flex items-start gap-4">
        <motion.div
          whileHover={{ scale: 1.08, rotate: -4 }}
          transition={{ type: 'spring', stiffness: 280, damping: 16 }}
          className="dashboard-lime-panel flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold text-[#223200]"
        >
          {index}
        </motion.div>
        <div>
          <p className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{title}</p>
          <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--muted)]">
            {description ?? 'Progress graduates one step closer to credible, job-ready outcomes.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
