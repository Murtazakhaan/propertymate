---
name: Free access model
description: PropertyMate is fully free and open — no login wall, no payments, no paywall. Sign-in is optional and only used for syncing shortlist, notifications and saved reports across devices.
type: constraint
---
# Free Access Model

PropertyMate is intentionally free and open to all users. The quiz, suburb recommendations, compare tools, suburb reports and shortlist features must remain accessible without requiring authentication or payment.

## What this constraint forbids
- **Login wall**: Do not require sign-in to use the quiz, view results, compare suburbs, download reports or manage a shortlist.
- **Payments**: Do not charge users for any PropertyMate feature.
- **Paywall screens**: Do not add prompts to upgrade, subscribe or unlock content.
- **Pricing page**: Do not add a `/pricing` route or subscription pricing UI.
- **Stripe billing functions**: Do not re-add Edge Functions or UI for checkout, customer portal, subscription checks or Stripe webhooks.

## What is still allowed
- Optional sign-in for users who want cross-device sync of their shortlist, notifications and saved reports.
- Account page for signed-in users to manage profile, theme and alert preferences.
- Guest shortlist stored in `localStorage` with a small note inviting sign-in to sync.
- Notifications bell shown only when signed in.

## Why
The product is currently positioned as a free lead-generation and research tool. Charging users is out of scope unless the business model changes explicitly.
