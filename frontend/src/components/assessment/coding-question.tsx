import { CodeIcon } from './icons';

type CodingQuestionProps = {
  value?: string;
  onChange: (value: string) => void;
  language: string;
  starterCode: string;
  sampleInput: string;
  sampleOutput: string;
};

export function CodingQuestion({
  value,
  onChange,
  language,
  starterCode,
  sampleInput,
  sampleOutput,
}: CodingQuestionProps) {
  const content = value ?? starterCode;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--dashboard-icon-surface)] px-3 py-2 text-xs font-semibold text-[var(--dashboard-text)]">
          <CodeIcon className="h-4 w-4" />
          {language}
        </span>
        <button type="button" className="dashboard-dark-button inline-flex rounded-full px-4 py-2 text-xs font-semibold transition">
          Run Code
        </button>
      </div>

      <textarea
        value={content}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[18rem] w-full rounded-[1.5rem] border border-[var(--dashboard-panel-border)] bg-[rgba(10,15,12,0.92)] px-4 py-4 font-mono text-sm leading-7 text-[#e7f1e2] outline-none transition focus:border-[var(--dashboard-accent-foreground)]"
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-[1.4rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-muted)]">Sample input</p>
          <pre className="mt-3 overflow-auto text-sm text-[var(--dashboard-text)]">{sampleInput}</pre>
        </div>
        <div className="rounded-[1.4rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-muted)]">Sample output</p>
          <pre className="mt-3 overflow-auto text-sm text-[var(--dashboard-text)]">{sampleOutput}</pre>
        </div>
      </div>
    </div>
  );
}
