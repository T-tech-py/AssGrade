import type { AuthApiResponse } from './auth-api';

const localStorageKey = 'gradassess-auth';
const sessionStorageKey = 'gradassess-auth-session';
const deviceIdKey = 'gradassess-device-id';
export const authSessionEventName = 'gradassess:auth-session-change';

export type PersistMode = 'local' | 'session';

export type StoredAuthSession = AuthApiResponse & {
  persist: PersistMode;
};

function getStorage(mode: PersistMode) {
  return mode === 'local' ? window.localStorage : window.sessionStorage;
}

function emitAuthSessionChange() {
  window.dispatchEvent(new CustomEvent(authSessionEventName));
}

function areSessionsEqual(a: StoredAuthSession, b: StoredAuthSession) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function persistAuthSession(auth: AuthApiResponse, persist: PersistMode) {
  window.localStorage.removeItem(localStorageKey);
  window.sessionStorage.removeItem(sessionStorageKey);

  const nextValue: StoredAuthSession = {
    ...auth,
    persist,
  };

  getStorage(persist).setItem(
    persist === 'local' ? localStorageKey : sessionStorageKey,
    JSON.stringify(nextValue),
  );
  emitAuthSessionChange();
}

export function updateStoredAuthSession(session: StoredAuthSession) {
  const currentSession = getStoredAuthSession();
  if (currentSession && areSessionsEqual(currentSession, session)) {
    return;
  }

  getStorage(session.persist).setItem(
    session.persist === 'local' ? localStorageKey : sessionStorageKey,
    JSON.stringify(session),
  );
  emitAuthSessionChange();
}

export function updateStoredAuthUser(user: AuthApiResponse['user']) {
  const session = getStoredAuthSession();
  if (!session) return null;

  const nextSession: StoredAuthSession = {
    ...session,
    user: {
      ...session.user,
      ...user,
    },
  };

  updateStoredAuthSession(nextSession);
  return nextSession;
}

export function getStoredAuthSession(): StoredAuthSession | null {
  const localValue = window.localStorage.getItem(localStorageKey);
  if (localValue) {
    return JSON.parse(localValue) as StoredAuthSession;
  }

  const sessionValue = window.sessionStorage.getItem(sessionStorageKey);
  if (sessionValue) {
    return JSON.parse(sessionValue) as StoredAuthSession;
  }

  return null;
}

export function getOrCreateDeviceId() {
  const existing = window.localStorage.getItem(deviceIdKey);
  if (existing) return existing;

  const nextId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `device-${Date.now()}`;

  window.localStorage.setItem(deviceIdKey, nextId);
  return nextId;
}

export function clearStoredAuthSession() {
  window.localStorage.removeItem(localStorageKey);
  window.sessionStorage.removeItem(sessionStorageKey);
  emitAuthSessionChange();
}
