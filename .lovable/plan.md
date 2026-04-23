

# Redesign Auth Screen with Branding + Google Auth

## Summary
Redesign the Login page with clean Investore branding (logo, primary blue, Plus Jakarta Sans font) and add Google OAuth sign-in alongside the existing email/password flow. The page will toggle between Sign In and Sign Up views.

## Changes

### 1. Update Login page (`src/pages/Login.tsx`)
- Clean, centered layout with Investore branding (BarChart3 icon + "Investore" wordmark)
- Tagline: "Smart property insights for Australian investors"
- Simple card with email + password fields
- Toggle between Sign In / Sign Up (Sign Up adds Name field)
- "Sign in with Google" button with Google icon, separated by an "or" divider
- Minimal design: white card, subtle shadow, primary blue accents

### 2. Add Google OAuth to AuthContext (`src/contexts/AuthContext.tsx`)
- Add `signInWithGoogle` method that calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })`
- Expose it via the context

### 3. User action required
- Google OAuth must be enabled in the Supabase Dashboard under Authentication > Providers > Google
- User will need to configure Google Cloud OAuth credentials (Client ID + Secret) and add them in the Supabase dashboard
- Redirect URL from Supabase must be added to Google Cloud Console authorized redirect URIs

## Technical Details
- No new dependencies needed; Google icon rendered as inline SVG
- Uses existing shadcn Card, Button, Input, Label components
- Keeps existing signUp/signIn logic intact
- Google OAuth uses Supabase's built-in `signInWithOAuth` — no edge function needed

