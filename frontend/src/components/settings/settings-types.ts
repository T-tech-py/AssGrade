export type ThemePreference = 'SYSTEM' | 'LIGHT' | 'DARK';
export type DashboardDensity = 'COMFORTABLE' | 'COMPACT';
export type ReminderWindow = 'FOUR_HOURS' | 'TWELVE_HOURS' | 'TWENTY_FOUR_HOURS' | 'FORTY_EIGHT_HOURS';
export type ProfileVisibility = 'PRIVATE' | 'SHARED_WITH_INSTITUTIONS';

export type SettingsProfile = {
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  school: string;
  course: string;
  level: string;
  location: string;
  bio: string;
};

export type SettingsPreferences = {
  themePreference: ThemePreference;
  dashboardDensity: DashboardDensity;
  reminderWindow: ReminderWindow;
  studyGoal: string;
};

export type SettingsNotifications = {
  assessmentReminders: boolean;
  practiceNudges: boolean;
  resultAlerts: boolean;
  careerInsights: boolean;
};

export type SettingsPrivacy = {
  profileVisibility: ProfileVisibility;
  certificateSharingEnabled: boolean;
  monitoringPolicy: string;
};

export type SettingsSecurity = {
  passwordUpdatedAt: string;
  twoFactorEnabled: boolean;
};

export type StudentSettingsPayload = {
  profile: SettingsProfile;
  preferences: SettingsPreferences;
  notifications: SettingsNotifications;
  privacy: SettingsPrivacy;
  security: SettingsSecurity;
};

export type ActiveSession = {
  id: string;
  deviceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
};

export const themePreferenceOptions: Array<{ value: ThemePreference; label: string }> = [
  { value: 'SYSTEM', label: 'Match system' },
  { value: 'LIGHT', label: 'Light' },
  { value: 'DARK', label: 'Dark' },
];

export const dashboardDensityOptions: Array<{ value: DashboardDensity; label: string }> = [
  { value: 'COMFORTABLE', label: 'Comfortable' },
  { value: 'COMPACT', label: 'Compact' },
];

export const reminderWindowOptions: Array<{ value: ReminderWindow; label: string }> = [
  { value: 'FOUR_HOURS', label: '4 hours before' },
  { value: 'TWELVE_HOURS', label: '12 hours before' },
  { value: 'TWENTY_FOUR_HOURS', label: '24 hours before' },
  { value: 'FORTY_EIGHT_HOURS', label: '48 hours before' },
];

export const profileVisibilityOptions: Array<{ value: ProfileVisibility; label: string; description: string }> = [
  {
    value: 'PRIVATE',
    label: 'Private',
    description: 'Only you can view your profile details inside the platform.',
  },
  {
    value: 'SHARED_WITH_INSTITUTIONS',
    label: 'Shared with institutions',
    description: 'Allow institutions you engage with to view your readiness profile.',
  },
];
