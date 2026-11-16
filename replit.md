# SkillCast

Career forecasting and reskilling proof of concept imported from Vercel. The original app is preserved at `/skillcast/`; the pre-existing SkillCast Fergana app remains at `/`.

## Run and verify

- Start the managed `artifacts/skillcast: web` and `artifacts/api-server: API Server` workflows.
- The existing root app uses `artifacts/skillcast-fergana: web`.
- Use Node.js 24 and pnpm workspaces. Do not run a root `pnpm dev`.
- `pnpm --filter @workspace/skillcast test` runs the 47 imported HR, translation, and market-evidence regression tests using Bun.
- `pnpm run typecheck:libs` builds shared declarations.
- `pnpm --filter @workspace/skillcast run typecheck` checks the migrated frontend.
- `pnpm --filter @workspace/api-server run typecheck` checks the backend.
- `pnpm --filter @workspace/api-spec run codegen` regenerates the API clients and validation schemas.

## Layout

- `artifacts/skillcast/`: original React app converted to Vite, preserving the original screens, Tailwind styles, Geist fonts, translations, local profile storage, and matching logic.
- `artifacts/api-server/`: shared Express backend. Four original API paths: `/api/signals` (GET/POST), `/api/signals/cron`, `/api/coach`, `/api/extract-cv`.
- `artifacts/api-server/src/skillcast/`: imported signal ingestion, taxonomy and Prisma logic.
- `artifacts/api-server/prisma/schema.prisma`: original SQLite schema.
- `lib/api-spec/openapi.yaml`: API contract; generated helpers live in the existing shared API packages.
- `.migration-backup/`: reference copy of the import; excluded from deployment.

## Storage and optional services

- Preserve SQLite rather than silently moving the imported store to PostgreSQL. Backend startup initializes `artifacts/api-server/db/skillcast.db` without destructive schema flags.
- SQLite contains only rebuildable market-signal runs, snapshots, and changelog entries. This local cache is not a durable shared store across published instances or republishes.
- Profiles, learning progress, and preferences remain in browser localStorage, as in the imported app. There are no user accounts or cross-device profile sync.
- RunPod inference is optional: `RUNPOD_API_KEY` and `RUNPOD_ENDPOINT_ID` enable the existing model service. Without these, the original browser extractor and deterministic coach template are explicitly disclosed as fallbacks.
- `CRON_SECRET` optionally enables the protected ingestion endpoint; without it that endpoint returns 501. Normal signal retrieval and refresh do not require it.
- Public job feeds work without credentials, with the original clearly labelled seeded fallback if all feeds fail.

## Verification limits

Desktop and phone screenshots, API requests, the imported regression suite, and frontend/backend type checks were verified during migration. The interactive testing service was unavailable, so a full click-through browser journey was not verified.
