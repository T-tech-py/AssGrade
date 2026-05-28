'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { QuickAction } from '@/data/student-dashboard';
import { MaterialIcon } from './icons';

export function QuickActionCard({ action }: { action: QuickAction }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="dashboard-panel rounded-[1.5rem] p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)]">
        <MaterialIcon name={action.icon} className="h-[18px] w-[18px]" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-[var(--dashboard-text)]">{action.label}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{action.description}</p>
      <Link href={action.href} className="mt-4 inline-flex text-sm font-semibold text-[var(--dashboard-accent-foreground)] transition hover:opacity-80">
        Open
      </Link>
    </motion.div>
  );
}
