# VELOR — Live Sports Command Center

VELOR is a premium, cinematic live-sports intelligence platform and command center built with Next.js App Router, React 19, TypeScript, Tailwind CSS, Motion, and Three.js / React Three Fiber.

It delivers real-time sports intelligence, live scores, match schedules, standings, squad information, head-to-head metrics, and cross-sport analytics with zero visual noise.

---

## Features

- **Multi-Sport Command Center**: Unified telemetry across Football, Basketball, Cricket, and Tennis.
- **Provider-Agnostic Architecture**: Decoupled domain models with a central provider registry supporting both real API providers (API-Sports, SportsAPI Pro) and local deterministic mock data.
- **Real-Time Live Command**: Filterable live fixtures with state badges (live, halftime, scheduled, finished, postponed), period breakdowns, and derived metrics.
- **Interactive Match Detail**: Match header, live timeline events (goals, cards, substitutions), head-to-head statistics, and tactical starting lineups.
- **Standings & Team Dossiers**: Full competition tables, recent form tracker, goal differentials, and upcoming team fixtures.
- **Global Search & Discovery**: Fast, debounced search across teams, leagues, and matches with keyboard navigation (↑/↓/Enter/Esc).
- **Personalized Favorites**: Real-time cross-tab synchronized favorites for teams, leagues, and matches with zero layout shift.
- **Cinematic 3D Hero Experience**: Interactive 3D Command Core built with Three.js / React Three Fiber, lazy-loaded with graceful fallbacks and reduced-motion support.
- **Resilient Reliability**: Granular error boundaries (`error.tsx`, `global-error.tsx`), 404 signal-lost screens (`not-found.tsx`), SEO robots/sitemaps, and strict CSP/security headers.

---

## Route Architecture

| Route | Purpose | Rendering Mode |
| :--- | :--- | :--- |
| `/` | Command center hero with 3D core, live feed, upcoming matches, popular leagues & teams | Static (ISR 1m) |
| `/live` | Dedicated live matches feed grouped by status and competition | Static (ISR 1m) |
| `/matches` | Full fixture schedule with multi-sport, date, status, and league filters | Dynamic (SSR) |
| `/match/[id]` | Comprehensive match intelligence, timeline events, stats & lineups | Dynamic (SSR) |
| `/sports` | Supported sports directory with active competition and match counts | Static (ISR 5m) |
| `/leagues` | Competitions directory with multi-sport filtering and search | Static (ISR 5m) |
| `/league/[id]` | League details, full standings table, and competition fixture schedule | Dynamic (SSR) |
| `/teams` | Global teams directory with search and sport filtering | Static (ISR 1d) |
| `/team/[id]` | Team dossier, competition position, 5-match form guide & schedule | Dynamic (SSR) |
| `/favorites` | Bookmarked matches, teams, and leagues with local storage sync | Client |
| `/search` | Global search command interface | Client |
| `/api/search` | Cross-sport fuzzy lookup endpoint with abort timeout | Route Handler |

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment configuration:

```bash
cp .env.example .env.local
```

#### Mock Mode (Default)
By default, VELOR runs in deterministic mock mode. No external API keys or network requests are required:

```env
VELOR_SPORTS_PROVIDER=mock
VELOR_API_SPORTS_KEY=
```

#### Real API Mode
To stream real live fixtures, activate API mode and supply your provider key:

```env
VELOR_SPORTS_PROVIDER=api
VELOR_API_SPORTS_KEY=your_api_key_here
```

> **Security Note**: Never prefix API keys with `NEXT_PUBLIC_`. All provider integrations execute server-side in Server Components or API Route Handlers.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Testing & Quality Assurance

The codebase includes an extensive automated test suite covering registry dispatch, normalization edge cases, provider diagnostics, derived metrics, and filter sanitization.

```bash
# Run unit & integration test suite (25 suites, 394+ tests)
npm test

# Run ESLint validation
npm run lint

# Verify production Turbopack build
npm run build
```

---

## Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5 (Strict mode)
- **Styling**: Tailwind CSS v4, custom broadcast design tokens
- **3D Graphics**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Animations**: Motion (`motion/react`), Anime.js
- **Icons**: Lucide React
- **Testing**: Node.js Native Test Runner (`node --test`), `tsx`

---

## Design System Tokens

VELOR adheres to a dark cinematic visual language defined in `AGENTS.md`:

- **Background**: `#05070B`
- **Surface 1**: `#0A0F17`
- **Surface 2**: `#101722`
- **Live Cyan**: `#18F0FF`
- **Data Violet**: `#7A5CFF`
- **Highlight Gold**: `#FFB800`
- **Danger Red**: `#FF4567`
- **Success Green**: `#20E080`
