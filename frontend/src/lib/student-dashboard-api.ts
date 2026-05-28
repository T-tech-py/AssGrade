'use client';

import { ApiRequestError, refreshSessionRequest } from '@/lib/auth-api';
import {
  getOrCreateDeviceId,
  getStoredAuthSession,
  updateStoredAuthSession,
} from '@/lib/auth-session';
import type {
  Activity,
  Assessment,
  CareerInsight,
  Certificate,
  DashboardIconName,
  PerformancePoint,
  SummaryStat,
} from '@/data/student-dashboard';
import type {
  CareerInsightHero,
  CareerInsightStat,
  CareerNextStep,
  CareerRoleMatch,
  CareerSignal,
} from '@/data/career-insights-data';
import type { ExamDefinition, ExamQuestion } from '@/data/exam-assessments';
import type {
  CompetencyBreakdown,
  FormatPerformance,
  ResultAttempt,
  ResultMetric,
  TrendPoint,
} from '@/data/results-data';

export type StudentDashboardResponse = {
  hero: {
    readinessScore: number;
    readinessLabel: string;
    nextGoal: string;
    latestWin: string;
    practiceHint: string;
  };
  summaryStats: SummaryStat[];
  performanceSeries: PerformancePoint[];
  availableAssessments: Assessment[];
  recentActivity: Activity[];
  careerInsights: CareerInsight[];
  certificates: Certificate[];
};

type ExamSessionQuestionResponse = {
  id: string;
  type: 'MCQ' | 'THEORY' | 'CODING';
  prompt: string;
  marks: number;
  orderIndex: number;
  difficulty?: string | null;
  metadata?: Record<string, unknown> | null;
  rubric?: Record<string, unknown> | null;
  options: Array<{
    id: string;
    label: string;
    value: string;
    orderIndex: number;
  }>;
};

export type StudentExamSessionResponse = {
  id: string;
  title: string;
  description?: string | null;
  instructions?: string | null;
  mode: 'REAL' | 'PRACTICE';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  durationInMinutes: number;
  totalMarks: number;
  passingMarks: number;
  fullscreenRequired: boolean;
  webcamRequired: boolean;
  tabSwitchLimit: number;
  questions: ExamSessionQuestionResponse[];
};

export type StartStudentExamResponse = {
  attemptId: string;
  examId: string;
  mode: 'REAL' | 'PRACTICE';
  restrictions: {
    fullscreenRequired: boolean;
    webcamRequired: boolean;
    tabSwitchLimit: number;
  };
};

export type SubmitStudentExamResponse = {
  attemptId: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  passed: boolean;
  certificate: {
    id: string;
    certificateNumber: string;
  } | null;
};

export type StudentCertificatesResponse = {
  overview: {
    totalIssued: string;
    shareableNow: string;
    pendingUnlocks: string;
    latestIssued: string;
  };
  items: CertificateDetailResponse[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type CertificateDetailResponse = {
  id: string;
  title: string;
  field: string;
  score: string;
  grade: string;
  verificationId: string;
  issuedAt: string;
  status: 'Issued' | 'Pending' | 'Locked';
  recipientName: string;
  readinessLevel: string;
  summary: string;
  eligibilityNote: string;
  skillSignals: string[];
  organization: string;
  assessmentDate: string;
  expires: string;
  href: string;
  verificationHash?: string;
  school?: string;
  marks?: string;
};

export type StudentResultsResponse = {
  highlights: {
    latestTitle: string;
    latestScore: number;
    latestGrade: string;
    latestSummary: string;
    strengths: string[];
    focusAreas: string[];
    latestCertificateHref: string;
  };
  metrics: ResultMetric[];
  trend: TrendPoint[];
  readinessNote: {
    strongestSignal: string;
    currentBlocker: string;
    recommendedNextMove: string;
  };
  attempts: Array<
    ResultAttempt & {
      certificateHref: string | null;
      breakdownHref: string;
    }
  >;
  breakdown: {
    competencies: CompetencyBreakdown[];
    formats: FormatPerformance[];
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  overview: {
    latestIssued: string;
  };
};

export type StudentResultDetailResponse = {
  hero: {
    title: string;
    field: string;
    completedAt: string;
    score: number;
    grade: string;
    status: 'Fail' | 'Fairly passed' | 'Passed' | 'Credit' | 'Excellent';
    duration: string;
    questionCount: number;
    certificateHref: string | null;
  };
  summary: {
    strongestSignal: string;
    weakestSignal: string;
    note: string;
  };
  competencies: CompetencyBreakdown[];
  formats: FormatPerformance[];
  responses: Array<{
    id: string;
    prompt: string;
    type: 'MCQ' | 'THEORY' | 'CODING';
    marks: number;
    awardedMarks: number;
    autoFeedback: string | null;
  }>;
};

export type StudentCareerInsightsResponse = {
  hero: CareerInsightHero;
  stats: CareerInsightStat[];
  roleMatches: CareerRoleMatch[];
  signals: CareerSignal[];
  strengths: string[];
  gaps: string[];
  nextSteps: CareerNextStep[];
};

export type StudentProctorEventRequest = {
  type:
    | 'TAB_SWITCH'
    | 'FULLSCREEN_EXIT'
    | 'WEBCAM_STATUS'
    | 'IP_CHANGE'
    | 'DEVICE_CHANGE'
    | 'MULTIPLE_FACE_DETECTED'
    | 'NO_FACE_DETECTED'
    | 'SUSPICIOUS_ACTIVITY';
  severity?: number;
  payload?: Record<string, unknown>;
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

async function authenticatedFileRequest(path: string, init: RequestInit = {}) {
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

export async function getStudentDashboardRequest() {
  return authenticatedRequest<StudentDashboardResponse>('/exams/dashboard/overview', {
    method: 'GET',
  });
}

export async function getStudentAssessmentsRequest() {
  return authenticatedRequest<Assessment[]>('/exams', {
    method: 'GET',
  });
}

export async function getStudentCertificatesRequest(params?: {
  page?: number;
  pageSize?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.set('page', String(params.page));
  }

  if (params?.pageSize) {
    searchParams.set('pageSize', String(params.pageSize));
  }

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : '';

  return authenticatedRequest<StudentCertificatesResponse>(`/certificates/me${suffix}`, {
    method: 'GET',
  });
}

export async function getStudentCertificateDetailRequest(id: string) {
  return authenticatedRequest<CertificateDetailResponse>(`/certificates/me/${id}`, {
    method: 'GET',
  });
}

export async function downloadStudentCertificateRequest(id: string) {
  const response = await authenticatedFileRequest(`/certificates/me/${id}/download`, {
    method: 'GET',
  });
  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') ?? '';
  const filenameMatch = disposition.match(/filename="?([^"]+)"?/i);

  return {
    blob,
    fileName: filenameMatch?.[1] ?? 'gradassess-certificate.svg',
  };
}

export async function getStudentResultsRequest(params?: {
  page?: number;
  pageSize?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.set('page', String(params.page));
  }

  if (params?.pageSize) {
    searchParams.set('pageSize', String(params.pageSize));
  }

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : '';

  return authenticatedRequest<StudentResultsResponse>(`/exams/results${suffix}`, {
    method: 'GET',
  });
}

export async function getStudentResultDetailRequest(id: string) {
  return authenticatedRequest<StudentResultDetailResponse>(`/exams/results/${id}`, {
    method: 'GET',
  });
}

export async function getStudentCareerInsightsRequest() {
  return authenticatedRequest<StudentCareerInsightsResponse>('/exams/career-insights', {
    method: 'GET',
  });
}

export async function getStudentExamSessionRequest(id: string) {
  return authenticatedRequest<StudentExamSessionResponse>(`/exams/${id}/session`, {
    method: 'GET',
  });
}

export async function startStudentExamRequest(id: string) {
  return authenticatedRequest<StartStudentExamResponse>(`/exams/${id}/start`, {
    method: 'POST',
    body: JSON.stringify({
      deviceId: getOrCreateDeviceId(),
    }),
  });
}

export async function submitStudentExamRequest(
  id: string,
  answers: Array<{ questionId: string; answer?: unknown }>,
) {
  return authenticatedRequest<SubmitStudentExamResponse>(`/exams/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

export async function logStudentProctorEventRequest(
  attemptId: string,
  event: StudentProctorEventRequest,
) {
  return authenticatedRequest<{ id: string }>(`/exams/attempts/${attemptId}/proctor-events`, {
    method: 'POST',
    body: JSON.stringify(event),
  });
}

function inferFieldFromTitle(title: string) {
  const normalizedTitle = title.toLowerCase();
  if (normalizedTitle.includes('law')) return 'Law';
  if (normalizedTitle.includes('engineer')) return 'Engineering';
  if (normalizedTitle.includes('tech')) return 'Technology';
  return 'General';
}

function toDifficulty(value?: string | null): 'Beginner' | 'Intermediate' | 'Advanced' {
  const normalized = (value ?? '').toLowerCase();
  if (normalized === 'beginner') return 'Beginner';
  if (normalized === 'advanced') return 'Advanced';
  return 'Intermediate';
}

function getReadableOptionLabel(label: string, value: string) {
  const normalized = label.trim().toLowerCase();
  const looksGenericOptionLabel =
    normalized === 'option a' ||
    normalized === 'option b' ||
    normalized === 'option c' ||
    normalized === 'option d' ||
    normalized === 'option e';

  return looksGenericOptionLabel ? value : label || value;
}

function buildSecurityNotes(session: StudentExamSessionResponse) {
  const notes = ['Do not switch tabs during the assessment.'];

  if (session.webcamRequired) {
    notes.push('Keep your webcam on at all times.');
  }

  if (session.fullscreenRequired) {
    notes.push('Exiting fullscreen may trigger a warning.');
  }

  notes.push(`Assessment will auto-submit when time ends.`);
  notes.push(`Tab switching beyond ${session.tabSwitchLimit} warnings may end your session.`);

  return notes;
}

function buildInstructions(session: StudentExamSessionResponse) {
  if (session.instructions?.trim()) {
    return session.instructions
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [
    'Read every question carefully before selecting or typing your response.',
    'Use the question palette to navigate, but review flagged items before submitting.',
    'Your responses will autosave while you work.',
    'The assessment will submit automatically when the timer expires.',
  ];
}

function mapQuestion(question: ExamSessionQuestionResponse, index: number): ExamQuestion {
  const metadata = (question.metadata ?? {}) as Record<string, unknown>;
  const type = question.type.toLowerCase();

  if (type === 'mcq') {
    return {
      id: question.id,
      number: index + 1,
      type: 'mcq',
      difficulty: toDifficulty(question.difficulty),
      prompt: question.prompt,
      scenario: typeof metadata.scenario === 'string' ? metadata.scenario : undefined,
      options: question.options.map((option) => ({
        id: option.id,
        label: getReadableOptionLabel(option.label, option.value),
        value: option.value,
      })),
    };
  }

  if (type === 'theory') {
    return {
      id: question.id,
      number: index + 1,
      type: 'theory',
      difficulty: toDifficulty(question.difficulty),
      prompt: question.prompt,
      scenario: typeof metadata.scenario === 'string' ? metadata.scenario : undefined,
      placeholder:
        typeof metadata.placeholder === 'string'
          ? metadata.placeholder
          : 'Write a clear and well-structured response...',
    };
  }

  return {
    id: question.id,
    number: index + 1,
    type: 'coding',
    difficulty: toDifficulty(question.difficulty),
    prompt: question.prompt,
    scenario: typeof metadata.scenario === 'string' ? metadata.scenario : undefined,
    language:
      typeof metadata.language === 'string' && metadata.language.toLowerCase() === 'python'
        ? 'Python'
        : 'JavaScript',
    starterCode:
      typeof metadata.starterCode === 'string'
        ? metadata.starterCode
        : '// Write your solution here',
    sampleInput:
      typeof metadata.sampleInput === 'string' ? metadata.sampleInput : 'No sample input provided',
    sampleOutput:
      typeof metadata.sampleOutput === 'string'
        ? metadata.sampleOutput
        : 'No sample output provided',
  };
}

export function mapStudentExamSessionToDefinition(
  session: StudentExamSessionResponse,
): ExamDefinition {
  const formats = Array.from(
    new Set(
      session.questions.map((question) =>
        question.type === 'MCQ'
          ? 'MCQ'
          : question.type === 'THEORY'
            ? 'Theory'
            : 'Coding',
      ),
    ),
  ) as Array<'MCQ' | 'Theory' | 'Coding'>;

  return {
    id: session.id,
    title: session.title,
    field: inferFieldFromTitle(session.title),
    durationMinutes: session.durationInMinutes,
    totalQuestions: session.questions.length,
    formats,
    instructions: buildInstructions(session),
    securityNotes: buildSecurityNotes(session),
    description:
      session.description ??
      'A secure mixed-format assessment focused on practical thinking, communication, and employability readiness.',
    questions: session.questions.map(mapQuestion),
  };
}
