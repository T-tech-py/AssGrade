'use client';

import { motion } from 'framer-motion';

export function SocialAuthButtons() {
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--line)]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[var(--card-base)] px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Or continue with
          </span>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {['Google', 'Microsoft'].map((provider) => (
          <motion.button
            key={provider}
            type="button"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="auth-input flex min-h-13 items-center justify-between rounded-[1.15rem] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition hover:-translate-y-0.5"
          >
            <span>Continue with {provider}</span>
            <span className="rounded-full bg-[var(--card-muted)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Demo
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
