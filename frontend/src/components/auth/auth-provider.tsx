'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ApiRequestError,
  type AuthApiUser,
  getProfileRequest,
  logoutRequest,
  refreshSessionRequest,
} from '@/lib/auth-api';
import {
  authSessionEventName,
  clearStoredAuthSession,
  getStoredAuthSession,
  type StoredAuthSession,
  updateStoredAuthSession,
  updateStoredAuthUser,
} from '@/lib/auth-session';
import { queueAppToast } from '@/components/ui/app-toast';

type AuthContextValue = {
  user: AuthApiUser | null;
  session: StoredAuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function getSessionUserName(user: AuthApiUser | null) {
  if (!user) return '';
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  if (fullName) return toTitleCase(fullName);
  return toTitleCase((user.email.split('@')[0] ?? '').replace(/[._-]+/g, ' '));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<StoredAuthSession | null>(null);
  const [user, setUser] = useState<AuthApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    const currentSession = getStoredAuthSession();
    if (!currentSession) {
      setSession(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    setSession(currentSession);
    setUser(currentSession.user);

    if (currentSession.refreshToken === 'dev-bypass-refresh-token') {
      setIsLoading(false);
      return;
    }

    try {
      const profile = await getProfileRequest(currentSession.accessToken);
      const nextUser: AuthApiUser = {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        firstName: profile.firstName,
        lastName: profile.lastName,
        school: profile.school ?? undefined,
        course: profile.course ?? undefined,
      };

      const nextSession = updateStoredAuthUser(nextUser);
      setSession(nextSession ?? currentSession);
      setUser(nextUser);
    } catch (error) {
      const shouldRefresh =
        error instanceof ApiRequestError &&
        error.status === 401 &&
        currentSession.refreshToken &&
        currentSession.refreshToken !== 'dev-bypass-refresh-token';

      if (!shouldRefresh) {
        if (error instanceof ApiRequestError && error.status === 401) {
          clearStoredAuthSession();
          setSession(null);
          setUser(null);
        }
        setIsLoading(false);
        return;
      }

      try {
        const refreshed = await refreshSessionRequest(currentSession.refreshToken);
        const nextSession: StoredAuthSession = {
          ...refreshed,
          persist: currentSession.persist,
        };

        updateStoredAuthSession(nextSession);
        setSession(nextSession);
        setUser(nextSession.user);

        const profile = await getProfileRequest(nextSession.accessToken);
        const nextUser: AuthApiUser = {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          firstName: profile.firstName,
          lastName: profile.lastName,
          school: profile.school ?? undefined,
          course: profile.course ?? undefined,
        };

        updateStoredAuthUser(nextUser);
        setUser(nextUser);
      } catch {
        clearStoredAuthSession();
        setSession(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const currentSession = getStoredAuthSession();

    try {
      if (
        currentSession?.refreshToken &&
        currentSession.refreshToken !== 'dev-bypass-refresh-token'
      ) {
        await logoutRequest(currentSession.refreshToken);
      }
    } catch {
      // We still clear the local session even if the revoke call fails.
    }

    clearStoredAuthSession();
    setSession(null);
    setUser(null);
    queueAppToast({
      title: 'Logged out successfully',
      description: 'Your session has been cleared.',
      tone: 'success',
    });
    router.push('/login');
  };

  useEffect(() => {
    void refreshProfile();
  }, []);

  useEffect(() => {
    const handleSessionChange = () => {
      void refreshProfile();
    };

    window.addEventListener(authSessionEventName, handleSessionChange);
    return () => {
      window.removeEventListener(authSessionEventName, handleSessionChange);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: Boolean(session),
        refreshProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}

export function getDisplayName(user: AuthApiUser | null, fallback = 'Student') {
  return getSessionUserName(user) || toTitleCase(fallback);
}

export function getFirstName(user: AuthApiUser | null, fallback = 'Student') {
  if (user?.firstName) return toTitleCase(user.firstName);
  const name = getSessionUserName(user);
  return name.split(' ')[0] || toTitleCase(fallback);
}
