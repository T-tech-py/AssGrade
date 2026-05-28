type CertificateOverviewCardProps = {
  title: string;
  value: string;
  helper: string;
};

export function CertificateOverviewCard({
  title,
  value,
  helper,
}: CertificateOverviewCardProps) {
  return (
    <div className="dashboard-panel rounded-[1.7rem] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">{title}</p>
      <p className="mt-3 text-[1.8rem] font-semibold tracking-[-0.05em] text-[var(--dashboard-text)]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{helper}</p>
    </div>
  );
}
