type IconProps = {
  className?: string;
};

const shared = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function ScoreIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M6 18h12M7 18V9.5M12 18V6M17 18v-4.5" {...shared} />
      <path d="M6 6.5 12 3l6 3.5" {...shared} />
    </svg>
  );
}

export function GrowthIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M4.5 17.5 10 12l3.2 3.2L19 9.5" {...shared} />
      <path d="M14.5 9.5H19V14" {...shared} />
    </svg>
  );
}

export function CertificateOutlineIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M7 4h10a2 2 0 0 1 2 2v7.2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" {...shared} />
      <path d="m10 15 2 2 2-2v5l-2-1.4L10 20v-5Z" {...shared} />
      <circle cx="12" cy="9.5" r="2.5" {...shared} />
    </svg>
  );
}

export function ReadinessIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="7.5" {...shared} />
      <path d="M12 12 16.5 8.5" {...shared} />
      <path d="M12 6.5v1.5M5.5 12H7M17 12h1.5M12 17v1.5" {...shared} />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M7 4.5V7M17 4.5V7M5 8h14M6.5 5.5h11A1.5 1.5 0 0 1 19 7v10.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 17.5V7a1.5 1.5 0 0 1 1.5-1.5Z" {...shared} />
    </svg>
  );
}

export function TimerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="13" r="6.5" {...shared} />
      <path d="M12 13V9.5M9.5 3.5h5M12 6.5v-3" {...shared} />
    </svg>
  );
}

export function InsightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M6 18c1.7-2.7 4-4.2 6-4.2s4.3 1.5 6 4.2" {...shared} />
      <circle cx="12" cy="9" r="3" {...shared} />
      <path d="M12 2.5v1.8M4 6l1.3 1.3M20 6l-1.3 1.3" {...shared} />
    </svg>
  );
}

export function TrendBarsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M5 18v-5M10 18V8M15 18v-3M20 18V6" {...shared} />
      <path d="M4 18h17" {...shared} />
    </svg>
  );
}
