# Changelog

## 2026-10-19 — Data-layer hardening: stale-while-error, honest states, global padding fix, CI gates

### Data layer

- **Last-good (stale-while-error) fallback** — new `lib/api/last-good.ts`. Every provider fetch runs
  through `fetchWithLastGood`: successful non-empty responses are cached in a module-global
  last-good store (`provider:endpoint` key); failures serve the last-good payload if it is within
  `VELOR_LAST_GOOD_MAX_AGE_MS` (default 6h) and rethrow otherwise. Empty arrays are never cached,
  so an empty upstream response can never overwrite a good payload.
- **Stale-served detection** — `runWithStaleCollection` (React-safe via `AsyncLocalStorage`)
  threads a per-request stale collector through the snapshot assembler
  (`lib/api/snapshot.ts`), so `snapshot.upstreamStale` is `true` only when at least one sport
  was served from last-good during that request. Concurrent requests cannot cross-mark.
- **HTTP-200 quota detection** — api-sports answers quota exhaustion with HTTP 200 plus a
  non-empty `errors` body. `ApiSportsProvider` now treats "200 + errors" as failure
  (classified `RATE_LIMIT` / `API_ERROR:200` instead of as valid data).
- All four providers (api-sports, basketball, cricket, tennis) route their fetch wrappers
  through `fetchWithLastGood`.

### UI honesty

- **DegradedBanner** (`components/ui/DegradedBanner.tsx`) — gold, `role="status"` banner shown on
  /, /live, /matches, /leagues, /teams, /sports when `snapshot.upstreamStale` or `degraded`,
  with explicit "unavailable sport" lists.
- **DataFreshness** — shows "Last-known data shown." in gold when stale-served; every data page
  surfaces "Updated HH:MM IST · Last successful sync · last-known data shown · data may be delayed".
- **Truthful live indicators** — the permanent "LIVE" pill was removed from navigation and hero
  labels (ENV_LABELS). `LiveHeader` accepts an explicit `liveState` (`live` |
  `degraded` | off); CSS carries `data-state="live"|"degraded"` in `app/globals.css`. The /live
  loading fallback no longer claims "LIVE SYNC ACTIVE" — it now reads "CONNECTING…".
- **No error/empty data baked into the build** — `getSportsSnapshot()` uses `connection()`, so
  every consumer is request-time dynamic; build output confirms all data routes are `ƒ`
  (Dynamic). Only client-only pages (/search, /favorites) remain static.
- /stats and /tennis do not exist as pages; tennis states live under /sports and /live.

### Timezone

- **MatchTime** (`components/ui/MatchTime.tsx`) — hydration-safe client component rendering
  IST plus a "· HH:MM local" suffix settled after mount via `useSyncExternalStore`
  (no `useEffect/setState` hydration hazard). Used in MatchCard and MatchDetail.
- `lib/utils/freshness.ts` gains `formatLocal(iso)`.

### Mobile / accessibility (375px pass)

- **Root-cause CSS fix**: `app/globals.css` had a bare `* { padding: 0; margin: 0 }` reset
  outside any cascade layer. Tailwind v4 emits utilities inside `@layer utilities`, and
  unlayered rules beat all layered rules — the reset silently zeroed every padding/margin
  utility on every element (computed `px-6` = 0px, menu links flush at x=0). Removed; the
  Tailwind v4 preflight already performs the identical reset inside its own layer.
- Verified at 375×812 against live data: /, /live, /matches, /leagues, /teams, /sports —
  no horizontal overflow; degraded banners wrap; match rows, filters, team/league cards
  stack cleanly; desktop (1280) spacing restored/consistent.
- Mobile hamburger menu: opens/closes with `aria-expanded`/`aria-modal`, close button, and
  focus-visible outlines (cyan, `globals.css :focus-visible`) verified by actual Tab presses.

### CI / hygiene

- **CI gates** — `.github/workflows/ci.yml`: `verify` job runs eslint → `tsc --noEmit` →
  `npm test` → `scripts/check-no-public-secrets.mjs` → `npm run build`; `deploy-gate` blocks
  deploys on verify failure.
- **Secret scanner** — `scripts/check-no-public-secrets.mjs` fails the build if
  `NEXT_PUBLIC_*KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL*` literals appear in app/, components/,
  lib/, animations/. Repo verified clean of `NEXT_PUBLIC` secrets.
- Lint now fully clean (0 errors, 0 warnings): removed unused imports/types left in
  `PlayerStatCard`, `lookup.ts`, `MockSportsProvider`, `mockData.ts`, `MatchTabs` OverviewTab;
  replaced a raw `<img>` with a background-image span in CommandPalette.

### Tests

- New `lib/api/last-good.test.ts` (last-good store TTL, empty-response handling, reset hook)
  and `lib/api/providers/api-sports/quota.test.ts` (HTTP-200 quota treated as failure;
  last-good served instead). Provider test suites reset the last-good store in `beforeEach`
  to keep tests hermetic.
- Suite: **436 tests, 125 suites, 0 failures**; eslint 0/0; `tsc --noEmit` clean; production
  build exit 0.
