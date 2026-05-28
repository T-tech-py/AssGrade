type IconProps = {
  className?: string;
};

function BaseIcon({
  className,
  children,
}: IconProps & {
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)] ${className ?? ''}`}>
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
        {children}
      </svg>
    </div>
  );
}

export function AssessmentIcon() {
  return (
    <BaseIcon>
      <path d="M5 6.5h14M5 12h14M5 17.5h8" strokeLinecap="round" />
      <path d="M17 16.5l1.75 1.75L21 14" strokeLinecap="round" strokeLinejoin="round" />
    </BaseIcon>
  );
}

export function ShieldIcon() {
  return (
    <BaseIcon>
      <path d="M12 3l7 3v5c0 4.4-2.8 8.3-7 9.8C7.8 19.3 5 15.4 5 11V6l7-3z" strokeLinejoin="round" />
      <path d="M9.5 12.2l1.7 1.8 3.3-3.7" strokeLinecap="round" strokeLinejoin="round" />
    </BaseIcon>
  );
}

export function PracticeIcon() {
  return (
    <BaseIcon>
      <path d="M12 4.5c4.1 0 7.5 3.4 7.5 7.5S16.1 19.5 12 19.5 4.5 16.1 4.5 12 7.9 4.5 12 4.5z" />
      <path d="M12 8v4l2.8 1.8" strokeLinecap="round" strokeLinejoin="round" />
    </BaseIcon>
  );
}

export function DashboardIcon() {
  return (
    <BaseIcon>
      <path d="M5 13.5h4V19H5v-5.5zM10 5h4v14h-4V5zM15 10h4v9h-4v-9z" strokeLinejoin="round" />
    </BaseIcon>
  );
}

export function CertificateIcon() {
  return (
    <BaseIcon>
      <path d="M7 5h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z" strokeLinejoin="round" />
      <path d="M9 9.5h6M9 12.5h4" strokeLinecap="round" />
      <path d="M10 15.5l2 4 2-4" strokeLinecap="round" strokeLinejoin="round" />
    </BaseIcon>
  );
}
