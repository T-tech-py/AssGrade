'use client';

import { motion } from 'framer-motion';

type AuthSubmitButtonProps = {
  label: string;
  loadingLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
};

export function AuthSubmitButton({
  label,
  loadingLabel = 'Please wait...',
  isLoading,
  disabled,
}: AuthSubmitButtonProps) {
  return (
    <motion.button
      type="submit"
      whileHover={disabled ? undefined : { y: -3, scale: 1.01 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      disabled={disabled || isLoading}
      className="auth-primary-button flex min-h-14 w-full items-center justify-center rounded-[1.2rem] px-5 py-3.5 text-[0.95rem] font-semibold transition hover:brightness-[1.04] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black/70 dark:border-white/35 dark:border-t-white" />
          {loadingLabel}
        </span>
      ) : (
        label
      )}
    </motion.button>
  );
}
