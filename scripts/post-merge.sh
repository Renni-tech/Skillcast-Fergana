#!/bin/bash
set -euo pipefail
pnpm install --frozen-lockfile
pnpm --filter @workspace/api-server exec prisma generate
node artifacts/api-server/prepare-db.mjs
pnpm run typecheck:libs
