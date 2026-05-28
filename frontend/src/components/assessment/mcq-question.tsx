type MCQQuestionProps = {
  options: { id: string; label: string; value?: string }[];
  value?: string;
  onChange: (value: string) => void;
};

export function MCQQuestion({ options, value, onChange }: MCQQuestionProps) {
  return (
    <div className="space-y-3">
      {options.map((option) => {
        const optionValue = option.value ?? option.id;
        const selected = value === optionValue;

        return (
          <label
            key={option.id}
            className={`flex cursor-pointer items-start gap-3 rounded-[1.3rem] border px-4 py-4 transition ${
              selected
                ? 'border-[var(--dashboard-accent-foreground)] bg-[var(--dashboard-accent-soft)]'
                : 'border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] hover:border-[var(--dashboard-accent-foreground)]/30'
            }`}
          >
            <input
              type="radio"
              name="mcq-answer"
              checked={selected}
              onChange={() => onChange(optionValue)}
              className="mt-1 h-4 w-4"
            />
            <span className="text-sm leading-6 text-[var(--dashboard-text)]">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
