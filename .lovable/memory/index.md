# Project Memory

## Core
PropertyMate (rebranded from Investore). Brand purpose: replace the $10k buyer's agent with data.
Clean professional theme. Primary blue #2563EB. Plus Jakarta Sans font. CSS tokens use `--brand-*` (not `--investore-*`).
External Supabase connection (not Lovable Cloud). Quiz → AI suburb recommendations.
Beginner Mode toggle swaps jargon for plain English across all pages.
Prefer third-party integrations (Twilio for SMS, Resend for email, own Stripe). NO Lovable Cloud connectors.
Property listings are listing PROFILES (type/beds/price band) deep-linked to realestate.com.au + Domain — never invented street addresses.

## Memories
- [App architecture](mem://features/architecture) — PropertyMate MVP: quiz wizard, AI suburb analysis, compare, shortlist
- [Integration preferences](mem://preferences/integrations) — Twilio for SMS, Resend for email, Stripe BYOK
- [Multi-channel alerts](mem://features/alerts) — SMS+email+in-app via send-alert edge function, NotificationBell, prefs in Account
- [Suburb profile report](mem://features/suburb-report) — generate-suburb-report HTML→print PDF matching reference sample
