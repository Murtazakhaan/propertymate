# Free & Open Access: Remove Login Wall and Payments

PropertyMate becomes fully free. Anyone can take the quiz, see suburb matches, compare suburbs and download reports without signing in. Signing in stays available as an optional extra for people who want their shortlist, notifications and saved reports to follow them across devices.

## What changes for users

- Landing page CTA goes straight to the quiz — no login step.
- Quiz, Results, Compare and suburb reports are open to guests.
- Pricing page, paywall screen and all subscription messaging are gone. Nav no longer shows "Pricing".
- Guests get a shortlist stored in their own browser; a small note invites them to sign in to sync it.
- Account page stays for signed-in users (profile, theme, alert preferences) with the subscription section removed.
- Notifications bell only appears when signed in (notifications are per-account).

## Technical changes

**Routing (`src/App.tsx`)**
- Drop `ProtectedRoute` and `Paywall` wrappers from `/quiz`, `/results`, `/compare`.
- Remove the `/pricing` route.
- Keep `/login` and `/account` (account still guarded by sign-in).

**Deletions**
- `src/pages/Pricing.tsx`, `src/components/Paywall.tsx`, `src/components/ProtectedRoute.tsx`.
- Edge functions: `create-checkout`, `customer-portal`, `check-subscription`, `stripe-webhook` (removed from the repo and undeployed).
- Stripe secrets are left in place, unused, so billing can be restored later without re-entering them.

**Auth context (`src/contexts/AuthContext.tsx`)**
- Remove `subscribed`, `subscriptionStatus`, `cancelAtPeriodEnd`, `subscriptionEnd`, `checkingSubscription`, `refreshSubscription` and the 60s polling interval that calls `check-subscription`.
- Keep session, user, sign in / sign up / sign out.

**UI cleanup**
- `Layout.tsx`: remove Pricing nav link; keep Sign in / Account controls.
- `Index.tsx`: CTAs link to `/quiz` unconditionally; remove any "subscribe" copy.
- `Account.tsx`: remove subscription card and manage-billing button.
- `Results.tsx` / `useResults.ts`: shortlist writes to `localStorage` when there is no user (DB when signed in); no redirect to `/login`.

**Database**
- Add an anon-readable policy so guests can load their own submission by id: `SELECT` on `quiz_submissions` for rows where `user_id IS NULL`, plus `GRANT SELECT ON public.quiz_submissions TO anon`. `suburb_results` and `property_listings` are already publicly readable.
- `analyze-suburbs` already stores `user_id` as NULL for guests and derives it from the bearer token when signed in — unchanged.

## Out of scope
- Email/SMS alert integrations (still awaiting Twilio/Resend keys).
- Google OAuth setup.
