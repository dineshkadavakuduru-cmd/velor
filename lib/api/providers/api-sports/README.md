# API-Sports Adapter

## Status: Stub — not wired into the application.

The mock provider is the active source for Phase 3.1.

## Activation

1. Create a server-side environment variable:

   ```
   VELOR_API_SPORTS_KEY=your_key_here
   ```

   Do NOT prefix with `NEXT_PUBLIC_`.

2. Update `lib/api/index.ts` to export a factory that reads the key:

   ```ts
   export function createProvider(): SportsProvider {
     const key = process.env.VELOR_API_SPORTS_KEY;
     if (key) {
       return new ApiSportsProvider(key);
     }
     return new MockSportsProvider();
   }
   ```

3. Use `createProvider()` in Server Components.

## Rate limits

Free tier: ~100 requests/day.

Polling recommendation:
- Live fixtures: every 60-90 seconds
- Static data (leagues, teams): cache 24 hours

## Terms

- Keep the key server-side only.
- Do not expose raw API responses in client bundles.
- Do not build a competing public API wrapper.
- Review current terms at https://www.api-football.com/terms.
