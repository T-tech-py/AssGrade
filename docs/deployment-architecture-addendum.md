# GradAssess AI Deployment Addendum

## Overview

GradAssess AI is deployed as a Dockerized three-service stack on a single Ubuntu VPS. The deployment separates the frontend, backend, and database into distinct containers so that each layer can be built, restarted, and maintained independently.

## Why Docker Compose Was Chosen

Docker Compose was selected because it gives the project a simple and reproducible deployment path that is appropriate for a final year project and a demo-oriented production environment. It allows the complete application stack to be started with one command, keeps service configuration together in a single file, and makes the deployment easier to explain in technical documentation.

## Runtime Services

The deployment stack contains the following services:

1. Frontend container
   - Runs the Next.js application in production mode with `next start`.
   - Exposes the user-facing web interface.

2. Backend container
   - Runs the NestJS API with `node dist/main`.
   - Handles authentication, assessment submission, grading, certificate issuance, admin operations, and Gemini-powered features.

3. PostgreSQL container
   - Stores all persistent application data.
   - Uses a named Docker volume so that data survives container restarts.

## Networking Model

- The frontend is exposed publicly on the VPS port selected for the web app.
- The backend is exposed on a separate API port for demo access and frontend communication.
- PostgreSQL is kept internal to the Docker network and is not publicly exposed.

This arrangement keeps the database isolated while still allowing the frontend and backend to communicate with each other through Docker networking.

## Environment Configuration

Deployment-specific configuration is supplied through environment variables rather than hardcoded values. The most important deployment variables are:

- `DATABASE_URL`
- `APP_URL`
- `CORS_ORIGIN`
- `NEXT_PUBLIC_API_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_RESET_SECRET`
- `GEMINI_API_KEY`

The Gemini API key is stored in environment configuration and injected into the backend container at runtime. It is not embedded directly in frontend code.

## Database Startup and Prisma Flow

The deployment follows this startup sequence:

1. PostgreSQL starts and passes its health check.
2. The backend image already contains the generated Prisma client.
3. The schema is synchronized explicitly with `prisma db push`.
4. Optional seeding is executed only when needed for initial setup.
5. The backend service starts.
6. The frontend service starts.

This design avoids reseeding the database on every restart and keeps deployment behavior predictable.

## Portability and Reproducibility Benefits

Using Docker Compose gives the project several advantages:

- the same stack can run consistently on any Docker-enabled Ubuntu VPS
- onboarding and redeployment are simpler because the runtime is containerized
- service isolation reduces configuration drift between development and deployment
- documentation becomes clearer because the deployment story is deterministic

## Future Extension Path

The current deployment is intentionally simple and suitable for a private or supervisor-facing demonstration. A reverse proxy such as Caddy or Nginx can be added later for HTTPS, domain routing, and tighter internet-facing hardening if the project moves beyond the demo stage.
