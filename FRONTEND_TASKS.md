# Frontend Development Tasks

## Task 1: Setup Task Board
- [x] Create a tracked task board file with execution order.

## Task 2: Language and Text Integrity
- [x] Replace corrupted Arabic strings (`????`) with proper Arabic copy.
- [x] Add safe i18n fallback logic for any broken Arabic text.
- [x] Verify bilingual output on key screens (`Landing`, `Auth`, `Workspace`, `Billing`).

## Task 3: Auth and Account Flow
- [x] Keep app access gated by real session state only.
- [x] Handle sign-up with email confirmation cleanly (no false login state).
- [x] Add password reset flow in auth modal.
- [x] Use `/api/me` as source of truth for credits/account state.

## Task 4: UX Cleanup
- [x] Replace blocking alerts in critical paths with toast notifications.
- [x] Reduce noisy/technical error states and present user-friendly messages.
- [x] Keep local/dev server controls hidden in production mode.

## Task 5: Workspace and Account UI
- [x] Add lightweight account panel/section (email + credits + session state).
- [x] Improve header action hierarchy and spacing.
- [x] Validate mobile layouts for auth, workspace, and billing modal.

## Task 6: Verification and Deployment
- [x] Run `npm run lint --prefix frontend`.
- [x] Run `npm run build --prefix frontend`.
- [x] Commit, push, deploy to Vercel production.
- [x] Smoke test key flows: login, transcript extract, AI process, chat.

## Task 7: UX Production Test Sprint
- [x] Prepare a repeatable production UX checklist and test script.
- [x] Validate `Home load` on production domain.
- [x] Validate `Extract transcript` on production.
- [x] Validate `Chat` on production.
- [x] Validate `AI process` unauthenticated behavior (expect 401).
- [x] Validate `Top-up request` unauthenticated behavior (expect 401).
- [x] Validate `Sign up` flow behavior on Supabase production.
- [x] Validate `Sign in` failure/success UX handling.
- [x] Validate `Forgot password` flow behavior.
- [x] Publish test report in repository.

## Task 8: Design Sprint (Landing + Auth UI)
- [x] Redesign `LandingPage` visual direction (bold modern look, clear value proposition).
- [x] Redesign `AuthModal` UX (layout, feedback states, bilingual readability).
- [x] Improve global typography and visual tokens for Arabic + English.
- [x] Validate responsive behavior for mobile and desktop.
- [x] Run lint/build and ship to production.

## Task 9: Client IA Restructure + Logout Fix
- [x] Split logged-in UX into dedicated pages (`Overview`, `Extract`, `History`, `Account`).
- [x] Add explicit client navigation header and action hierarchy.
- [x] Refactor extraction flow into dedicated workspace section.
- [x] Add a dedicated account page for customer profile and actions.
- [x] Fix logout flow with resilient state reset + explicit feedback.
