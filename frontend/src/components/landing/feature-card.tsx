'use client';

import { motion } from 'framer-motion';
import {
  AssessmentIcon,
  CertificateIcon,
  DashboardIcon,
  PracticeIcon,
  ShieldIcon,
} from './icons';

const iconMap = {
  assessment: AssessmentIcon,
  shield: ShieldIcon,
  practice: PracticeIcon,
  dashboard: DashboardIcon,
  certificate: CertificateIcon,
};

type FeatureCardProps = {
  icon: keyof typeof iconMap;
  title: string;
  description: string;
};

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  const ResolvedIcon = iconMap[Icon];

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ y: -10, scale: 1.02, rotateX: 4, rotateY: -4 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      className="landing-card rounded-[1.75rem] p-5 sm:p-6"
    >
      <motion.div
        whileHover={{ rotate: [0, -6, 4, 0], scale: 1.06 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <ResolvedIcon />
      </motion.div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{description}</p>
    </motion.article>
  );
}
