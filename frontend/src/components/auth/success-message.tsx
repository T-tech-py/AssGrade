'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type SuccessMessageProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function SuccessMessage({ title, description, action }: SuccessMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 110, damping: 18 }}
      className="auth-muted-panel rounded-[1.75rem] p-5"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)]">
          ✓
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-lg font-semibold text-[var(--auth-text)]">{title}</p>
          <p className="text-sm leading-7 text-[var(--auth-muted-text)]">{description}</p>
          {action ? <div className="pt-2">{action}</div> : null}
        </div>
      </div>
    </motion.div>
  );
}
