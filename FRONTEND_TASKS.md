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
