
# Investore — Auth, Payments & Property Alerts

## Phase 1: Authentication
- Wire up Supabase Auth (email/password signup + login)
- Protected routes — require login to access quiz/results
- Profile page for managing account

## Phase 2: Stripe Subscription ($20 AUD/month)
- Enable Stripe integration
- Create subscription product
- Paywall after signup — must subscribe to access platform
- Customer portal for managing billing

## Phase 3: Property Alert Preferences
- DB table to store each user's search criteria (budget, suburbs, property type)
- UI to manage alert preferences in their account

## Phase 4: Automated Property Scanning (Weekly)
- Scheduled edge function (weekly via pg_cron)
- Uses Firecrawl to search for new listings matching user criteria
- Stores matched listings in DB

## Phase 5: Notifications
- **Email**: Send "CONGRATULATIONS" match email with link back to account
- **SMS via Twilio**: Send text notification with same message
- Both triggered when new matches are found

## Build Order
1. Auth → 2. Stripe → 3. Alert preferences → 4. Scanning → 5. Notifications

Each phase will be built and tested before moving to the next.
