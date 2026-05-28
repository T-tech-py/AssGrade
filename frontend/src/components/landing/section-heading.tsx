type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: 'left' | 'center';
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
}: SectionHeadingProps) {
  const alignment = align === 'left' ? 'text-left items-start' : 'text-center items-center';

  return (
    <div className={`flex flex-col gap-4 ${alignment}`}>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--dashboard-accent-foreground)]">
        {eyebrow}
      </p>
      <div className="max-w-3xl space-y-4">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h2>
        <p className="text-pretty text-base leading-8 text-[var(--muted)] sm:text-lg">
          {description}
        </p>
      </div>
    </div>
  );
}
