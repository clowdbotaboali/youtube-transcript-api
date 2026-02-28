# Transcript AI

Production-ready SaaS application for YouTube transcript extraction, AI processing, account management, and manual top-up billing.

The platform supports:
- Transcript extraction from YouTube links
- AI summary/steps/resources/chat over extracted transcripts
- Per-user history and saved links
- Subscription tiers (`free`, `pro`, `admin`)
- Manual payment flow (InstaPay / Vodafone Cash) with proof upload and admin review
- Admin-managed API keys and model selection

## Architecture Overview

### Frontend
- Stack: `React + Vite + Tailwind`
- Location: `frontend/`
- Responsibilities:
  - Authentication UI (Supabase Auth)
  - Client dashboard and workspace
  - History and saved links UI
  - Billing/top-up requests and proof upload
  - Admin panel UI

### Backend API
- Stack: Vercel serverless Node function
- Entry: `api/index.js`
- Responsibilities:
  - Authenticated API endpoints
  - Input validation and normalized error responses
  - Tier enforcement and credit consumption
  - Caching and transcript provider fallback
  - Manual payment review workflow
  - Admin configuration (billing + AI providers + transcript API keys)
  - Request analytics logging (`api_request_logs`)

### Data Layer
- Provider: Supabase (Postgres + Auth + Storage)
- Core tables:
  - `users`
  - `transcripts_history`
  - `payments`
  - `api_request_logs`
- Storage:
  - Bucket for payment proof images (default: `payment-proofs`)

## Environment Variables

### Backend / Vercel (`api/index.js`)
Required:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Recommended:
- `ADMIN_TOKEN_SECRET`

Optional:
- `ALLOWED_ORIGINS` (comma-separated)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `PAYMENT_PROOF_BUCKET`

### Frontend (`frontend`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` (optional; defaults to same origin on production)

## Database Setup

Run schema/migrations in Supabase SQL editor:
- `supabase_schema.sql`
- `supabase_migrations/2026-02-22_bootstrap_core_tables.sql`
- `supabase_migrations/2026-02-22_add_payments_table.sql`
- `supabase_migrations/2026-02-28_add_subscription_and_api_logs.sql`

## Local Development

1. Install dependencies:

```bash
npm install
npm install --prefix frontend
```

2. Create env files from examples:
- `backend/.env.example`
- `frontend/.env.example`

3. Run frontend:

```bash
npm run dev --prefix frontend
```

4. Run backend (optional local Express flow if you use `backend/server.js`), or use Vercel dev flow if configured.

## API Endpoints (Primary)

Public/health:
- `GET /api/health`
- `GET /api/settings/status`

User:
- `GET /api/me`
- `POST /api/transcript/extract`
- `POST /api/ai/process`
- `POST /api/chat/chat`
- `GET /api/history`
- `POST /api/history/save`
- `DELETE /api/history/:id`
- `GET /api/links`
- `POST /api/links/save`
- `DELETE /api/links/:id`

Billing:
- `GET /api/billing/config`
- `POST /api/billing/create-topup-request`
- `GET /api/billing/my-requests`

Admin:
- `POST /api/admin/login`
- `GET /api/admin/overview`
- `GET /api/admin/usage`
- `GET /api/admin/users`
- `POST /api/admin/users/:id/status`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/payments`
- `POST /api/admin/payments/:id/review`
- `GET /api/admin/settings`
- `POST /api/admin/settings`
- `GET /api/admin/billing-config`
- `POST /api/admin/billing-config`
- `GET /api/admin/ai/config`
- `POST /api/admin/ai/config`
- `POST /api/admin/ai/models`
- `GET /api/admin/transcript-api/config`
- `POST /api/admin/transcript-api/config`

## Error Response Schema

All API errors are normalized to:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_VIDEO_ID",
    "message": "Invalid YouTube video ID format"
  }
}
```

Status mapping:
- `400` invalid input
- `401` unauthenticated
- `403` limit/feature access denied
- `404` not found or transcript unavailable
- `429` rate limited
- `500` internal/server misconfiguration

Common error codes:
- `INVALID_INPUT`
- `INVALID_VIDEO_ID`
- `UNAUTHENTICATED`
- `FEATURE_NOT_AVAILABLE`
- `LIMIT_EXCEEDED`
- `TRANSCRIPT_UNAVAILABLE`
- `RATE_LIMITED`
- `SERVER_MISCONFIGURED`
- `INTERNAL_ERROR`

## Caching and Rate Limiting

- Per-user transcript deduplication by `video_id`
- Global transcript cache reuse from recent extraction records
- In-memory hot cache with TTL
- IP and user-level rate limits for extraction, AI processing, chat, and admin login

## Security Controls

- Strict CORS allowlist with localhost + production origin support
- Security headers on API responses:
  - `X-Frame-Options`
  - `X-Content-Type-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - API CSP (`default-src 'none'`)
- Environment validation on boot
- Admin JWT token with expiry
- No API secrets exposed in frontend

## CI/CD

GitHub Actions workflow:
- Node setup
- Install dependencies
- Syntax checks
- Frontend lint
- Frontend production build
- Env example validation

Workflow file:
- `.github/workflows/ci.yml`

## Deployment Checklist

1. Configure Vercel project for this repository.
2. Add required backend and frontend environment variables.
3. Run Supabase migrations.
4. Deploy and verify:
   - `/api/health`
   - Auth flow (signup/login/logout)
   - Transcript extraction
   - AI processing and chat
   - Billing proof upload and admin review
   - Admin usage dashboard
5. Confirm legal/footer/pricing pages on production routes.

