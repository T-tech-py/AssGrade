import { profileVisibilityOptions, type SettingsPrivacy } from './settings-types';
import { SettingsToggleCard } from './settings-toggle-card';

type SettingsPrivacyCardProps = {
  privacy: SettingsPrivacy;
  isDirty: boolean;
  isSaving: boolean;
  onChange: <K extends keyof SettingsPrivacy>(field: K, value: SettingsPrivacy[K]) => void;
  onSave: () => Promise<void>;
  title?: string;
  description?: string;
  certificateSharingTitle?: string;
  certificateSharingDescription?: string;
  monitoringTitle?: string;
};

export function SettingsPrivacyCard({
  privacy,
  isDirty,
  isSaving,
  onChange,
  onSave,
  title = 'Privacy and data',
  description = 'Control who can view your readiness profile and whether certificates can be shared from your account.',
  certificateSharingTitle = 'Certificate sharing',
  certificateSharingDescription = 'Allow your certificate verification page to be intentionally shared when you open a verification link.',
  monitoringTitle = 'Assessment monitoring records',
}: SettingsPrivacyCardProps) {
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

      <div className="mt-5 space-y-4">
        <div>
          <p className="text-sm font-semibold text-[var(--dashboard-text)]">Profile visibility</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {profileVisibilityOptions.map((option) => {
              const active = privacy.profileVisibility === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange('profileVisibility', option.value)}
                  className={`rounded-[1.2rem] border px-4 py-4 text-left transition ${
                    active
                      ? 'border-[var(--dashboard-accent-foreground)] bg-[var(--dashboard-accent-soft)]'
                      : 'border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)]'
                  }`}
                >
                  <p className="text-sm font-semibold text-[var(--dashboard-text)]">{option.label}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{option.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <SettingsToggleCard
          title={certificateSharingTitle}
          description={certificateSharingDescription}
          enabled={privacy.certificateSharingEnabled}
          onChange={(nextValue) => onChange('certificateSharingEnabled', nextValue)}
        />

        <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
          <p className="text-sm font-semibold text-[var(--dashboard-text)]">{monitoringTitle}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{privacy.monitoringPolicy}</p>
        </div>
      </div>
    </div>
  );
}
