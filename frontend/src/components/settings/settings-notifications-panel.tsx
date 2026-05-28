'use client';

import { SettingsToggleCard } from './settings-toggle-card';
import type { SettingsNotifications } from './settings-types';

type SettingsNotificationsPanelProps = {
  notifications: SettingsNotifications;
  isDirty: boolean;
  isSaving: boolean;
  onChange: <K extends keyof SettingsNotifications>(field: K, value: SettingsNotifications[K]) => void;
  onSave: () => Promise<void>;
  eyebrow?: string;
  title?: string;
  description?: string;
  items?: Array<{
    key: keyof SettingsNotifications;
    title: string;
    description: string;
  }>;
};

const notificationItems: Array<{
  key: keyof SettingsNotifications;
  title: string;
  description: string;
}> = [
  {
    key: 'assessmentReminders',
    title: 'Assessment reminders',
    description: 'Get notified before upcoming assessments and expiring sessions.',
  },
  {
    key: 'practiceNudges',
    title: 'Practice nudges',
    description: 'Receive short reminders to continue AI-guided practice during the week.',
  },
  {
    key: 'resultAlerts',
    title: 'Result alerts',
    description: 'Get notified when a new result, certificate, or readiness signal becomes available.',
  },
  {
    key: 'careerInsights',
    title: 'Career insight updates',
    description: 'Get notified when role matches or readiness guidance are refreshed.',
  },
];

export function SettingsNotificationsPanel({
  notifications,
  isDirty,
  isSaving,
  onChange,
  onSave,
  eyebrow = 'Notifications',
  title = 'Control what updates reach you',
  description = 'Choose which assessment, practice, result, and career insight notifications you want to receive.',
  items = notificationItems,
}: SettingsNotificationsPanelProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--dashboard-muted)]">
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

      <div className="grid gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <SettingsToggleCard
            key={item.key}
            title={item.title}
            description={item.description}
            enabled={notifications[item.key]}
            onChange={(nextValue) => onChange(item.key, nextValue)}
          />
        ))}
      </div>
    </section>
  );
}
