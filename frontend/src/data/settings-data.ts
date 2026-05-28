export const settingsProfile = {
  fullName: 'Tobi Adebayo',
  email: 'tobi.adebayo@example.com',
  phone: '+234 801 234 5678',
  school: 'University of Lagos',
  course: 'Computer Science',
  level: 'Final Year',
  location: 'Lagos, Nigeria',
  bio: 'Focused on frontend engineering, product execution, and building a stronger graduate employability profile.',
};

export const settingsPreferences = {
  theme: 'Match app theme',
  dashboardDensity: 'Comfortable',
  reminderWindow: '24 hours before an assessment',
  studyGoal: 'Improve frontend problem solving and communication structure',
};

export const settingsNotificationOptions = [
  {
    id: 'assessment-reminders',
    label: 'Assessment reminders',
    description: 'Get notified before upcoming assessments and expiring sessions.',
    enabled: true,
  },
  {
    id: 'practice-nudges',
    label: 'Practice nudges',
    description: 'Receive short reminders to continue AI-guided practice during the week.',
    enabled: true,
  },
  {
    id: 'result-alerts',
    label: 'Result alerts',
    description: 'Get notified when a new result, certificate, or readiness signal becomes available.',
    enabled: true,
  },
  {
    id: 'career-insights',
    label: 'Career insight updates',
    description: 'Get notified when role matches or readiness guidance are refreshed.',
    enabled: false,
  },
];

export const settingsSecurityItems = [
  {
    label: 'Password',
    value: 'Last updated 21 days ago',
    action: 'Change password',
  },
  {
    label: 'Two-step verification',
    value: 'Not enabled yet',
    action: 'Enable 2FA',
  },
  {
    label: 'Active sessions',
    value: '2 devices signed in',
    action: 'Review sessions',
  },
];

export const settingsPrivacyItems = [
  {
    label: 'Profile visibility',
    value: 'Visible to you only',
  },
  {
    label: 'Certificate sharing',
    value: 'Only shared when you explicitly open a verification link',
  },
  {
    label: 'Assessment monitoring records',
    value: 'Retained according to platform integrity policy',
  },
];
