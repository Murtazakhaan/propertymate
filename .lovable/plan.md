

# Investore — Full MVP Build Plan

## Step 0: Connect Supabase
Connect your external Supabase project. This gives us auth, database, and edge functions for the AI-powered suburb analysis.

## Step 1: Foundation & Design System
- Set up Supabase client integration (`@supabase/supabase-js`)
- Update CSS variables for clean professional theme: primary blue (#2563EB), white background, neutral grays
- Add custom colors to Tailwind: `investore-blue`, `investore-green` (growth), `investore-amber` (risk), `investore-red` (higher risk)
- Create shared layout component with header (logo, Beginner Mode toggle, nav) and footer (disclaimer)

## Step 2: Landing Page
- Hero section with headline "Find your next investment suburb in minutes"
- Three value-prop cards (AI-Powered Analysis, Beginner Friendly, Data-Driven)
- CTA button → Start Quiz
- Clean, trustworthy aesthetic

## Step 3: Guided Quiz Wizard (4 steps)
- `QuizProvider` context to hold all answers
- **Step 1** — Goal: First Home / Investment / Not Sure (card selection)
- **Step 2** — Budget: slider ($200K–$2M+), "I don't know" toggle that asks income/deposit/existing home
- **Step 3** — Comfort: interstate openness toggle, home age preference, risk-vs-growth slider
- **Step 4** — Timeline: 0–3 / 3–6 / 6–12 / 12+ months (radio cards)
- Progress bar, back/next buttons, animated transitions via CSS

## Step 4: Supabase Database Schema
- `quiz_submissions` table — stores user quiz inputs (anonymous or auth'd)
- `suburb_results` table — cached suburb analysis results
- `shortlists` table — saved user shortlists (user_id, suburb data)
- `glossary_terms` table — property jargon definitions
- RLS policies for user-owned data

## Step 5: AI Edge Function for Suburb Analysis
- Edge function `analyze-suburbs` that receives quiz inputs
- Uses Lovable AI or OpenAI to generate suburb recommendations with:
  - Match score (0–100), reasoning, risk level, best-for tag
  - Median price, rental range, weekly out-of-pocket estimate
  - Confidence indicator (High/Medium/Low)
- Input guardrails: budget too low → suggest alternatives; conflicting preferences → "Pick 2 of 3" prompt
- Returns structured JSON array of 5–8 suburb recommendations

## Step 6: Results Page — Suburb Cards
- Grid of suburb cards showing match score (circular gauge), key metrics, risk badge, best-for tag
- "Show me the numbers" expandable section with detailed breakdown
- "Compare" button to add to comparison (max 3)
- **Beginner mode**: swaps jargon labels for plain English (e.g., "Vacancy rate" → "How quickly rentals get filled")
- First Home Buyer mode adds: commute/lifestyle tags, liveability score
- Investor mode adds: rent demand, yield/holding cost, risk flags

## Step 7: Compare View
- Side-by-side table comparing 2–3 selected suburbs
- All key metrics aligned in rows for easy scanning
- Highlight best value per row

## Step 8: Save & Shortlist
- "Pick your top 2" flow after results
- Save to Supabase `shortlists` table (requires auth)
- Simple email/password auth flow for saving
- "Generate a buyer plan" button (future — placeholder for now)

## Step 9: Glossary & About Pages
- `/glossary` — searchable list of property terms from `glossary_terms` table, seeded with ~30 common terms
- `/about` — model explanation, data sources, disclaimers

## Routing Structure
```text
/              → Landing page
/quiz          → Guided wizard (steps 1–4)
/results       → Suburb cards + compare
/compare       → Full comparison view
/shortlist     → Saved suburbs
/glossary      → Term definitions
/about         → How it works
/login         → Auth page
```

## Technical Details
- **State management**: React Context for quiz answers + beginner mode toggle
- **Data fetching**: TanStack Query for Supabase calls
- **Animations**: Tailwind + CSS transitions for wizard steps
- **Responsive**: Mobile-first, cards stack on small screens
- **Edge function**: Deno-based, CORS headers, input validation with Zod

## Build Order
1. Supabase connection + foundation/theme
2. Landing page
3. Quiz wizard (UI only, mock submission)
4. Database schema + edge function
5. Results page wired to real AI
6. Compare view
7. Auth + save/shortlist
8. Beginner mode toggle wiring
9. Glossary + About pages

