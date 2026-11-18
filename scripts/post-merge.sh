#!/bin/bash
set -euo pipefail
pnpm install --frozen-lockfile
node artifacts/api-server/prepare-db.mjs
pnpm run typecheck:libs
