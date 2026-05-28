'use client';

import { ApiRequestError, refreshSessionRequest } from '@/lib/auth-api';
import {
  getOrCreateDeviceId,
  getStoredAuthSession,
  updateStoredAuthSession,
} from '@/lib/auth-session';
import type {
  AdminActivity,
  AdminAssessment,
  AdminMetric,
  AdminQuickAction,
  AdminUser,
  AttemptsPoint,
  CategoryStat,
  PassFailPoint,
} from '@/data/admin-dashboard';

type AdminOverviewResponse = {
  metrics: AdminMetric[];
  attemptsTrend: AttemptsPoint[];
  passFailDistribution: PassFailPoint[];
  topCategories: CategoryStat[];
  recentActivity: AdminActivity[];
  quickActions: AdminQuickAction[];
  meta: {
    totalAdmins: number;
    totalExams: number;
  };
};

export type CreateAdminExamPayload = {
  title: string;
  slug: string;
  description?: string;
  instructions?: string;
  mode: 'REAL' | 'PRACTICE';
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  durationInMinutes: number;
  passingMarks?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  fullscreenRequired?: boolean;
  webcamRequired?: boolean;
  tabSwitchLimit?: number;
  startAt?: string;
  endAt?: string;
  questions: Array<{
    type: 'MCQ' | 'THEORY' | 'CODING';
    prompt: string;
    explanation?: string;
    marks: number;
    orderIndex: number;
    difficulty?: string;
    metadata?: Record<string, unknown>;
    rubric?: Record<string, unknown>;
    correctAnswer?: unknown;
    options?: Array<{
      label: string;
      value: string;
      isCorrect?: boolean;
      orderIndex: number;
    }>;
  }>;
};

export type UpdateAdminExamPayload = CreateAdminExamPayload;

export type AdminUsersListResponse = {
  items: AdminUser[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    availableFields: string[];
  };
};

export type AdminAssessmentsListResponse = {
  items: AdminAssessment[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    availableFields: string[];
  };
};

export type AdminAttemptsListResponse = {
  items: Array<{
    id: string;
    student: string;
    assessment: string;
    score: string;
    grade: string;
    status: string;
    submittedAt: string;
    security: string;
    field: string;
  }>;
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    availableAssessments: string[];
    availableFields: string[];
  };
};

export type AdminAttemptDetailResponse = {
  id: string;
  student: string;
  studentEmail: string;
  studentSchool: string;
  assessment: string;
  score: string;
  grade: string;
  status: string;
  submittedAt: string;
  startedAt: string;
  duration: string;
  security: string;
  field: string;
  device: string;
  ipAddress: string;
  warningCount: number;
  readinessNote: string;
  summary: {
    mcqCorrect: string;
    theoryQuality: string;
    codingQuality: string;
  };
  answers: Array<{
    id: string;
    number: number;
    type: 'MCQ' | 'THEORY' | 'CODING';
    prompt: string;
    answer: string;
    status: 'Strong' | 'Needs Review' | 'Flagged';
    awardedMarks: string;
    note: string;
  }>;
  securityTimeline: Array<{
    time: string;
    title: string;
    note: string;
    severity: 'Low' | 'Medium' | 'High';
  }>;
};

export type AdminAssessmentDetailResponse = AdminAssessment & {
  instructions: string;
  createdById: string;
  slug?: string;
  mode?: 'REAL' | 'PRACTICE';
  totalMarks: number;
  passingMarks: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  fullscreenRequired: boolean;
  webcamRequired: boolean;
  tabSwitchLimit: number;
  metrics: {
    attempts: number;
    averageScore: string;
    passRate: string;
    totalMarks: string;
  };
  questions: Array<{
    id: string;
    type: 'MCQ' | 'THEORY' | 'CODING';
    difficulty: string;
    prompt: string;
    marks: number;
    explanation: string;
    language: string;
    correctAnswerText: string;
    source: 'Manual' | 'AI-generated';
    lastUpdated: string;
    optionCount: number;
    options: Array<{
      id: string;
      label: string;
      value: string;
      isCorrect: boolean;
    }>;
  }>;
  attempts: Array<{
    id: string;
    student: string;
    score: string;
    grade: string;
    status: string;
    submittedAt: string;
    security: string;
  }>;
};

export type AdminUserDetailResponse = AdminUser & {
  phone: string;
  school: string;
  location: string;
  bio: string;
  requestSubmittedAt: string | null;
  requestReviewedAt: string | null;
  stats: {
    certificatesEarned: number;
    averageScore: string;
  };
};

export type AdminCertificateListItem = {
  id: string;
  student: string;
  assessment: string;
  score: string;
  grade: string;
  verificationId: string;
  issuedAt: string;
  status: 'Issued' | 'Reissued';
  field: string;
  studentEmail: string;
};

export type AdminCertificatesListResponse = {
  items: AdminCertificateListItem[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    availableFields: string[];
  };
};

export type AdminCertificateDetailResponse = {
  id: string;
  student: string;
  studentEmail: string;
  studentSchool: string;
  assessment: string;
  field: string;
  score: string;
  grade: string;
  status: 'Issued' | 'Reissued';
  verificationId: string;
  verificationHash: string;
  issuedAt: string;
  issuedDate: string;
  attemptId: string;
  submittedAt: string;
  duration: string;
  totalMarks: string;
  scoreValue: string;
  preview: {
    studentName: string;
    assessmentTitle: string;
    issuedDate: string;
  };
  verificationUrl: string;
};

export type AdminAssessmentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type AdminSecurityAlertListItem = {
  id: string;
  student: string;
  assessment: string;
  violation: string;
  warningCount: number;
  risk: 'Low' | 'Medium' | 'High';
  detectedAt: string;
  status: 'Open' | 'Reviewed' | 'Escalated' | 'Cleared';
  device: string;
  ipAddress: string;
  timeline: Array<{
    time: string;
    title: string;
    note: string;
  }>;
  reviewNotes: string;
  reviewUpdatedAt: string | null;
};

export type AdminSecurityAlertsResponse = {
  metrics: {
    totalFlaggedAttempts: number;
    highRiskSessions: number;
    webcamViolations: number;
    tabSwitchIncidents: number;
  };
  items: AdminSecurityAlertListItem[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    availableAssessments: string[];
    availableViolations: string[];
  };
};

export type AdminSecurityAlertDetailResponse = Omit<AdminSecurityAlertListItem, 'timeline'> & {
  field: string;
  studentEmail: string;
  studentSchool: string;
  startedAt: string;
  submittedAt: string;
  duration: string;
  timeline: Array<{
    id: string;
    time: string;
    title: string;
    note: string;
    severity: 'Low' | 'Medium' | 'High';
  }>;
  review: {
    status: 'Open' | 'Reviewed' | 'Escalated' | 'Cleared';
    notes: string;
    updatedAt: string;
  };
};

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

async function authenticatedRequest<T>(path: string, init: RequestInit = {}) {
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

async function authenticatedRawRequest(path: string, init: RequestInit = {}) {
  const currentSession = getStoredAuthSession();
  if (!currentSession) {
    throw new Error('No active session found.');
  }

  const makeRequest = async (accessToken: string) =>
    fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers: {
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

  if (!response.ok) {
    const rawBody = await response.text();
    const parsedBody = rawBody ? JSON.parse(rawBody) : null;
    const message = Array.isArray(parsedBody?.message)
      ? parsedBody.message[0]
      : parsedBody?.message;
    throw new ApiRequestError(message ?? 'Something went wrong. Please try again.', response.status);
  }

  return response;
}

export function getAdminDashboardOverviewRequest() {
  return authenticatedRequest<AdminOverviewResponse>('/admin/dashboard', { method: 'GET' });
}

export function getAdminUsersRequest(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  field?: string;
  joined?: string;
  activity?: string;
} = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== 'all') {
      query.set(key, String(value));
    }
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return authenticatedRequest<AdminUsersListResponse>(`/admin/users${suffix}`, { method: 'GET' });
}

export function getAdminAssessmentsRequest(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  field?: string;
  status?: string;
  difficulty?: string;
  created?: string;
} = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== 'all') {
      query.set(key, String(value));
    }
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return authenticatedRequest<AdminAssessmentsListResponse>(`/admin/assessments${suffix}`, { method: 'GET' });
}

export function getAdminAttemptsRequest(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  assessment?: string;
  field?: string;
  grade?: string;
  status?: string;
  date?: string;
  student?: string;
} = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== 'all') {
      query.set(key, String(value));
    }
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return authenticatedRequest<AdminAttemptsListResponse>(`/admin/attempts${suffix}`, { method: 'GET' });
}

export function getAdminCertificatesRequest(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  field?: string;
  date?: string;
} = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== 'all') {
      query.set(key, String(value));
    }
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return authenticatedRequest<AdminCertificatesListResponse>(`/admin/certificates${suffix}`, {
    method: 'GET',
  });
}

export function getAdminSecurityAlertsRequest(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  risk?: string;
  assessment?: string;
  date?: string;
  violation?: string;
  status?: string;
} = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== 'all') {
      query.set(key, String(value));
    }
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return authenticatedRequest<AdminSecurityAlertsResponse>(`/admin/security${suffix}`, {
    method: 'GET',
  });
}

export async function exportAdminAttemptsCsvRequest(params: {
  search?: string;
  assessment?: string;
  field?: string;
  grade?: string;
  status?: string;
  date?: string;
  student?: string;
} = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== 'all') {
      query.set(key, String(value));
    }
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  const response = await authenticatedRawRequest(`/admin/attempts/export${suffix}`, { method: 'GET' });
  const blob = await response.blob();
  const contentDisposition = response.headers.get('content-disposition') ?? '';
  const filenameMatch = contentDisposition.match(/filename="([^"]+)"/i);

  return {
    blob,
    filename: filenameMatch?.[1] ?? `gradassess-attempts-${new Date().toISOString().slice(0, 10)}.csv`,
  };
}

export async function exportAdminCertificatesCsvRequest(params: {
  search?: string;
  status?: string;
  field?: string;
  date?: string;
} = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== 'all') {
      query.set(key, String(value));
    }
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  const response = await authenticatedRawRequest(`/admin/certificates/export${suffix}`, {
    method: 'GET',
  });
  const blob = await response.blob();
  const contentDisposition = response.headers.get('content-disposition') ?? '';
  const filenameMatch = contentDisposition.match(/filename="([^"]+)"/i);

  return {
    blob,
    filename:
      filenameMatch?.[1] ?? `gradassess-certificates-${new Date().toISOString().slice(0, 10)}.csv`,
  };
}

export function getAdminAttemptDetailRequest(id: string) {
  return authenticatedRequest<AdminAttemptDetailResponse>(`/admin/attempts/${id}`, {
    method: 'GET',
  });
}

export function getAdminSecurityAlertDetailRequest(id: string) {
  return authenticatedRequest<AdminSecurityAlertDetailResponse>(`/admin/security/${id}`, {
    method: 'GET',
  });
}

export function getAdminCertificateDetailRequest(id: string) {
  return authenticatedRequest<AdminCertificateDetailResponse>(`/admin/certificates/${id}`, {
    method: 'GET',
  });
}

export function getAdminAssessmentDetailRequest(id: string) {
  return authenticatedRequest<AdminAssessmentDetailResponse>(`/admin/assessments/${id}`, {
    method: 'GET',
  });
}

export function updateAdminAssessmentStatusRequest(
  id: string,
  status: AdminAssessmentStatus,
) {
  return authenticatedRequest<{
    item: AdminAssessment | AdminAssessmentDetailResponse;
    message: string;
  }>(`/admin/assessments/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}

export function duplicateAdminAssessmentRequest(id: string) {
  return authenticatedRequest<{
    item: AdminAssessment;
    message: string;
  }>(`/admin/assessments/${id}/duplicate`, {
    method: 'POST',
  });
}

export async function exportAdminUsersCsvRequest(params: {
  search?: string;
  status?: string;
  field?: string;
  joined?: string;
  activity?: string;
} = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== 'all') {
      query.set(key, String(value));
    }
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  const response = await authenticatedRawRequest(`/admin/users/export${suffix}`, { method: 'GET' });
  const blob = await response.blob();
  const contentDisposition = response.headers.get('content-disposition') ?? '';
  const filenameMatch = contentDisposition.match(/filename="([^"]+)"/i);

  return {
    blob,
    filename: filenameMatch?.[1] ?? `gradassess-users-${new Date().toISOString().slice(0, 10)}.csv`,
  };
}

export function getAdminUserDetailRequest(id: string) {
  return authenticatedRequest<AdminUserDetailResponse>(`/admin/users/${id}`, { method: 'GET' });
}

export function toggleAdminUserStatusRequest(id: string) {
  return authenticatedRequest<{
    item: AdminUser;
    message: string;
  }>(`/admin/users/${id}/toggle-status`, { method: 'POST' });
}

export function resetAdminUserAccessRequest(id: string) {
  return authenticatedRequest<{
    success: boolean;
    revokedCount: number;
    message: string;
  }>(`/admin/users/${id}/reset-access`, { method: 'POST' });
}

export function approveAdminUserRequestRequest(id: string) {
  return authenticatedRequest<{
    item: AdminUser;
    message: string;
  }>(`/admin/users/${id}/approve-admin-request`, { method: 'POST' });
}

export function rejectAdminUserRequestRequest(id: string) {
  return authenticatedRequest<{
    item: AdminUser;
    message: string;
  }>(`/admin/users/${id}/reject-admin-request`, { method: 'POST' });
}

export function verifyAdminCertificateRequest(id: string) {
  return authenticatedRequest<{
    success: boolean;
    message: string;
    record: {
      certificateNumber: string;
    };
  }>(`/admin/certificates/${id}/verify`, {
    method: 'POST',
  });
}

export function reissueAdminCertificateRequest(id: string) {
  return authenticatedRequest<{
    item: AdminCertificateListItem;
    message: string;
  }>(`/admin/certificates/${id}/reissue`, {
    method: 'POST',
  });
}

export function updateAdminSecurityAlertStatusRequest(
  id: string,
  payload: {
    status: 'REVIEWED' | 'ESCALATED' | 'CLEARED';
    notes?: string;
  },
) {
  return authenticatedRequest<{
    item: AdminSecurityAlertListItem;
    message: string;
  }>(`/admin/security/${id}/status`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createAdminExamRequest(payload: CreateAdminExamPayload) {
  return authenticatedRequest<{
    id: string;
    title: string;
    slug: string;
  }>('/exams', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminExamRequest(examId: string, payload: UpdateAdminExamPayload) {
  return authenticatedRequest<{
    id: string;
    title: string;
    slug: string;
  }>(`/exams/${examId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
