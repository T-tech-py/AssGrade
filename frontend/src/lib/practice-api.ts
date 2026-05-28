'use client';

import { ApiRequestError, refreshSessionRequest } from '@/lib/auth-api';
import {
  getOrCreateDeviceId,
  getStoredAuthSession,
  updateStoredAuthSession,
} from '@/lib/auth-session';
import type {
  PracticeCategory,
  PracticeDifficulty,
  PracticeQuestion,
  PracticeQuestionType,
  PracticeRecentSession,
  PracticeRecommendation,
  PracticeReviewQuestion,
  PracticeStyle,
  PracticeSummaryMetric,
} from '@/data/practice-mode';

export type PracticeBootstrapResponse = {
  recommendation: PracticeRecommendation;
  recentSessions: PracticeRecentSession[];
  studyPlan: Array<{ day: string; focus: string }>;
};

export type PracticeSessionResponse = {
  sessionId: string;
  session: {
    id: string;
    title: string;
    category: PracticeCategory;
    topic: string;
    difficulty: PracticeDifficulty;
    questionType: PracticeQuestionType;
    questionCount: number;
    style: PracticeStyle;
    progressNote: string;
    relaxedModeLabel: string;
    focusAreas: string[];
    recommendedTopics: string[];
    studyTips: string[];
    questions: PracticeQuestion[];
  };
};

export type PracticeQuestionFeedbackResponse = {
  id: string;
  questionId: string;
  number: number;
  type: 'MCQ' | 'Theory' | 'Coding';
  prompt: string;
  userAnswer: string;
  idealAnswer: string;
  explanation: string;
  improvementNote: string;
  outcome: 'Correct' | 'Needs Improvement';
  score: number;
  maxScore: number;
  recommendedTopic: string;
};

export type PracticeReviewResponse = {
  reviewId: string;
  review: {
    id: string;
    sessionId: string;
    title: string;
    field: PracticeCategory;
    topic: string;
    difficulty: PracticeDifficulty;
    score: string;
    completion: string;
    completedAt: string;
    weakAreas: string[];
    studyPlan: Array<{ day: string; focus: string }>;
    careerInsight: string;
    sessionSummary: string;
    summaryMetrics: PracticeSummaryMetric[];
    questions: PracticeReviewQuestion[];
  };
};

type GeneratePracticeSessionInput = {
  category: PracticeCategory;
  topic: string;
  questionType: PracticeQuestionType;
  difficulty: PracticeDifficulty;
  questionCount: number;
  style: PracticeStyle;
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

export async function getPracticeBootstrapRequest() {
  return authenticatedRequest<PracticeBootstrapResponse>('/ai/practice/bootstrap', {
    method: 'GET',
  });
}

export async function generatePracticeSessionRequest(input: GeneratePracticeSessionInput) {
  return authenticatedRequest<PracticeSessionResponse>('/ai/practice/session', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getPracticeSessionRequest(sessionId: string) {
  return authenticatedRequest<PracticeSessionResponse>(`/ai/practice/session/${sessionId}`, {
    method: 'GET',
  });
}

export async function getPracticeQuestionFeedbackRequest(input: {
  sessionId: string;
  questionId: string;
  answer: unknown;
}) {
  return authenticatedRequest<PracticeQuestionFeedbackResponse>('/ai/practice/question-feedback', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function reviewPracticeSessionRequest(input: {
  sessionId: string;
  answers: Array<{ questionId: string; answer?: unknown }>;
}) {
  return authenticatedRequest<PracticeReviewResponse>('/ai/practice/review', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getPracticeReviewRequest(reviewId: string) {
  return authenticatedRequest<PracticeReviewResponse>(`/ai/practice/review/${reviewId}`, {
    method: 'GET',
  });
}
