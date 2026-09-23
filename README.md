# VELOR

Premium live-sports command center.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Sports Data Configuration

VELOR uses a provider-agnostic sports data layer. The active provider is controlled by environment variables.

### Mock mode (default)

```text
VELOR_SPORTS_PROVIDER=mock
VELOR_API_SPORTS_KEY=
```

This uses deterministic local mock data. No external API calls are made. This is the safest default for local development.

### Real API mode

```text
VELOR_SPORTS_PROVIDER=api
VELOR_API_SPORTS_KEY=your_api_key_here
```

This activates the API-Sports (API-Football) provider.

- The API key is read server-side only.
- Do **not** prefix the key with `NEXT_PUBLIC_`.
- Do **not** commit real keys to version control.
- The `/live` page calls `GET https://v3.football.api-sports.io/fixtures?live=all` server-side.
- Responses are normalized into VELOR domain models before reaching the UI.

### Available pages

- `/` — home shell with 3D hero
- `/live` — live matches
- `/matches` — match listing with optional filtering
- `/match/[id]` — individual match detail

## Deployment

### Vercel

1. Set the following environment variables in your Vercel project settings:
   - `VELOR_SPORTS_PROVIDER=api`
   - `VELOR_API_SPORTS_KEY=<your-server-side-secret>`

2. Deploy. Next.js will automatically build and serve the application.

3. Ensure `VELOR_API_SPORTS_KEY` is set only in **Production** and **Preview** environments, not publicly.

### Docker / Self-hosted

Build and run the application with the required environment variables:

```bash
docker build -t velor .
docker run -p 3000:3000 \
  -e VELOR_SPORTS_PROVIDER=api \
  -e VELOR_API_SPORTS_KEY=<your-server-side-secret> \
  velor
```

Or using a `.env` file:

```bash
# .env
VELOR_SPORTS_PROVIDER=api
VELOR_API_SPORTS_KEY=<your-server-side-secret>
```

```bash
npm run build
npm start
```

## Security Notes

- `VELOR_API_SPORTS_KEY` is a **server-side** secret.
- Never use `NEXT_PUBLIC_VELOR_API_SPORTS_KEY` — this would expose the key to the browser.
- The key is never returned to client components or logged.
- All API calls are made from Server Components or server-side provider code.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is on the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
