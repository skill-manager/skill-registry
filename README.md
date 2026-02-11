# skill-registry

API service that powers `enskill publish` authentication and pull request publishing.

## Endpoints

- `POST /api/v1/auth/start`
- `POST /api/v1/auth/poll`
- `GET /api/v1/auth/session`
- `GET /api/v1/auth/callback`
- `POST /api/v1/publish`

## Environment

Copy `.env.example` to `.env.local` and fill all required GitHub App values.

```bash
cp .env.example .env.local
```

Required values:

- `APP_BASE_URL`
- `GITHUB_APP_ID`
- `GITHUB_APP_CLIENT_ID`
- `GITHUB_APP_CLIENT_SECRET`
- `GITHUB_APP_PRIVATE_KEY`

## Local development

```bash
pnpm install
pnpm dev
```

In `enskill`, point publish requests to this app:

```bash
export ENSKILL_PUBLISH_API_URL=http://localhost:3000/api
```

Then from a skill project:

```bash
npx enskill publish
```

## Notes

- Current auth/publish session storage is in-memory (module/global map). This is fine for local dev and single-instance deployments.
- For production multi-instance deployments, move auth sessions and access tokens to Redis or another shared store.
