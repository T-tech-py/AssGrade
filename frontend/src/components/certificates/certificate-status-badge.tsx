import type { CertificateStatus } from '@/data/certificates-data';

export function CertificateStatusBadge({ status }: { status: CertificateStatus }) {
  const tone =
    status === 'Issued'
      ? 'bg-[var(--dashboard-success-soft)] text-[var(--dashboard-success-foreground)]'
      : status === 'Pending'
        ? 'bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)]'
        : 'bg-[var(--dashboard-warm-soft)] text-[var(--dashboard-warm-foreground)]';

  return <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${tone}`}>{status}</span>;
}
