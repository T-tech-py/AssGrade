# Backend Overview

This backend is scaffolded as a modular NestJS application for an AI-powered examination platform.

## Modules

- `auth`: JWT authentication, refresh sessions, registration, login, and profile access
- `users`: user persistence helpers
- `exams`: exam creation, secure exam sessions, attempt submission, and auto-grading
- `admin`: dashboard summary metrics for the admin console
- `proctoring`: websocket-driven proctoring events for webcam/tab/fullscreen/device activity
- `ai`: Gemini-powered generation for practice questions, study plans, career paths, and admin question suggestions
- `certificates`: certificate issuance and public verification endpoint
- `prisma`: shared Prisma client

## Security Notes

- JWT auth with role-based route guards
- Session-backed refresh token rotation
- Request validation with whitelist enforcement
- Helmet and throttling enabled globally
- Real exam sessions intentionally suppress answer explanations and rubrics

## Suggested Next Backend Steps

1. Add database migrations and seed data.
2. Add admin analytics and question-bank endpoints.
3. Replace placeholder coding/theory grading with sandboxed execution and rubric-based review.
4. Add signed object storage for webcam snapshots and evidence logs.
5. Add audit logs, observability, and background jobs.
