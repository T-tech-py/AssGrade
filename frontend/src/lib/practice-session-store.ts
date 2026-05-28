'use client';

import type { PracticeReviewResponse, PracticeSessionResponse } from '@/lib/practice-api';

const ACTIVE_PRACTICE_SESSION_KEY = 'gradassess-active-practice-session';
const ACTIVE_PRACTICE_REVIEW_KEY = 'gradassess-active-practice-review';

function safeRead<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

export function getStoredPracticeSession() {
  return safeRead<PracticeSessionResponse>(ACTIVE_PRACTICE_SESSION_KEY);
}

export function setStoredPracticeSession(session: PracticeSessionResponse) {
  safeWrite(ACTIVE_PRACTICE_SESSION_KEY, session);
}

export function clearStoredPracticeSession() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(ACTIVE_PRACTICE_SESSION_KEY);
}

export function getStoredPracticeReview() {
  return safeRead<PracticeReviewResponse>(ACTIVE_PRACTICE_REVIEW_KEY);
}

export function setStoredPracticeReview(review: PracticeReviewResponse) {
  safeWrite(ACTIVE_PRACTICE_REVIEW_KEY, review);
}

export function clearStoredPracticeReview() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(ACTIVE_PRACTICE_REVIEW_KEY);
}
