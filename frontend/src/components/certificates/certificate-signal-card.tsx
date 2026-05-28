import type { StudentCertificate } from '@/data/certificates-data';

export function CertificateSignalCard({ certificate }: { certificate: StudentCertificate }) {
  return (
    <div className="dashboard-panel rounded-[1.8rem] p-5">
      <p className="text-sm font-semibold text-[var(--dashboard-text)]">Skill signals</p>
      <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{certificate.eligibilityNote}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {certificate.skillSignals.map((item) => (
          <span
            key={item}
            className="rounded-full bg-[var(--dashboard-soft-tile-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--dashboard-text)]"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
