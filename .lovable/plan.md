

# Comprehensive Stripe Integration Hardening and Subscription Page Upgrade

## Summary

The project already has a working Stripe BYOK setup with three edge functions (`create-checkout`, `check-subscription`, `customer-portal`) and a basic Pricing/Paywall UI. This plan hardens security, adds a Stripe webhook for real-time subscription state sync, improves input validation, and upgrades the subscription page with full Investore branding.

---

## 1. Add a Stripe Webhook Edge Function

**Why:** Currently subscription status relies on polling every 60 seconds. A webhook gives instant, reliable updates when subscriptions are created, renewed, cancelled, or payment fails.

**New file:** `supabase/functions/stripe-webhook/index.ts`

- Accepts `POST` from Stripe (no JWT required — public endpoint).
- Verifies the Stripe webhook signature using a `STRIPE_WEBHOOK_SECRET` (new secret to add).
- Handles events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
- On relevant events, updates a new `subscriptions` table in the database so the frontend can read subscription state from the DB as a fallback (faster than calling Stripe every time).

**New secret required:** `STRIPE_WEBHOOK_SECRET` — the user will need to create a webhook endpoint in the Stripe Dashboard pointing to `https://lidsdymtwltwsakeyewg.supabase.co/functions/v1/stripe-webhook` and copy the signing secret.

---

## 2. Create a `subscriptions` Database Table

**New migration** to create a server-side source of truth:

```sql
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  status text not null default 'active',
  price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can read own subscription"
  on public.subscriptions for select
  to authenticated
  using (user_id = auth.uid());

create trigger set_updated_at before update on public.subscriptions
  for each row execute function update_updated_at_column();
```

This table is written to by the webhook (using service role) and read by the frontend via RLS.

---

## 3. Harden Existing Edge Functions

### `create-checkout/index.ts`
- Add input validation (Zod) for any future body params.
- Add rate-limit awareness logging.
- Check for existing active subscription before creating a new checkout (prevent duplicate subscriptions).
- Add `subscription_data.metadata` with `user_id` so the webhook can map subscriptions to users.

### `check-subscription/index.ts`
- Add a fallback: first check the local `subscriptions` table; only call Stripe if no record exists (reduces Stripe API calls).
- Return `cancel_at_period_end` so the UI can show "Cancels on..." vs "Renews on...".

### `customer-portal/index.ts`
- Add logging for audit trail.
- No structural changes needed.

### All functions
- Validate `Authorization` header format strictly.
- Return consistent error shapes: `{ error: string, code: string }`.

---

## 4. Update AuthContext for Richer Subscription State

**File:** `src/contexts/AuthContext.tsx`

- Add `cancelAtPeriodEnd: boolean` to context.
- Update `checkSubscription` to first try a Supabase query on the `subscriptions` table, falling back to the edge function.
- Expose `subscriptionStatus` (active, past_due, cancelled) for more granular UI control.

---

## 5. Redesign the Pricing / Subscription Page

**File:** `src/pages/Pricing.tsx` — full redesign with Investore branding.

- Hero section with gradient background using primary blue (#2563EB).
- "Free vs Pro" comparison table (two-column card layout).
- Free tier: limited suburb views, no compare, no shortlist.
- Pro tier ($20 AUD/month): all features listed with check icons.
- Animated "Most Popular" badge on Pro card.
- FAQ accordion section (using existing Accordion component) covering: "Can I cancel anytime?", "How does billing work?", "What payment methods do you accept?", "Is my payment secure?".
- Trust signals: "Powered by Stripe", "256-bit encryption", "Cancel anytime" badges at the bottom.
- Checkout success/cancelled states handled via URL params (same pattern as Paywall).

---

## 6. Update Paywall Component

**File:** `src/components/Paywall.tsx`

- Show "Cancels on [date]" when `cancelAtPeriodEnd` is true instead of "Renews on".
- Add a "Reactivate" flow that links to the customer portal.
- Handle `past_due` status: show a warning banner prompting the user to update payment method.

---

## 7. Update Account Page

**File:** `src/pages/Account.tsx`

- Show subscription status badge: "Active", "Cancelling", or "Past Due" with appropriate colors.
- Display next billing date or cancellation date based on `cancelAtPeriodEnd`.
- Add "Update Payment Method" button (links to customer portal).

---

## 8. Frontend Security Measures

- Sanitize all URL query parameters (`checkout` param) — already safe but will add explicit validation.
- Add CSRF-like protection by passing a `state` parameter through checkout that's verified on return.
- Rate-limit checkout button clicks (disable for 3 seconds after click, already partially done with loading state).

---

## Technical Details

### Files to create
| File | Purpose |
|------|---------|
| `supabase/functions/stripe-webhook/index.ts` | Webhook handler with signature verification |

### Files to modify
| File | Changes |
|------|---------|
| `supabase/functions/create-checkout/index.ts` | Duplicate-sub check, metadata, validation |
| `supabase/functions/check-subscription/index.ts` | DB-first lookup, `cancel_at_period_end` |
| `supabase/functions/customer-portal/index.ts` | Logging improvements |
| `src/contexts/AuthContext.tsx` | Richer subscription state, DB-first check |
| `src/pages/Pricing.tsx` | Full redesign with Free vs Pro comparison |
| `src/components/Paywall.tsx` | Cancellation and past-due handling |
| `src/pages/Account.tsx` | Status badges, payment update button |

### Database migration
- New `subscriptions` table with RLS (users read own rows only).

### New secret
- `STRIPE_WEBHOOK_SECRET` — user must create the webhook in Stripe Dashboard and provide the signing secret.

### Webhook setup instructions for user
After implementation, the user will need to:
1. Go to Stripe Dashboard, Developers, Webhooks.
2. Add endpoint: `https://lidsdymtwltwsakeyewg.supabase.co/functions/v1/stripe-webhook`.
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
4. Copy the signing secret and provide it when prompted.

