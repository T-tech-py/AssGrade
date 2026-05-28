type AssessmentLibraryOverviewProps = {
  total: number;
};

export function AssessmentLibraryOverview({ total }: AssessmentLibraryOverviewProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="dashboard-panel-strong rounded-[2rem] p-6 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--dashboard-accent-foreground)]">
          Assessment library
        </p>
        <h2 className="mt-3 max-w-2xl text-[2rem] font-semibold tracking-[-0.05em] text-[var(--dashboard-text)] sm:text-[2.5rem] sm:leading-[1.03]">
          Explore assessments that move you closer to job readiness
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--dashboard-muted)] sm:text-base">
          Choose a field-specific test, review the expected difficulty, and begin the next assessment when you’re ready.
        </p>
      </div>

      <div className="dashboard-lime-panel rounded-[2rem] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#375000]">Available now</p>
        <p className="mt-3 text-[2.2rem] font-semibold tracking-[-0.05em] text-[#203100]">{total}</p>
        <p className="mt-2 text-sm leading-6 text-[#3b4b18]">
          Active assessments across technology, law, and engineering tracks.
        </p>
      </div>
    </div>
  );
}
