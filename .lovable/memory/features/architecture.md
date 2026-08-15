---
name: App architecture
description: PropertyMate MVP structure — quiz wizard, AI suburb analysis, compare, shortlist, notifications
type: feature
---

# PropertyMate architecture

Free-access Australian property research app. No sign-in required for core features.

## Core flow
1. **Quiz wizard** (`/quiz`) — collects goal, budget, location preference, timeline. Saved to `quiz_submissions` (guests stored with `user_id = null`).
2. **AI suburb analysis** — edge function scores suburbs against the submission and returns matches with filtered search links to Realestate.com.au and Domain (never invented street addresses).
3. **Results** (`/results`) — reads `?sid=<submission id>`; falls back to the latest submission (with an "Opened latest match" toast plus a Goal badge). `sid` + goal are cached in localStorage for refresh consistency; invalid cache is cleared and re-fetched.
4. **Compare** (`/compare`) — side-by-side suburb comparison with a dedicated mobile layout.
5. **Shortlist** — persisted per user; guests use a localStorage shortlist.
6. **Account** (`/account`) — the only auth-gated route (`RequireAuth`); profile details and theme preference.

## Cross-cutting
- **Beginner Mode** swaps jargon for plain English across all pages.
- **Theme** light/dark toggle; persisted to `profiles.theme_preference` for signed-in users, localStorage otherwise. ThemeContext must stay decoupled from AuthProvider.
- **Notifications** in-app bell backed by realtime `notifications` table; each notification deep-links via `sid`.
- **Suburb reports** PDF generation via the `generate-suburb-report` edge function.
- Backend is an **external Supabase connection**, not Lovable Cloud.
