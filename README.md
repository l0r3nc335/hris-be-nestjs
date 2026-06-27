# HRIS Enterprise API (NestJS)

NestJS backend for the HRIS React frontend. All routes are under `/api/v1` with `{ data }` response envelope.

This is a **standalone Git repository**. The React frontend lives in a separate repo (typically cloned as a sibling `FE/` folder in your local workspace).

## Stack

- NestJS 11, PostgreSQL, Prisma, Redis, BullMQ
- HttpOnly cookie auth (access + refresh JWT/opaque tokens), RBAC, multi-tenant (`tenantId` + `X-Tenant-Id`)
- Swagger: `http://localhost:3000/api/docs`

## Quick start

```bash
# Start Postgres + Redis
docker compose up -d

# Install & migrate
npm install
cp .env.example .env
npx prisma migrate dev
npm run prisma:seed

# Run API
npm run start:dev
```

API: `http://localhost:3000/api/v1`

### Demo login

- Email: `admin@hris.com`
- Password: `password`

## Connect frontend

In the frontend repo's `.env` (sibling `../FE/` when using the local workspace layout):

```
VITE_API_BASE_URL=
```

CORS is configured for `http://localhost:5173` (Vite dev server). The FE should normally use the Vite proxy for browser development so cookie auth and CSRF stay same-origin. Set `VITE_API_BASE_URL=http://localhost:3000` only for direct API contexts such as FE integration tests.

For the full FE + BE authentication walkthrough, see [`../FE/.cursor/rules/authentication-walkthrough.mdc`](../FE/.cursor/rules/authentication-walkthrough.mdc).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Dev server with watch |
| `npm run build` | Production build |
| `npm run prisma:migrate` | Run migrations |
| `npm run prisma:seed` | Seed demo data |
| `npm run test:e2e` | E2E smoke tests |

## Modules

Auth, Users, Employees, Departments, Positions, Attendance, Leave, Payroll, Compensation, Time Tracking, Recruitment, Interviews, Performance, Organization, Documents, Notifications, Roles, Audit, Reports, Analytics, Settings, Tenants, Billing, Health.

Most domain endpoints return scaffold data from `HrRecord` seeds; auth, audit, tenants, and documents upload are fully wired.
