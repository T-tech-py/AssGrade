'use client';

import {
  ApiRequestError,
  refreshSessionRequest,
} from '@/lib/auth-api';
import {
  getOrCreateDeviceId,
  getStoredAuthSession,
  updateStoredAuthSession,
} from '@/lib/auth-session';
import type {
  ActiveSession,
  SettingsNotifications,
  SettingsPreferences,
  SettingsPrivacy,
  SettingsProfile,
  StudentSettingsPayload,
} from '@/components/settings/settings-types';

function getApiBaseUrl() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured.');
  }

  return apiBaseUrl;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const rawBody = await response.text();
  const parsedBody = rawBody ? JSON.parse(rawBody) : null;

  if (!response.ok) {
    const message = Array.isArray(parsedBody?.message)
      ? parsedBody.message[0]
      : parsedBody?.message;
    throw new ApiRequestError(message ?? 'Something went wrong. Please try again.', response.status);
  }

  return parsedBody as T;
}

async function authenticatedRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const currentSession = getStoredAuthSession();
  if (!currentSession) {
    throw new Error('No active session found.');
  }

  const makeRequest = async (accessToken: string) =>
    fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'x-device-id': getOrCreateDeviceId(),
        ...(init.headers ?? {}),
      },
    });

  let response = await makeRequest(currentSession.accessToken);

  if (response.status === 401 && currentSession.refreshToken !== 'dev-bypass-refresh-token') {
    const refreshed = await refreshSessionRequest(currentSession.refreshToken);
    const nextSession = {
      ...refreshed,
      persist: currentSession.persist,
    };

    updateStoredAuthSession(nextSession);
    response = await makeRequest(nextSession.accessToken);
  }

  return parseResponse<T>(response);
}

export function getSettingsRequest() {
  return authenticatedRequest<StudentSettingsPayload>('/settings/me', { method: 'GET' });
}

export function updateProfileRequest(payload: Omit<SettingsProfile, 'email' | 'fullName'>) {
  return authenticatedRequest<StudentSettingsPayload>('/settings/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function updatePreferencesRequest(payload: SettingsPreferences) {
  return authenticatedRequest<StudentSettingsPayload>('/settings/preferences', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function updateNotificationsRequest(payload: SettingsNotifications) {
  return authenticatedRequest<StudentSettingsPayload>('/settings/notifications', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function updatePrivacyRequest(payload: Pick<SettingsPrivacy, 'profileVisibility' | 'certificateSharingEnabled'>) {
  return authenticatedRequest<StudentSettingsPayload>('/settings/privacy', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function changePasswordRequest(payload: {
  currentPassword: string;
  newPassword: string;
  currentRefreshToken: string;
}) {
  return authenticatedRequest<{ message: string }>('/settings/change-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getActiveSessionsRequest() {
  return authenticatedRequest<ActiveSession[]>('/settings/sessions', {
    method: 'GET',
  });
}

export function revokeSessionRequest(sessionId: string) {
  return authenticatedRequest<{ success: boolean }>(`/settings/sessions/${sessionId}/revoke`, {
    method: 'POST',
  });
}

export function revokeOtherSessionsRequest(currentRefreshToken: string) {
  return authenticatedRequest<{ success: boolean; revokedCount: number }>('/settings/sessions/revoke-others', {
    method: 'POST',
    body: JSON.stringify({ currentRefreshToken }),
  });
}
