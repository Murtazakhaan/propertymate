

## PropertyMate Rebrand + Real Listings + Multi-Channel Alerts + Suburb PDF Report (matched to your sample)

All integrations use **your own external accounts** — no Lovable Cloud / Email / AI Gateway / connectors. Twilio + Resend (or your chosen SMTP) keys go straight into Supabase Edge Function secrets and we call their REST APIs with `fetch`.

---

### Part 1 — Rebrand to PropertyMate

- Replace "Investore" → "PropertyMate" everywhere: `index.html`, `Layout.tsx`, `Login.tsx`, `Paywall.tsx` ("PropertyMate Pro"), `Account.tsx`, `About.tsx`, `Index.tsx`.
- Hero + About rewritten in the data-led brand voice (no hype, no jargon): *"Skip the $10k buyer's agent. Top 3 high-growth suburbs + matching listings, backed by government and infrastructure data."*
- About page restructured around the 5 messaging pillars (Replace the Buyer's Agent / Data-Driven / Clarity / Actionable / Real-Time).
- Rename CSS vars + Tailwind keys `investore-*` → `brand-*` in `src/index.css` and `tailwind.config.ts`. Update the one consumer in `Index.tsx`.

---

### Part 2 — Real listings (no fake addresses)

- `analyze-suburbs` edge function: stop generating addresses. Generate **listing profiles** only — `property_type`, `bedrooms`, `bathrooms`, `price_min`, `price_max`, `expected_weekly_rent`.
- Server-side deterministic URL builders for **realestate.com.au** and **domain.com.au** pre-filtered by suburb + beds + price band. Every "View listing" click lands on a real, currently-listed property.
- Migration: `property_listings` — make `address` nullable; add `bedrooms_min`, `price_min`, `price_max`, `realestate_url`, `domain_url`, `search_label`.
- `Results.tsx` cards show search label (e.g. "3-bed Houses · $750k–$900k") with two outbound buttons: **View on realestate.com.au** and **View on Domain**.

---

### Part 3 — Multi-channel alerts (your own accounts)

Fan out to whichever channels the user enables:

- **SMS — your Twilio.** Secrets: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`.
- **Email — your Resend (or SendGrid / Mailgun).** Secrets: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.
- **In-app — Supabase Realtime** on a `notifications` table (your Supabase, not Lovable infra).

**New tables (migration):**
- `notification_preferences` — `user_id` PK, `sms_enabled`, `email_enabled`, `inapp_enabled`, `phone_e164`, `alert_frequency` (`instant`|`daily`).
- `notifications` — `id`, `user_id`, `type` (`new_match`|`listing_alert`|`report_ready`|`system`), `title`, `body`, `link`, `suburb_result_id?`, `read_at`, `created_at`.
- `match_alert_criteria` — `id`, `user_id`, `suburb`, `state`, `beds_min`, `price_min`, `price_max`, `property_type`, `active`.
- RLS: each user reads/writes only their own rows.

**New edge functions (raw `fetch` to Twilio + Resend):**
- `send-alert` — `{user_id, channels[], type, payload}` → reads prefs, posts SMS to Twilio, posts email to Resend, inserts row into `notifications`.
- `dispatch-match-alerts` — invoked at end of `analyze-suburbs` to send "Your top 3 suburbs are ready" via the user's enabled channels.

---

### Part 4 — Notification bell

`Layout.tsx` header gains `<NotificationBell />`:
- Bell icon + red unread-count badge.
- Click → popover: last 20 notifications (title, time, click → link).
- "Mark all as read" + per-row mark-on-click.
- Supabase realtime subscription on `notifications` for instant updates.
- "Settings" link → `/account` → new **Alert Preferences** card with channel toggles + phone-number input.

---

### Part 5 — Suburb Profile Report (downloadable PDF, matched to your sample)

Reviewed your uploaded `SuburbReport_25656140.pdf`. The PropertyMate report mirrors that structure but PropertyMate-branded.

**Report sections (per suburb):**
1. **Cover** — PropertyMate logo, suburb name, state, postcode, generated date, "Prepared for {user}".
2. **Suburb Snapshot** — median sale price, rental yield, vacancy rate, days on market, capital growth %, population growth %, risk level, "best for" tag.
3. **Why This Suburb** — `suburb_results.reasoning` (AI explanation).
4. **Demographics & Population** — total population, median age, household composition, family vs renter mix (new AI-filled fields).
5. **Suburb History** — narrative on origin, key development phases, recent transformation (new AI field).
6. **Infrastructure & Amenities** — schools count, nearest hospital, train station, shopping centre, current infrastructure projects.
7. **Market Performance** — house vs unit weekly rent, rental range, 5-yr capital growth, stamp duty estimate.
8. **Investment Maths** — weekly out-of-pocket breakdown (loan repayment − rent − costs).
9. **Matching Listings** — the 4 listing-profile cards with **realestate.com.au + Domain** search URLs as clickable links.
10. **Footer** — data sources (ABS, infrastructure registers, realestate.com.au, Domain), generated date, "Not financial advice."

**Implementation:**
- New edge function `generate-suburb-report` — fetches suburb data, calls **your existing Gemini key** (already used by `analyze-suburbs`) once to fill demographics + history, builds HTML, renders to PDF using a Deno-compatible HTML-to-PDF lib, streams the PDF back as a download.
- New columns on `suburb_results`: `population_total`, `median_age`, `household_composition`, `suburb_history`. Backfilled by `analyze-suburbs` going forward; older rows lazy-fill on first report request.
- `Results.tsx`: per-suburb **"Download Suburb Report"** button → calls function → triggers browser download of `PropertyMate-{suburb}-Report.pdf`. Drops a `report_ready` notification into the bell on success.
- Gated to Pro subscribers (uses existing `Paywall` check).

---

### Files touched / created

```text
# Rebrand + real listings
index.html, src/index.css, tailwind.config.ts
src/components/Layout.tsx, src/components/Paywall.tsx
src/pages/Login.tsx, src/pages/Index.tsx, src/pages/About.tsx,
src/pages/Account.tsx, src/pages/Results.tsx
supabase/functions/analyze-suburbs/index.ts
supabase/migrations/<new>__listing_profiles_and_suburb_extras.sql

# Alerts + bell
src/components/NotificationBell.tsx                 (new)
src/components/AlertPreferencesCard.tsx             (new — embedded in Account)
src/hooks/useNotifications.ts                       (new — realtime)
supabase/functions/send-alert/index.ts              (new — Twilio + Resend via fetch)
supabase/functions/dispatch-match-alerts/index.ts   (new)
supabase/migrations/<new>__notifications_and_preferences.sql

# Suburb report
supabase/functions/generate-suburb-report/index.ts  (new — uses your Gemini key)
src/components/SuburbReportButton.tsx               (new)

# Memory
mem://index.md, mem://features/alerts (new), mem://features/suburb-report (new)
```

### User actions required (your own services only)
1. **Twilio (your account)** — add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` as Supabase Edge Function secrets.
2. **Resend (your account)** — add `RESEND_API_KEY` and `RESEND_FROM_EMAIL`. (SendGrid/Mailgun/SES work the same — same pattern, swap the key names.)
3. **Gemini key** — already configured; the report function reuses it.

### Out of scope
- Real-time scraping of new listings on realestate.com.au / Domain — no public API and ToS forbids scraping. Compliant deep-link searches give live data.
- Mobile push — covered by SMS + email + in-app bell.

