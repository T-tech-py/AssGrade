'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type MotionSectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function MotionSection({ children, className, id }: MotionSectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: 'spring', stiffness: 90, damping: 18, mass: 0.75 }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
