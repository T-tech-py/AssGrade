'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Certificate } from '@/data/student-dashboard';

export function CertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="dashboard-panel rounded-[1.7rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">Certificate</p>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[var(--dashboard-text)]">{certificate.title}</h3>
        </div>
        <div className="rounded-2xl bg-[var(--dashboard-accent-soft)] px-3 py-2 text-center">
          <p className="text-lg font-semibold text-[var(--dashboard-accent-foreground)]">{certificate.grade}</p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--dashboard-muted)]">Grade</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-[var(--dashboard-icon-surface)] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-muted)]">Score</p>
          <p className="mt-1 text-base font-semibold text-[var(--dashboard-text)]">{certificate.score}</p>
        </div>
        <div className="rounded-2xl bg-[var(--dashboard-icon-surface)] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-muted)]">Issued</p>
          <p className="mt-1 text-base font-semibold text-[var(--dashboard-text)]">{certificate.issuedAt}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-muted)]">Verification ID</p>
        <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{certificate.verificationId}</p>
      </div>

      <Link href={certificate.href} className="dashboard-dark-button mt-5 inline-flex rounded-2xl px-4 py-3 text-sm font-semibold transition">
        View Certificate
      </Link>
    </motion.div>
  );
}
