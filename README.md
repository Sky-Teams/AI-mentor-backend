# AI Mentor App for Case Report Publication

Backend-first scaffold for an AI Mentor system focused on **Case Report** writing and review, plus a very small React client used only to test backend flows.

## What is included

- `backend/`
  Node.js + TypeScript + Express + Prisma + PostgreSQL
- `frontend/`
  React + TypeScript + Vite internal testing UI
- `docker-compose.yml`
  Local PostgreSQL, Redis, backend, and frontend services

## Product scope

This starter is intentionally opinionated around **Case Report publication only**.

Supported section model:

1. Title
2. Abstract
3. Keywords
4. Introduction
5. Case Presentation
6. Discussion
7. Conclusion
8. Patient Perspective
9. Informed Consent / Ethical Statement
10. References
11. Cover Letter

## Architecture

The backend uses Clean Architecture by feature module:

- `domain`
  Entities, enums, repository interfaces, service ports
- `application`
  Use-case oriented services
- `infrastructure`
  Prisma repositories, JWT, password hashing, OpenAI adapter
- `interfaces`
  HTTP controllers, routes, request schemas
- `shared`
  Config, middleware, error handling, logging, docs, constants

Modules in the first version:

- Auth
- Projects
- Reviews
- Billing
- Admin
- Health

For simplicity, sections and versioning live under `Projects`, while issues and readiness live under `Reviews`. This keeps boundaries clean without fragmenting the first version into too many thin modules.

## Quick start

### 1. Copy environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Start infrastructure

```bash
docker compose up -d postgres redis
```

### 3. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 4. Prepare database

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

### 5. Run apps

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

### 6. Open the apps

- API: `http://localhost:3000/api/v1`
- Swagger UI: `http://localhost:3000/docs`
- Frontend: `http://localhost:5173`

## Seeded users

- Admin
  Email: value from `backend/.env` `DEFAULT_ADMIN_EMAIL`
  Password: value from `backend/.env` `DEFAULT_ADMIN_PASSWORD`
- Researcher
  Email: `researcher@example.com`
  Password: `Research123!`

The seed creates:

- subscription plans
- admin and researcher accounts
- credit wallets
- active researcher subscription
- default guideline pack
- default review prompt template
- a demo project with drafted sections
- one seeded completed AI review with issues

## Important backend flows

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`

### Projects and sections

- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `GET /api/v1/projects/:projectId`
- `PATCH /api/v1/projects/:projectId`
- `DELETE /api/v1/projects/:projectId`
- `GET /api/v1/projects/:projectId/sections/:sectionKey`
- `PUT /api/v1/projects/:projectId/sections/:sectionKey`

### Reviews

- `POST /api/v1/projects/:projectId/reviews`
- `GET /api/v1/projects/:projectId/reviews`
- `GET /api/v1/reviews/:reviewRunId`
- `GET /api/v1/projects/:projectId/issues`
- `PATCH /api/v1/issues/:issueId`
- `GET /api/v1/projects/:projectId/readiness`

### Billing

- `GET /api/v1/billing/overview`

### Admin

- `GET /api/v1/admin/guideline-packs`
- `PUT /api/v1/admin/guideline-packs`
- `GET /api/v1/admin/prompt-templates`
- `PUT /api/v1/admin/prompt-templates`
- `GET /api/v1/admin/plans`
- `PUT /api/v1/admin/plans`
- `GET /api/v1/admin/users/usage`

## Testing

Backend tests are scaffolded with:

- Jest for unit tests
- Supertest for integration tests

Run:

```bash
cd backend
npm test
```

## OpenAI integration notes

The review adapter is isolated in:

- `backend/src/modules/reviews/infrastructure/openai-section-reviewer.ts`

Key design choices:

- structured JSON review output
- strong anti-fabrication instructions
- prompt template lookup from admin-managed storage
- guideline pack lookup from admin-managed storage
- usage and app-credit tracking stored separately from OpenAI technical tokens

## Docker

Full stack boot:

```bash
docker compose up --build
```

## Next steps

- add real migration files after first `prisma migrate dev`
- replace synchronous review processing with a queue worker
- add refresh-token rotation persistence and revocation list cleanup
- implement payment provider and credit purchase flows
- expand Swagger schemas and examples
- add queue retries, dead-letter handling, and observability
- add stronger admin audit policy and immutable activity log rules
