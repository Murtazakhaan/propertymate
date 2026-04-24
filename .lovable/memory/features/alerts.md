---
name: Multi-channel alerts
description: SMS via Twilio, email via Resend, in-app via Supabase Realtime. send-alert edge function fans out per user prefs.
type: feature
---
# Alerts

## Channels
- **In-app**: `notifications` table + `useNotifications` hook with Supabase Realtime subscription. NotificationBell in header shows unread count + popover.
- **Email**: Resend REST API (`RESEND_API_KEY`, `RESEND_FROM_EMAIL` secrets). No Lovable email connector.
- **SMS**: Twilio REST API (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`). User's E.164 phone in `notification_preferences.phone_e164`.

If a channel's secrets aren't set, send-alert silently skips it (logs `skipped: true`). The user can finish setup later without breaking flows.

## Tables
- `notification_preferences` — per-user toggles + phone + frequency.
- `notifications` — per-user feed, RLS scoped to user_id.
- `match_alert_criteria` — saved searches that drive future listing alerts.

## Trigger points
- `analyze-suburbs` end → invokes `send-alert` with `type: new_match`.
- `generate-suburb-report` end → inserts `report_ready` notification directly.

## User actions required
Add the 5 secrets (Twilio + Resend) for SMS/email to actually fire. In-app works regardless.
