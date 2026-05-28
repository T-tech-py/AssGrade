import { FlagIcon } from './icons';

type BottomActionBarProps = {
  canGoPrevious: boolean;
  canGoNext: boolean;
  flagged: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  onToggleFlag: () => void;
};

export function BottomActionBar({
  canGoPrevious,
  canGoNext,
  flagged,
  onPrevious,
  onNext,
  onSave,
  onToggleFlag,
}: BottomActionBarProps) {
  return (
    <div className="dashboard-panel sticky bottom-3 z-20 rounded-[1.8rem] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="dashboard-dark-button rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
            className="dashboard-dark-button rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:opacity-40"
          >
            Next
          </button>
          <button
            type="button"
            onClick={onSave}
            className="dashboard-dark-button rounded-2xl px-4 py-3 text-sm font-semibold transition"
          >
            Save & Continue
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleFlag}
          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            flagged ? 'bg-[var(--dashboard-warm-soft)] text-[var(--dashboard-warm-foreground)]' : 'dashboard-dark-button'
          }`}
        >
          <FlagIcon className="h-4 w-4" />
          {flagged ? 'Flagged for Review' : 'Flag for Review'}
        </button>
      </div>
    </div>
  );
}
