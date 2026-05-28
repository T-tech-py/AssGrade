import { CertificateStatusBadge } from './certificate-status-badge';
import type { StudentCertificate } from '@/data/certificates-data';

export function CertificateHero({ certificate }: { certificate: StudentCertificate }) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="dashboard-panel-strong rounded-[2rem] p-6 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">
          Certificate detail
        </p>
        <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--dashboard-text)] sm:text-[2.5rem]">
          {certificate.title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--dashboard-muted)] sm:text-base">
          {certificate.summary}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <CertificateStatusBadge status={certificate.status} />
          <span className="dashboard-soft-tile rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--dashboard-text)]">
            {certificate.field}
          </span>
          <span className="dashboard-soft-tile rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--dashboard-text)]">
            {certificate.readinessLevel}
          </span>
        </div>
      </div>

      <div className="dashboard-lime-panel rounded-[2rem] px-6 py-6 text-[#223200]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em]">Verification ready</p>
        <p className="mt-3 text-[2.4rem] font-semibold tracking-[-0.05em]">{certificate.verificationId}</p>
        <p className="mt-3 text-sm leading-6">
          {certificate.status === 'Issued'
            ? 'This certificate can be verified and shared with employers, schools, and training programs.'
            : certificate.eligibilityNote}
        </p>
      </div>
    </section>
  );
}
