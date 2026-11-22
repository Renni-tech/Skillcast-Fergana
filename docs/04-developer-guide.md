# 4. Installation and developer guide

## 4.1 Prerequisites

| Tool | Version | Why |
| --- | --- | --- |
| Node.js | **24 LTS** recommended; **22.13+** required | The API uses Node's built-in SQLite (`node:sqlite`) |
| pnpm | **10** (lockfile made with 10.28) | Workspace manager; `npm`/`yarn` are blocked by `scripts/preinstall.mjs` |
| Git | any recent | |
| Disk | ~1.5 GB free for the first install | `node_modules` ≈ 600 MB plus the pnpm store |
| Optional | Bun 1.x | Runs the frontend unit tests (`bun test`) |
| Optional | Chrome + Playwright | Browser end-to-end test |

```bash
npm install -g pnpm@10
```

Tested on Linux (full run). Windows is supported by the scripts (path handling, process shutdown, PowerShell notes)
and was reported working; macOS is expected to work but has not been tested.

## 4.2 Install and run

```bash
git clone https://github.com/Renni-tech/Skillcast-Fergana.git
cd Skillcast-Fergana
git checkout fergana-sources-i18n     # active development branch
pnpm install
pnpm dev
```

`pnpm dev` (`scripts/dev.mjs`):
1. builds the API with esbuild;
2. prepares `artifacts/api-server/db/`;
3. starts the API on **8080** and waits for `/api/healthz`;
4. starts Vite on **5173** with `/api` proxied to the API.

```
  SkillCast Fergana is running
  Frontend  http://localhost:5173/
  API       http://localhost:8080/api/healthz
```

Ctrl+C stops both. The frontend hot-reloads; restart `pnpm dev` after API changes (the API is rebuilt on start).
To test on a phone on the same Wi-Fi, set `HOST=0.0.0.0` in `.env` and open the printed "On Wi-Fi" address.

### Windows and VS Code

1. **File → Open Folder…** and choose the `Skillcast-Fergana` folder.
2. **Terminal → New Terminal** (PowerShell).
3. Run `pnpm install` the first time, then `pnpm dev`.
4. Ctrl+click `http://localhost:5173/` in the terminal.

Copy the example environment file with `Copy-Item .env.example .env` in PowerShell. After Ctrl+C, Windows may ask
`Terminate batch job (Y/N)?`; type `Y` (both servers are already stopped). If either server crashes, `pnpm dev` stops the
other one too.

### Running pieces separately

```bash
# API only
PORT=8080 pnpm --filter @workspace/api-server run dev
# Frontend only (Vite requires PORT and BASE_PATH)
PORT=5173 BASE_PATH=/ API_PROXY_TARGET=http://127.0.0.1:8080 pnpm --filter @workspace/skillcast-fergana run dev
```

## 4.3 Environment setup

Nothing is required for local development. Copy `.env.example` to `.env` only to change ports or enable optional
services (see the full table in [03-architecture.md](03-architecture.md#310-configuration)).

```dotenv
# .env (git-ignored; never commit real keys)
WEB_PORT=5173
API_PORT=8080
HOST=127.0.0.1
LOG_LEVEL=info
# Optional AI (CV extraction, narration, open questions)
# RUNPOD_API_KEY=...
# RUNPOD_ENDPOINT_ID=...
# Optional speech providers (Edge neural voices work without a key)
# OPENAI_API_KEY=...
# GOOGLE_TTS_API_KEY=...
# TTS_PROVIDER=edge          # or "off"
# CRON_SECRET=...            # enables GET /api/signals/cron
```

Without any keys the app is fully usable: AI features use deterministic fallbacks, and speech uses free Edge voices when
the server can reach `speech.platform.bing.com`, otherwise the browser's voice.

## 4.4 Running tests

| Command | What |
| --- | --- |
| `pnpm run typecheck` | Type checks every package (libs via `tsc --build`, then each artifact) |
| `pnpm --filter @workspace/skillcast-fergana test` | Frontend unit/integration suites (Bun) |
| `pnpm run test:api` | API tests: SQLite store (Node test runner), Fergana signals and assistant (Bun) |
| `pnpm run test:dev` | `pnpm dev` helper tests |
| `pnpm --filter @workspace/skillcast test` | Original SkillCast app |
| `pnpm --filter @workspace/skillcast-fergana e2e` | Browser end-to-end check (needs the app running and Playwright) |

Single file: `cd artifacts/skillcast-fergana && bun test tests/demo-day.test.ts`. Details and current results are in
[06-testing.md](06-testing.md).

## 4.5 Production build

```bash
pnpm run build                                   # typecheck + build every package
# or just the product, the way Replit does it:
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/skillcast-fergana run build
#   → artifacts/skillcast-fergana/dist/public/
PORT=4173 BASE_PATH=/ pnpm --filter @workspace/skillcast-fergana run serve   # preview the build
pnpm --filter @workspace/api-server run build    # → artifacts/api-server/dist/index.mjs
PORT=8080 pnpm --filter @workspace/api-server run start
```

The frontend build warns about chunks over 500 kB (the main bundle is about 2.1 MB, 630 kB gzipped) and prints
"sourcemap" notices for files with `'use client'` directives. Both are known and harmless; code-splitting is on the
roadmap.

## 4.6 Common tasks

| Task | Where |
| --- | --- |
| Add or change a role | `src/data/roles.ts` (and `artifacts/api-server/src/skillcast/data/roles.ts` if the API needs it); add SDG copy in `src/lib/catalog-i18n.ts` |
| Add a skill | `src/data/skills.ts`, translations in `catalog-i18n.ts` (`SKILL_COPY`); API list in `api-server/src/skillcast/data/skills.ts` for momentum |
| Add a course | `src/data/courses.ts`, titles in `src/lib/course-i18n.ts` |
| Add a place to learn | `src/data/catalog/resources.json` (rebuild) or `public/catalog/extra.json` (no rebuild); see `src/data/catalog/README.md` |
| Add UI text | Add the key in all three languages (`en`, `uz`, `ru`) in a `*-i18n.ts` copy table; Uzbek Cyrillic is generated. The parity test fails otherwise. |
| Change the API contract | Edit `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen`, then `pnpm run typecheck` |
| Change a badge | `src/lib/achievements.ts` (rules) and `src/lib/silk-badges-i18n.ts` / `quality-i18n.ts` (copy) |

## 4.7 Troubleshooting

| Problem | Fix |
| --- | --- |
| `Use pnpm instead` | Install with `pnpm install`. |
| `vite: not found` / dependencies missing | `pnpm install` in the repository root. |
| `PORT environment variable is required` or `BASE_PATH ... is required` | Set both when running Vite directly, including for `vite build`. |
| `Node.js 22.13 or newer is required` / `node:sqlite` not found | Install Node 24 LTS, reopen the terminal. |
| Port 8080 or 5173 in use | Change `API_PORT`/`WEB_PORT` in `.env`; on Windows `netstat -ano \| findstr :8080`. |
| `Cannot find module @rollup/rollup-…` | Delete `node_modules`, run `pnpm install` on the machine that runs the app. |
| `ENOSPC` | Free disk space; on Windows you can point `TEMP`/`TMP` to another drive for the session. |
| PowerShell blocks `pnpm.ps1` | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or use Command Prompt. |
| Signal sources "Unavailable" | Expected when sources are unreachable; the app shows the cached copy or a labelled baseline. |
| "Explain in more detail" errors in Uzbek | Known bug: `/api/coach` rejects `lang: "uz"` (see [03-architecture.md](03-architecture.md#34-api-reference)). |
| The assistant does not speak | Check `POST /api/tts` (needs the API and network access to a speech provider). The answer is always shown as text. |
| "Something went wrong … Missing en translation for …" | A component passed text that is not a translation key to `t()`; add the key or stop translating twice. |
| The favicon still shows the old icon | Browsers cache favicons; hard-refresh or open the icon URL once. |
| `EPERM` / `EBUSY` while building | Another process holds a file: close other terminals running SkillCast (or wait for an antivirus scan), then run `pnpm dev` again. |
| Windows Firewall asks about Node.js | Only with `HOST=0.0.0.0`. Allow **Private networks** to test from a phone. |
| `pnpm` is not recognized | `npm install -g pnpm@10`, then open a new terminal. |
| Old Prisma engine cache on Windows | Earlier versions downloaded Prisma engines (`%APPDATA%\Prisma` or `%LOCALAPPDATA%\Prisma`); they are no longer used and can be removed. An existing `skillcast.db` keeps working. |

## 4.8 Git workflow and contributing

- **Branches**: `main` is the release branch. Work happens on feature branches (currently `fergana-sources-i18n`) and
  reaches `main` through pull requests. Do not commit or push directly to `main`; never force-push shared branches.
- **Before a PR**:
  ```bash
  pnpm run typecheck
  pnpm --filter @workspace/skillcast-fergana test
  pnpm run test:api
  PORT=5173 BASE_PATH=/ pnpm --filter @workspace/skillcast-fergana run build
  ```
  For UI changes, also run the e2e script and check the four languages, light and dark, at mobile width.
- **Commits**: one topic per commit; explain the reason, not only the change. Reference the files or bug.
- **Translations**: every new UI string needs `en`, `uz` and `ru`. Do not hard-code English in components.
- **Product scope** (`.agents/memory/fergana-product-scope.md`): SkillCast Fergana is primarily a Smart Education /
  future-skills learning platform, scoped "Fergana City → Uzbekistan → Global". Keep the existing learner journey,
  Future Skills Radar, SDG impact, Harada roadmap, progress and the secondary employer view; extend rather than replace.
- **Honesty rules** (as practised throughout the code and README): label estimates as estimates, keep demo data
  synthetic, never present scenario indices as job counts, and keep a deterministic fallback for every AI feature.
- **Data you must not commit**: `.env`, API keys, real CVs or personal data, files under `artifacts/api-server/db/`.
- **Replit**: Replit runs each artifact's own workflow (`artifacts/*/.replit-artifact/artifact.toml`), not `pnpm dev`;
  `scripts/post-merge.sh` runs after merges there.
