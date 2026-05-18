PropertyMate
PropertyMate is a modern, high-performance real estate and property management platform designed to streamline property discovery, listing management, and client interactions. Built with a robust, type-safe stack, it ensures a lightning-fast user experience with modular, scalable architecture.

🚀 Features
Property Listings & Search: Advanced filtering, indexing, and debounced/throttled search inputs for instantaneous local and server-side property matching.

Authentication & Role Management: Secure user signup, login, and role-based access control (e.g., Tenants, Landlords, Agents) powered by Supabase.

Dynamic Dashboards: Intuitive dashboards tailored to user roles to track listings, viewing requests, and property metrics.

Responsive & Accessible UI: Clean, beautiful interface built with Tailwind CSS and fully accessible Shadcn UI primitives.

Robust Testing: Full-coverage E2E testing integration using Playwright alongside rapid unit/component testing via Vitest.

🛠️ Tech Stack
Frontend Core: React 18+ (via Vite)

Language: TypeScript (Strict Type Safety)

Styling & UI Components: Tailwind CSS, PostCSS, and shadcn/ui

Backend & Database: Supabase (PostgreSQL, Authentication, Realtime, Storage)

Package Manager & Runtime: Bun

Testing Suites: Playwright (End-to-End) & Vitest (Unit/Component Integration)

AI Development Integration: Powered and accelerated by Lovable

📁 Repository Structure
Plaintext
├── .lovable/               # Lovable configuration and history tracking
├── public/                 # Static assets (favicons, public images)
├── src/                    # Main application source code
│   ├── components/         # Reusable UI components (shadcn primitives + custom layout)
│   ├── hooks/              # Custom React hooks (state, fetchers, optimization hooks)
│   ├── lib/                # Shared utilities, performance wrappers, and client initializers
│   └── utils/              # Utility functions (debouncing, throttling, tracking)
├── supabase/               # Backend migrations, database schemas, and edge functions
├── .env                    # Local environment configuration variables
├── components.json         # Shadcn UI configuration file
├── playwright.config.ts    # End-to-End testing engine configurations
├── tailwind.config.ts      # Global theme extensions and style rules
├── tsconfig.json           # Global TypeScript configuration setup
└── vitest.config.ts        # Unit test configuration runner
⚙️ Getting Started
Follow these steps to set up the project locally on your machine.

Prerequisites
Ensure you have Bun installed globally on your system. If not, install it via:

Bash
curl -fsSL https://bun.sh/install | bash
Installation
Clone the repository:

Bash
git clone https://github.com/Murtazakhaan/propertymate.git
cd propertymate
Install dependencies:

Bash
bun install
Configure Environment Variables:
Duplicate the template environment file or populate .env with your Supabase credentials:

Code snippet
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
Start the development server:

Bash
bun dev
Your app will now be running locally at http://localhost:5173.

🧪 Testing & Code Quality
Maintain high performance and bug-free updates using the integrated testing platforms.

Running Unit/Component Tests
Execute lightning-fast component tests inside the Vitest environment:

Bash
bun test
Running End-to-End (E2E) Tests
Spin up the Playwright environment to simulate real user flows across browsers:

Bash
# Install required browser binaries first (if running for the first time)
bunx playwright install

# Run tests
bun test:e2e
Linting & Formatting
To keep code quality clean and standard according to the shared workspace rules:

Bash
bun lint
💡 Performance Optimization Notes
Recent utilities added to the src/ directory introduce custom performance optimization wraps:

Debouncing & Throttling: Applied heavily to search querying, resize listeners, and map tracking boundaries to prevent unnecessary API over-fetching.

Indexing Utilities: Assists in rapid key-value object mappings for handling large relational arrays (like properties and agent data buckets) efficiently client-side.
