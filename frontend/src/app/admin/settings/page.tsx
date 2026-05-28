'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { AdminLayout } from '@/components/admin/admin-layout';
import { emitAppToast } from '@/components/ui/app-toast';
import {
  SettingsActiveSessionsModal,
} from '@/components/settings/settings-active-sessions-modal';
import { SettingsChangePasswordModal } from '@/components/settings/settings-change-password-modal';
import { SettingsComingSoonModal } from '@/components/settings/settings-coming-soon-modal';
import { SettingsNotificationsPanel } from '@/components/settings/settings-notifications-panel';
import { SettingsPreferencesCard } from '@/components/settings/settings-preferences-card';
import { SettingsPrivacyCard } from '@/components/settings/settings-privacy-card';
import { SettingsProfileCard } from '@/components/settings/settings-profile-card';
import { SettingsSecurityCard } from '@/components/settings/settings-security-card';
import type {
  ActiveSession,
  SettingsNotifications,
  SettingsPreferences,
  SettingsPrivacy,
  SettingsProfile,
  StudentSettingsPayload,
  ThemePreference,
} from '@/components/settings/settings-types';
import { getStoredAuthSession } from '@/lib/auth-session';
import {
  changePasswordRequest,
  getActiveSessionsRequest,
  getSettingsRequest,
  revokeOtherSessionsRequest,
  revokeSessionRequest,
  updateNotificationsRequest,
  updatePreferencesRequest,
  updatePrivacyRequest,
  updateProfileRequest,
} from '@/lib/settings-api';

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' ') || 'Admin',
  };
}

function isEqual<T>(left: T, right: T) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function applyThemePreference(themePreference: ThemePreference) {
  if (typeof document === 'undefined') return;

  if (themePreference === 'SYSTEM') {
    window.localStorage.removeItem('gradassess-theme');
    const preferredDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = preferredDark ? 'dark' : 'light';
    return;
  }

  const nextTheme = themePreference === 'DARK' ? 'dark' : 'light';
  window.localStorage.setItem('gradassess-theme', nextTheme);
  document.documentElement.dataset.theme = nextTheme;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { session, user, refreshProfile, isLoading: isAuthLoading } = useAuth();
  const [settings, setSettings] = useState<StudentSettingsPayload | null>(null);
  const [profile, setProfile] = useState<SettingsProfile | null>(null);
  const [preferences, setPreferences] = useState<SettingsPreferences | null>(null);
  const [notifications, setNotifications] = useState<SettingsNotifications | null>(null);
  const [privacy, setPrivacy] = useState<SettingsPrivacy | null>(null);
  const [securityPasswordUpdatedAt, setSecurityPasswordUpdatedAt] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | undefined>();
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isTwoFactorOpen, setIsTwoFactorOpen] = useState(false);
  const [isRevokingSessions, setIsRevokingSessions] = useState(false);

  const loadSettings = async () => {
    setIsPageLoading(true);
    setPageError(undefined);
    setIsSessionsLoading(true);

    try {
      const [payload, nextSessions] = await Promise.all([
        getSettingsRequest(),
        getActiveSessionsRequest().catch(() => [] as ActiveSession[]),
      ]);

      setSettings(payload);
      setProfile(payload.profile);
      setPreferences(payload.preferences);
      setNotifications(payload.notifications);
      setPrivacy(payload.privacy);
      setSecurityPasswordUpdatedAt(payload.security.passwordUpdatedAt);
      setSessions(nextSessions);
      applyThemePreference(payload.preferences.themePreference);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to load admin settings right now.');
    } finally {
      setIsPageLoading(false);
      setIsSessionsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      void loadSettings();
    }
  }, [isAuthLoading]);

  const anyDirty = useMemo(() => {
    if (!settings || !profile || !preferences || !notifications || !privacy) return false;

    return (
      !isEqual(settings.profile, profile) ||
      !isEqual(settings.preferences, preferences) ||
      !isEqual(settings.notifications, notifications) ||
      !isEqual(settings.privacy, privacy)
    );
  }, [settings, profile, preferences, notifications, privacy]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!anyDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [anyDirty]);

  const profileDirty = Boolean(settings && profile && !isEqual(settings.profile, profile));
  const preferencesDirty = Boolean(settings && preferences && !isEqual(settings.preferences, preferences));
  const notificationsDirty = Boolean(settings && notifications && !isEqual(settings.notifications, notifications));
  const privacyDirty = Boolean(settings && privacy && !isEqual(settings.privacy, privacy));

  const saveProfile = async () => {
    if (!profile) return;
    setSavingSection('profile');

    try {
      const { firstName, lastName } = splitFullName(profile.fullName);
      const payload = await updateProfileRequest({
        firstName,
        lastName,
        phone: profile.phone,
        school: profile.school,
        course: profile.course,
        level: profile.level,
        location: profile.location,
        bio: profile.bio,
      });

      setSettings(payload);
      setProfile(payload.profile);
      await refreshProfile();
      emitAppToast({
        title: 'Admin profile updated',
        description: 'Your operational profile details have been saved.',
        tone: 'success',
      });
    } catch (error) {
      emitAppToast({
        title: 'Profile update failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setSavingSection(null);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;
    setSavingSection('preferences');

    try {
      const payload = await updatePreferencesRequest(preferences);
      setSettings(payload);
      setPreferences(payload.preferences);
      applyThemePreference(payload.preferences.themePreference);
      emitAppToast({
        title: 'Admin preferences updated',
        description: 'Your workspace defaults have been saved.',
        tone: 'success',
      });
    } catch (error) {
      emitAppToast({
        title: 'Preferences update failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setSavingSection(null);
    }
  };

  const saveNotifications = async () => {
    if (!notifications) return;
    setSavingSection('notifications');

    try {
      const payload = await updateNotificationsRequest(notifications);
      setSettings(payload);
      setNotifications(payload.notifications);
      emitAppToast({
        title: 'Notification routing updated',
        description: 'Your admin alert preferences are now saved.',
        tone: 'success',
      });
    } catch (error) {
      emitAppToast({
        title: 'Notification update failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setSavingSection(null);
    }
  };

  const savePrivacy = async () => {
    if (!privacy) return;
    setSavingSection('privacy');

    try {
      const payload = await updatePrivacyRequest({
        profileVisibility: privacy.profileVisibility,
        certificateSharingEnabled: privacy.certificateSharingEnabled,
      });
      setSettings(payload);
      setPrivacy(payload.privacy);
      emitAppToast({
        title: 'Privacy controls updated',
        description: 'Your admin visibility and certificate sharing controls have been saved.',
        tone: 'success',
      });
    } catch (error) {
      emitAppToast({
        title: 'Privacy update failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setSavingSection(null);
    }
  };

  const openSessions = async () => {
    setIsSessionsOpen(true);
    setIsSessionsLoading(true);

    try {
      const nextSessions = await getActiveSessionsRequest();
      setSessions(nextSessions);
    } catch (error) {
      emitAppToast({
        title: 'Unable to load sessions',
        description: error instanceof Error ? error.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setIsSessionsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setIsRevokingSessions(true);

    try {
      await revokeSessionRequest(sessionId);
      const nextSessions = await getActiveSessionsRequest();
      setSessions(nextSessions);
      emitAppToast({
        title: 'Session revoked',
        description: 'The selected admin device has been signed out.',
        tone: 'success',
      });
    } catch (error) {
      emitAppToast({
        title: 'Unable to revoke session',
        description: error instanceof Error ? error.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setIsRevokingSessions(false);
    }
  };

  const handleRevokeOthers = async () => {
    const currentSession = getStoredAuthSession();
    if (!currentSession) return;

    setIsRevokingSessions(true);

    try {
      await revokeOtherSessionsRequest(currentSession.refreshToken);
      const nextSessions = await getActiveSessionsRequest();
      setSessions(nextSessions);
      emitAppToast({
        title: 'Other admin devices signed out',
        description: 'All other active sessions have been revoked.',
        tone: 'success',
      });
    } catch (error) {
      emitAppToast({
        title: 'Unable to sign out other devices',
        description: error instanceof Error ? error.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setIsRevokingSessions(false);
    }
  };

  const handleChangePassword = async (payload: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const currentSession = getStoredAuthSession();
    if (!currentSession) return;

    setSavingSection('password');

    try {
      await changePasswordRequest({
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
        currentRefreshToken: currentSession.refreshToken,
      });
      setSecurityPasswordUpdatedAt(new Date().toISOString());
      setIsPasswordOpen(false);
      emitAppToast({
        title: 'Password updated',
        description: 'Other signed-in admin devices have been logged out.',
        tone: 'success',
      });
    } catch (error) {
      emitAppToast({
        title: 'Password update failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        tone: 'error',
      });
      throw error;
    } finally {
      setSavingSection(null);
    }
  };

  const activeSessionCount = sessions.length;

  const adminNotificationItems: Array<{
    key: keyof SettingsNotifications;
    title: string;
    description: string;
  }> = [
    {
      key: 'assessmentReminders',
      title: 'Assessment operation alerts',
      description: 'Get notified before publishing windows, schedule changes, and expiring assessment sessions.',
    },
    {
      key: 'practiceNudges',
      title: 'AI generation updates',
      description: 'Receive updates when AI-assisted question generation and review jobs complete.',
    },
    {
      key: 'resultAlerts',
      title: 'Results and certificate alerts',
      description: 'Get notified when results need review or certificate records require action.',
    },
    {
      key: 'careerInsights',
      title: 'Security escalation alerts',
      description: 'Receive alerts when suspicious attempts or high-risk sessions need investigation.',
    },
  ];

  if (!session && !isAuthLoading) {
    return (
      <AdminLayout
        title="Admin Settings"
        subtitle="Manage your profile, notification routing, workspace defaults, and account security."
      >
        <div className="dashboard-panel rounded-[1.8rem] p-6">
          <p className="text-sm font-semibold text-[var(--dashboard-text)]">Sign in required</p>
          <p className="mt-3 text-sm leading-7 text-[var(--dashboard-muted)]">
            Your admin session has ended. Please sign in again to continue managing your settings.
          </p>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="dashboard-lime-panel mt-5 rounded-2xl px-4 py-3 text-sm font-semibold text-[#223200]"
          >
            Go to login
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthLoading && user?.role !== 'ADMIN') {
    return (
      <AdminLayout
        title="Admin Settings"
        subtitle="Manage your profile, notification routing, workspace defaults, and account security."
      >
        <div className="dashboard-panel rounded-[1.8rem] p-6">
          <p className="text-sm font-semibold text-[var(--dashboard-text)]">Admin access only</p>
          <p className="mt-3 text-sm leading-7 text-[var(--dashboard-muted)]">
            This workspace is reserved for administrator accounts. Sign in with an admin account to continue.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Admin Settings"
      subtitle="Manage your admin identity, alert routing, workspace defaults, and account security."
    >
      {anyDirty ? (
        <div className="dashboard-soft-tile rounded-[1.4rem] border border-[var(--dashboard-accent-foreground)] px-4 py-3 text-sm text-[var(--dashboard-text)]">
          You have unsaved changes in this admin workspace.
        </div>
      ) : null}

      {pageError ? (
        <div className="rounded-[1.4rem] border border-rose-400/35 bg-rose-50/80 px-4 py-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
          {pageError}
        </div>
      ) : null}

      {isPageLoading || !profile || !preferences || !notifications || !privacy ? (
        <div className="dashboard-panel rounded-[1.8rem] p-6 text-sm text-[var(--dashboard-muted)]">
          Loading admin settings...
        </div>
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
            <SettingsProfileCard
              profile={profile}
              isDirty={profileDirty}
              isSaving={savingSection === 'profile'}
              eyebrow="Admin identity"
              description="Keep your admin contact details and workspace assignment current so operations, audits, and support escalations stay traceable."
              emailHelperText="Email changes stay behind the auth layer for now so admin identity remains tightly controlled."
              onChange={(field, value) => setProfile((current) => (current ? { ...current, [field]: value } : current))}
              onSave={saveProfile}
            />

            <div className="grid gap-4">
              <SettingsPreferencesCard
                preferences={preferences}
                isDirty={preferencesDirty}
                isSaving={savingSection === 'preferences'}
                title="Workspace preferences"
                description="Choose how your admin workspace feels and how early platform reminders should reach you."
                studyGoalLabel="Current operations focus"
                studyGoalPlaceholder="Describe the operational goal you want this workspace to support next."
                onChange={(field, value) =>
                  setPreferences((current) => (current ? { ...current, [field]: value } : current))
                }
                onSave={savePreferences}
              />

              <div className="dashboard-panel rounded-[1.8rem] p-5">
                <p className="text-sm font-semibold text-[var(--dashboard-text)]">Operational guidance</p>
                <div className="mt-4 space-y-3">
                  <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-[var(--dashboard-muted)]">
                    Save each section explicitly so changes to admin identity, alert routing, and workspace defaults are deliberate and auditable.
                  </div>
                  <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-[var(--dashboard-muted)]">
                    Keep your profile details current so certificates, incident notes, and operational follow-ups always point to the right administrator.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <SettingsNotificationsPanel
            notifications={notifications}
            isDirty={notificationsDirty}
            isSaving={savingSection === 'notifications'}
            eyebrow="Alert routing"
            title="Control which operational updates reach you"
            description="Choose which platform events, certificate actions, AI jobs, and security escalations should interrupt your day."
            items={adminNotificationItems}
            onChange={(field, value) =>
              setNotifications((current) => (current ? { ...current, [field]: value } : current))
            }
            onSave={saveNotifications}
          />

          <section className="grid gap-4 xl:grid-cols-2">
            <SettingsSecurityCard
              title="Account security"
              passwordUpdatedAt={securityPasswordUpdatedAt}
              sessionCount={activeSessionCount}
              isSessionsLoading={isSessionsLoading}
              onOpenPassword={() => setIsPasswordOpen(true)}
              onOpenSessions={() => {
                void openSessions();
              }}
              onOpenTwoFactor={() => setIsTwoFactorOpen(true)}
            />
            <SettingsPrivacyCard
              privacy={privacy}
              isDirty={privacyDirty}
              isSaving={savingSection === 'privacy'}
              title="Privacy and governance"
              description="Control how your admin profile appears internally and whether certificate links can be intentionally shared during verification workflows."
              certificateSharingTitle="Verification link sharing"
              certificateSharingDescription="Allow certificate verification pages to be intentionally shared during support, audit, or institution review workflows."
              monitoringTitle="Monitoring and audit records"
              onChange={(field, value) => setPrivacy((current) => (current ? { ...current, [field]: value } : current))}
              onSave={savePrivacy}
            />
          </section>
        </>
      )}

      <SettingsChangePasswordModal
        open={isPasswordOpen}
        onClose={() => setIsPasswordOpen(false)}
        onSubmit={handleChangePassword}
        isSaving={savingSection === 'password'}
      />

      <SettingsActiveSessionsModal
        open={isSessionsOpen}
        onClose={() => setIsSessionsOpen(false)}
        sessions={sessions}
        isLoading={isSessionsLoading}
        isRevoking={isRevokingSessions}
        onRevoke={handleRevokeSession}
        onRevokeOthers={handleRevokeOthers}
      />

      <SettingsComingSoonModal open={isTwoFactorOpen} onClose={() => setIsTwoFactorOpen(false)} />
    </AdminLayout>
  );
}
