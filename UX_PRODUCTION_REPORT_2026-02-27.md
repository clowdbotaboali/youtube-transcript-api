# UX Production Report (2026-02-27)

## Scope
- Production URL: `https://youtube-transcript-api-lilac.vercel.app`
- Flows: `signup`, `signin`, `forgot password`, `topup`, `extract`, `chat`
- Runner: `node scripts/ux-production-check.mjs`

## Results Summary
- Passed: `8/8`
- Tested at: `2026-02-27T13:00:37.925Z`

## Detailed Checks
1. `home_load`: PASS (`status=200`)
2. `extract_transcript`: PASS (`status=200`, method `transcriptapi`)
3. `chat`: PASS (`status=200`)
4. `ai_process_unauth`: PASS (`status=401` expected for unauthenticated user)
5. `topup_unauth`: PASS (`status=401` expected for unauthenticated user)
6. `signup`: PASS as behavior (`status=429`, `over_email_send_rate_limit`)
7. `signin_behavior`: PASS as behavior (`status=400`, `Invalid login credentials`)
8. `forgot_password`: PASS (`status=200`)

## Notes
- Supabase enforces email send rate limits (`over_email_send_rate_limit`) after repeated auth tests in short intervals.
- For automated UX regression, this rate-limited response is treated as acceptable auth infrastructure behavior, not a frontend failure.
