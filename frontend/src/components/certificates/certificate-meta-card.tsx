import type { StudentCertificate } from '@/data/certificates-data';

export function CertificateMetaCard({ certificate }: { certificate: StudentCertificate }) {
  const items = [
    ['Issued by', certificate.organization],
    ['Assessment date', certificate.assessmentDate],
    ['Issued on', certificate.issuedAt],
    ['Expires', certificate.expires],
    ['Verification ID', certificate.verificationId],
    ['Readiness level', certificate.readinessLevel],
  ];

  return (
    <div className="dashboard-panel rounded-[1.8rem] p-5">
      <p className="text-sm font-semibold text-[var(--dashboard-text)]">Certificate metadata</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="dashboard-soft-tile rounded-[1.15rem] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">{label}</p>
            <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
