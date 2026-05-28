# GradAssess AI

Runnable monorepo for GradAssess AI, an AI-powered graduate employability assessment platform.

## Project Structure

- `frontend`: Next.js App Router client
- `backend`: NestJS API with Prisma
- `docker-compose.yml`: local PostgreSQL for development
- `docker-compose.prod.yml`: production-style Docker Compose stack for VPS deployment

## Local Development

1. Start PostgreSQL:
   - `docker compose up -d postgres`
2. Install dependencies:
   - `npm install`
3. Generate Prisma client and sync schema:
   - `npm run db:push`
4. Start both apps in separate terminals:
   - `npm run dev:backend`
   - `npm run dev:frontend`

Frontend: [http://localhost:3000](http://localhost:3000)  
Backend health: [http://localhost:4000/api/health](http://localhost:4000/api/health)

## Production-Style Docker Deployment

This project can be deployed as a three-container stack on a single Ubuntu VPS:

- `frontend`: Next.js production server
- `backend`: NestJS API server
- `postgres`: PostgreSQL database with a named volume

### 1. Prepare the deployment environment

Copy the deployment template and update it with your VPS IP and rotated secrets:

```bash
cp deploy.env.example deploy.env
```

Update at least these values in `deploy.env`:

- `APP_URL`
- `CORS_ORIGIN`
- `NEXT_PUBLIC_API_URL`
- `POSTGRES_PASSWORD`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_RESET_SECRET`
- `GEMINI_API_KEY`

Important: the current development Gemini key should be rotated before deployment.

### 2. Build the Docker images

```bash
docker compose --env-file deploy.env -f docker-compose.prod.yml build
```

### 3. Start PostgreSQL first

```bash
docker compose --env-file deploy.env -f docker-compose.prod.yml up -d postgres
```

### 4. Push the Prisma schema

```bash
docker compose --env-file deploy.env -f docker-compose.prod.yml run --rm backend npm --workspace backend run prisma:push
```

### 5. Seed optional demo data

Run this only when you want the initial seed users and records:

```bash
docker compose --env-file deploy.env -f docker-compose.prod.yml run --rm backend npm --workspace backend run prisma:seed
```

### 6. Start the application services

```bash
docker compose --env-file deploy.env -f docker-compose.prod.yml up -d backend frontend
```

### 7. Access the deployed app

- Frontend: `http://YOUR_VPS_IP:3000`
- Backend API: `http://YOUR_VPS_IP:4000/api`

PostgreSQL is intentionally not exposed publicly in the production Compose file.

### Useful management commands

Stop the full stack:

```bash
docker compose --env-file deploy.env -f docker-compose.prod.yml down
```

View running logs:

```bash
docker compose --env-file deploy.env -f docker-compose.prod.yml logs -f
```

## Notes

- Ready-to-use local env files are already present at `backend/.env` and `frontend/.env.local`.
- The backend auto-grades MCQ, theory, and open-ended coding responses with rule-based plus Gemini-assisted grading where applicable.
- Real exam sessions hide explanations and rubrics from students.
- A deployment architecture addendum is available at `docs/deployment-architecture-addendum.md`.
