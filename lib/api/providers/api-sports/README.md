# Football Provider (API-Sports Pro)

Football data for VELOR, served by the API-Sports Pro platform at
`https://v2.football.sportsapipro.com`.

## Why this host

The legacy `*.api-sports.io` hosts (and the `/fixtures`, `/games` routes on
them) were retired: they now answer **HTTP 403 for every request**, including
unauthenticated ones. That is what made football and basketball report as
unavailable while cricket and tennis — already migrated to
`*.sportsapipro.com` — kept working. Football and basketball now use the same
platform as cricket and tennis.

`ApiSportsProvider` is a thin binding over `SportsApiProProvider`
(`lib/api/providers/sportsapipro/provider.ts`), which owns all the platform
logic. The config lives in `FOOTBALL_PROVIDER_CONFIG` at the top of
`ApiSportsProvider.ts`.

## Platform notes

- Auth is the `x-api-key` header. Keys stay server-side; the key is never in a
  URL, so last-known-good cache keys are secret-free.
- List routes (`/api/live`, `/api/today`, `/api/schedule/<date>`) are scoped to
  the sport by the subdomain.
- By-id routes (`/api/match/<id>`, `/api/team/<id>`, `/api/tournament/<id>/info`)
  and `/api/search` are **cross-sport gateways**: they resolve an id from any
  sport. Every by-id lookup is guarded (`isForeignSport`) so another sport's
  match/team/league is never mis-attributed to football.
- Live matches are read from `/api/today` filtered to live states. The flat
  `/api/live` feed omits team ids and would produce unaddressable team links.

## Activation

```
VELOR_SPORTS_PROVIDER=api
VELOR_API_SPORTS_KEY=your_key_here
```

Do NOT prefix with `NEXT_PUBLIC_`.

## Rate limits

The key is shared across every sport on the account. A `429` is surfaced
honestly as `RATE_LIMIT` and the sport is reported unavailable (or served from
last-known-good data when available) — VELOR never substitutes sample data.
