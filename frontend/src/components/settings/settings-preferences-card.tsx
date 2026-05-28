import {
  dashboardDensityOptions,
  reminderWindowOptions,
  themePreferenceOptions,
  type SettingsPreferences,
} from './settings-types';

type SettingsPreferencesCardProps = {
  preferences: SettingsPreferences;
  isDirty: boolean;
  isSaving: boolean;
  onChange: <K extends keyof SettingsPreferences>(field: K, value: SettingsPreferences[K]) => void;
  onSave: () => Promise<void>;
  title?: string;
  description?: string;
  studyGoalLabel?: string;
  studyGoalPlaceholder?: string;
};

export function SettingsPreferencesCard({
  preferences,
  isDirty,
  isSaving,
  onChange,
  onSave,
  title = 'Preferences',
  description = 'Personalize how the dashboard feels and how early you want readiness reminders.',
  studyGoalLabel = 'Current study goal',
  studyGoalPlaceholder = 'Describe the employability skill you want to improve next.',
}: SettingsPreferencesCardProps) {
  return (
    <div className="dashboard-panel rounded-[1.8rem] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--dashboard-text)]">{title}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={!isDirty || isSaving}
          className="dashboard-lime-panel rounded-2xl px-4 py-3 text-sm font-semibold text-[#223200] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : isDirty ? 'Save changes' : 'Saved'}
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-[var(--dashboard-text)]">Theme preference</span>
          <select
            value={preferences.themePreference}
            onChange={(event) => onChange('themePreference', event.target.value as SettingsPreferences['themePreference'])}
            className="dashboard-soft-tile mt-2 w-full rounded-[1.15rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm font-semibold text-[var(--dashboard-text)] outline-none"
          >
            {themePreferenceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-[var(--dashboard-text)]">Dashboard density</span>
          <select
            value={preferences.dashboardDensity}
            onChange={(event) => onChange('dashboardDensity', event.target.value as SettingsPreferences['dashboardDensity'])}
            className="dashboard-soft-tile mt-2 w-full rounded-[1.15rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm font-semibold text-[var(--dashboard-text)] outline-none"
          >
            {dashboardDensityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-[var(--dashboard-text)]">Reminder window</span>
          <select
            value={preferences.reminderWindow}
            onChange={(event) => onChange('reminderWindow', event.target.value as SettingsPreferences['reminderWindow'])}
            className="dashboard-soft-tile mt-2 w-full rounded-[1.15rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm font-semibold text-[var(--dashboard-text)] outline-none"
          >
            {reminderWindowOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-[var(--dashboard-text)]">{studyGoalLabel}</span>
          <textarea
            value={preferences.studyGoal}
            onChange={(event) => onChange('studyGoal', event.target.value)}
            className="dashboard-soft-tile mt-2 min-h-[108px] w-full rounded-[1.15rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm leading-6 text-[var(--dashboard-text)] outline-none"
            placeholder={studyGoalPlaceholder}
          />
        </label>
      </div>
    </div>
  );
}
