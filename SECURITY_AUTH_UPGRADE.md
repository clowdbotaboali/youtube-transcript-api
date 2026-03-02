# Security/Auth Upgrade (Production)

## 1) Security architecture summary
- Frontend auth UX is handled in `frontend/src/components/AuthModal.jsx`.
- Email/password auth now goes through server endpoints:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/resend-verification`
- Google OAuth uses Supabase OAuth directly from frontend (`signInWithOAuth`) with callback to `/auth/callback?next=/dashboard`.
- Server enforces email verification for protected APIs only (`/api/me`, transcript/AI/history/billing/chat routes).
- Quota enforcement is server-side only via Supabase RPC and `user_usage` table.

## 2) Supabase schema / SQL
- Migration file:
  - `supabase_migrations/2026-03-02_auth_security_and_user_usage.sql`
- Adds:
  - `public.user_usage`
  - `refresh_user_quota_if_due(uuid)`
  - `consume_user_quota(uuid)` (atomic consume with row lock)
  - Explicit function grants: executable by `service_role` only.
  - updated `handle_new_user()` trigger function to bootstrap `user_usage`

## 3) Route protection implementation
- API-level protection is enforced in `api/index.js` for:
  - `/api/me`
  - `/api/transcript/*`, `/api/transcripts/*`
  - `/api/ai/*`, `/api/history*`, `/api/links*`, `/api/billing*`, `/api/chat/*`
- Auth checks are server-side (`getAuthedUser`) + email verification checks.
- Signup/login abuse limits are enforced server-side with IP/user keyed windows.

## 4) Google OAuth setup (Supabase + Vercel)
1. Supabase dashboard -> Authentication -> Providers -> enable Google.
2. Configure Google client ID/secret in Supabase.
3. Add redirect URLs in Supabase:
   - `https://transcripta.tech/auth/callback`
   - `https://www.transcripta.tech/auth/callback`
   - preview/local URLs as needed.
4. Add the same callback URLs in Google Cloud OAuth client.
5. Deploy. Frontend button "Continue with Google" now redirects to Supabase OAuth flow.

## 5) Turnstile server validation logic
- Frontend widget:
  - `frontend/src/components/AntiBotCheck.jsx`
  - sends token in signup payload (`turnstileToken`).
- Server validation:
  - `api/index.js` -> `validateTurnstileToken()`
  - verifies with `https://challenges.cloudflare.com/turnstile/v0/siteverify`
  - signup is blocked if token invalid/missing.

## 6) Rate limiting implementation
- API-level hard checks in `api/index.js`:
  - `authSignupIp`: 3 / 30 days
  - `authLoginIp`: 10 / 10 minutes
  - `authResendIp`: 6 / 10 minutes

## 7) Usage quota enforcement
- Server-side only via `consume_user_quota`.
- `user_usage` has no user `UPDATE` policy (prevents client-side quota tampering).
- Enforced inside transcript extraction route:
  - `POST /api/transcript/extract`
  - alias: `POST /api/transcripts/extract`
- Quota fields returned by `/api/me` and transcript responses:
  - `monthlyQuota`
  - `usedThisMonth`
  - `monthlyQuotaRemaining`
  - `quotaLastResetAt`
  - `quotaNextResetAt`

## 8) Environment variables
### Backend / Vercel (required)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `TURNSTILE_SECRET_KEY`
- `ADMIN_TOKEN_SECRET`

### Frontend (required)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_TURNSTILE_SITE_KEY`

### Optional
- `VITE_API_URL` (leave empty in production same-origin deploy)
- `ALLOWED_ORIGINS` (comma-separated allow list)
