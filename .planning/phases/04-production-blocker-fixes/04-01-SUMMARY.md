# 04-01 Summary

Plan focus:
- Fix the live `/signup` HTTP 500 without expanding scope

Completed:
- Replaced the deprecated standalone signup page with a redirect to the canonical register flow in `src/pages/signup.tsx`
- Kept register mode explicit in `src/pages/login.tsx`
- Prevented fresh register flows from auto-bouncing to `/dashboard`
- Persisted consent in `src/components/auth/LoginForm.tsx` so new users enter onboarding with the supported beta state

Verification:
- `npm run lint`
- `npx playwright test e2e/tests/01-auth.spec.ts e2e/tests/02-onboarding.spec.ts`
- `curl -I https://sparq-connection-lab.vercel.app/signup`

Outcome:
- The live `/signup` route no longer returns HTTP 500
- Production now redirects `/signup` to `/login?mode=register`
