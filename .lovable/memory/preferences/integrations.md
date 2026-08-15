---
name: Integration preferences
description: Always use the user's own third-party accounts (Twilio, Resend, own Stripe keys) instead of Lovable built-in integrations
type: preference
---

# Integration preferences

Always wire third-party services directly with the user's own accounts and API keys. Never use Lovable's built-in/managed equivalents.

- **SMS** — Twilio, called with direct `fetch` from edge functions using the user's credentials.
- **Email** — the user's own provider (Resend/SendGrid style API), not Lovable email.
- **Payments** — if payments ever return, bring-your-own Stripe key, not Lovable-managed payments.
- **AI** — prefer the user's own provider keys over Lovable AI Gateway where a choice exists.

**Why:** the user wants full ownership, portability, and direct billing of every external service.

**How to apply:** store credentials as project secrets and call vendor REST APIs from edge functions. Do not propose Lovable connectors, Lovable email, or Lovable-managed payments.

Note: payments are currently removed entirely — PropertyMate is free (see `mem://constraints/no-paywall`).
