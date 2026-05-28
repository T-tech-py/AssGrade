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

export function BrainIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M9 5.2a3.2 3.2 0 0 0-2.8 5 3.1 3.1 0 0 0-.2 5.9A3.4 3.4 0 0 0 9.2 19H11v-7.3a2.7 2.7 0 0 0-2.7-2.7H7.2" {...shared} />
      <path d="M15 5.2a3.2 3.2 0 0 1 2.8 5 3.1 3.1 0 0 1 .2 5.9A3.4 3.4 0 0 1 14.8 19H13v-7.3a2.7 2.7 0 0 1 2.7-2.7h1.1" {...shared} />
      <path d="M11 8.8c0-1.7 1.3-3 3-3M13 8.8c0-1.7-1.3-3-3-3M11 15.2c0 1.7-1.3 3-3 3M13 15.2c0 1.7 1.3 3 3 3" {...shared} />
    </svg>
  );
}

export function BookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4H19v14.5A1.5 1.5 0 0 1 17.5 20H7.5A2.5 2.5 0 0 0 5 22V6.5Z" {...shared} />
      <path d="M7.5 4A2.5 2.5 0 0 0 5 6.5v11A2.5 2.5 0 0 1 7.5 15H19" {...shared} />
    </svg>
  );
}

export function SparklesIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Z" fill="currentColor" />
      <path d="m18.5 14 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" fill="currentColor" />
      <path d="m5.5 15 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z" fill="currentColor" />
    </svg>
  );
}

export function TargetIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="7.5" {...shared} />
      <circle cx="12" cy="12" r="3.5" {...shared} />
      <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21" {...shared} />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" {...shared} />
    </svg>
  );
}

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8" {...shared} />
      <path d="m8.5 12 2.3 2.3 4.7-5" {...shared} />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8" {...shared} />
      <path d="M12 7.5v5l3 1.7" {...shared} />
    </svg>
  );
}

export function CodeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" {...shared} />
    </svg>
  );
}

export function MessageIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M6 17.5 4 20V6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H9l-3 1.5Z" {...shared} />
    </svg>
  );
}

export function BookmarkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3-6 3V5a1 1 0 0 1 1-1Z" {...shared} />
    </svg>
  );
}

export function RefreshIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M20 11a7.5 7.5 0 1 0-2.2 5.3" {...shared} />
      <path d="M20 5v6h-6" {...shared} />
    </svg>
  );
}
