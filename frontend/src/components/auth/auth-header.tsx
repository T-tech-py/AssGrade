type AuthHeaderProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
};

export function AuthHeader({ title, subtitle, eyebrow }: AuthHeaderProps) {
  return (
    <div className="space-y-4">
      {eyebrow ? (
        <p className="inline-flex rounded-full border border-[var(--auth-chip-border)] bg-[var(--auth-chip-bg)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--dashboard-accent-foreground)]">
          {eyebrow}
        </p>
      ) : null}
      <div className="space-y-2.5">
        <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-[var(--auth-text)] sm:text-[2.35rem] sm:leading-[1.05]">
          {title}
        </h2>
        <p className="max-w-2xl text-[0.97rem] leading-7 text-[var(--auth-muted-text)] sm:text-[1.02rem]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
