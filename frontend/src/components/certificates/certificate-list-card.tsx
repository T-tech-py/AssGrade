import Link from 'next/link';
import type { StudentCertificate } from '@/data/certificates-data';
import { ArrowUpRightIcon } from '@/components/dashboard/icons';
import { CertificateStatusBadge } from './certificate-status-badge';

export function CertificateListCard({ certificate }: { certificate: StudentCertificate }) {
  return (
    <div className="dashboard-panel flex h-full flex-col rounded-[1.8rem] p-5 transition hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-accent-foreground)]">
            Certificate
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[var(--dashboard-text)]">
            {certificate.title}
          </h3>
          <p className="mt-1 text-sm text-[var(--dashboard-muted)]">{certificate.field}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-[var(--dashboard-text)]">{certificate.grade}</p>
          <p className="text-sm text-[var(--dashboard-muted)]">{certificate.score}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <CertificateStatusBadge status={certificate.status} />
        <span className="dashboard-soft-tile rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--dashboard-text)]">
          {certificate.readinessLevel}
        </span>
      </div>

      <p className="mt-4 min-h-[4.5rem] text-sm leading-6 text-[var(--dashboard-muted)]">{certificate.summary}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">Issued</p>
          <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{certificate.issuedAt}</p>
        </div>
        <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">Verification</p>
          <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{certificate.verificationId}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {certificate.skillSignals.map((item) => (
          <span
            key={item}
            className="rounded-full bg-[var(--dashboard-soft-tile-bg)] px-3 py-1 text-xs font-semibold text-[var(--dashboard-muted)]"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-5">
        <Link
          href={certificate.href}
          className="dashboard-dark-button inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition"
        >
          View Certificate
          <ArrowUpRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
