'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type AuthCardProps = {
  children: ReactNode;
};

export function AuthCard({ children }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 110, damping: 18 }}
      className="auth-form-card rounded-[1.9rem] px-5 py-6 backdrop-blur sm:px-7 sm:py-8 lg:px-8 lg:py-9"
    >
      {children}
    </motion.div>
  );
}
