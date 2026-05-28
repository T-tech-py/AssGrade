const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

export type AuthApiUser = {
  id: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  firstName?: string;
  lastName?: string;
  school?: string;
  course?: string;
};

export type AuthApiResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthApiUser;
};

export type AdminRegistrationPendingResponse = {
  requiresApproval: true;
  message: string;
};

type ApiErrorShape = {
  message?: string | string[];
};

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

function getApiBaseUrl() {
  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured.');
  }

  return apiBaseUrl;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  const rawBody = await response.text();
  const parsedBody = rawBody ? (JSON.parse(rawBody) as ApiErrorShape & T) : null;

  if (!response.ok) {
    const message = Array.isArray(parsedBody?.message)
      ? parsedBody?.message[0]
      : parsedBody?.message;
    throw new ApiRequestError(message ?? 'Something went wrong. Please try again.', response.status);
  }

  return (parsedBody ?? {}) as T;
}

export async function registerRequest(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'ADMIN';
}) {
  return request<AuthApiResponse | AdminRegistrationPendingResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginRequest(payload: {
  email: string;
  password: string;
  deviceId: string;
}) {
  return request<AuthApiResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getProfileRequest(accessToken: string) {
  return request<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'STUDENT' | 'ADMIN';
    school?: string | null;
    course?: string | null;
  }>('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function refreshSessionRequest(refreshToken: string) {
  return request<AuthApiResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export async function logoutRequest(refreshToken: string) {
  return request<{ success: boolean }>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export async function forgotPasswordRequest(email: string) {
  return request<{
    message: string;
    resetToken?: string;
    resetUrl?: string;
  }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPasswordRequest(payload: { token: string; password: string }) {
  return request<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
