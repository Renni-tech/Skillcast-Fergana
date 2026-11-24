# 5. Deployment guide

SkillCast has two deployable parts:

| Part | What it is | Output |
| --- | --- | --- |
| Frontend | Static SPA (`artifacts/skillcast-fergana`) | `artifacts/skillcast-fergana/dist/public/` |
| API | Long-running Node server (`artifacts/api-server`, Express 5) | `artifacts/api-server/dist/index.mjs` |

The frontend works without the API: it falls back to cached or baseline signals, deterministic explanations and the
browser's voice. **Live signals, AI answers and neural speech need the API.**

## 5.1 Repository structure relevant to deployment

```
.replit                                          # Replit workspace: deploymentTarget = "autoscale"
artifacts/skillcast-fergana/.replit-artifact/artifact.toml   # Frontend service: static, path "/"
artifacts/api-server/.replit-artifact/artifact.toml          # API service: path "/api", health /api/healthz
artifacts/skillcast/.replit-artifact/artifact.toml           # Original app at "/skillcast/"
artifacts/mockup-sandbox/.replit-artifact/artifact.toml      # Design canvas (not deployed as product)

vercel.json                                      # Vercel: install + build commands (Build Output API)
scripts/build-vercel.mjs                         # Builds .vercel/output: static site + the API as a function
artifacts/api-server/src/vercel.ts               # Function entry: the same Express app, exported as a handler
```

## 5.2 Replit (configuration in the repository) ✅

Replit runs each artifact as a service behind one domain:

| Service | Build | Run | Route |
| --- | --- | --- | --- |
| Frontend | `pnpm --filter @workspace/skillcast-fergana run build` | static files from `dist/public`, rewrite `/* → /index.html` | `/` |
| API | `pnpm --filter @workspace/api-server run build` | `pnpm --filter @workspace/api-server run start` with `PORT=8080` | `/api` |
| Original app | its own build | static | `/skillcast/` |

The API runs `prepare-db.mjs` on start, so `db/` exists. Its caches are **not durable** across republishes; they rebuild
themselves. Set secrets (`RUNPOD_*`, `CRON_SECRET`, TTS keys) in Replit Secrets.

## 5.3 Vercel ✅ (configuration in the repository)

The production site is `https://skillcast-fergana.vercel.app`. Until 24 November 2026 that project served only the
static frontend, so every `/api/*` path returned Vercel's `404 NOT_FOUND` and the app fell back to its labelled
baseline (no live SIAT, World Bank or Remotive data, no AI or neural speech). The repository now deploys the API too.

### How it works

`vercel.json` sets the install and build commands. `scripts/build-vercel.mjs` writes a
[Build Output API v3](https://vercel.com/docs/build-output-api) directory:

```
.vercel/output/
  static/                        ← artifacts/skillcast-fergana/dist/public (the SPA)
  functions/api/healthz.func/    ← the Express API bundled by artifacts/api-server/build.mjs
                                   (entry src/vercel.ts, runtime nodejs22.x, maxDuration 60 s)
  functions/api/fergana/signals.func → symlink to healthz.func   (one per Express route,
  functions/api/tts.func             → symlink to healthz.func    derived from src/routes/*.ts)
  …
  config.json                    ← files and functions first, then the SPA as a fallback; unknown /api paths 404
```

Each API path has its own function entry pointing at the same bundle, so Express receives exactly the URL it receives
locally; no rewrites are involved. The frontend keeps calling same-origin `/api/...`, so the production CSP
(`connect-src 'self'`) and CORS need no change.

Serverless adjustments (all inactive outside Vercel, so local and Replit behaviour is unchanged):

| Issue on Vercel | Handling |
| --- | --- |
| Deployed code is read-only; only `/tmp` is writable | Fergana cache → `/tmp/skillcast/fergana-approved-signals.json`; SQLite for `/api/signals` → `/tmp/skillcast/`. A failed cache write is logged and no longer fails the request. Override with `FERGANA_SIGNALS_CACHE`. |
| Each cold instance starts with an empty memory cache | `GET /api/fergana/signals` sends `Cache-Control: public, max-age=0, s-maxage=300, stale-while-revalidate=60`, so the CDN answers most page loads and a new instance runs at most every few minutes. Each source then decides whether a check is due (statistics 15 min, Remotive 6 h). The response always carries each source's real `fetchedAt`, so a CDN copy never looks fresher than it is. Elsewhere it stays `no-store`. |
| Logs | `NODE_ENV=production` is compiled in, so pino writes JSON (no pretty-print worker). |

### Project settings

| Setting | Value |
| --- | --- |
| Root Directory | **empty** (repository root). `vercel.json` and the build script live there. |
| Framework Preset | Other (`vercel.json` sets `"framework": null`) |
| Build / Install Command | from `vercel.json`; remove any dashboard override |
| Output Directory | leave empty; the Build Output API directory is used |
| Node.js Version | 22.x (the function runtime is `nodejs22.x`; `node:sqlite` needs 22.13+) |
| Environment variables | none required; `PORT`/`BASE_PATH` default to `3000` and `/` in the build script. Optional: `FERGANA_EXTRA_SOURCES` (job boards not on the approved list). |

Optional secrets (Project → Settings → Environment Variables, Production): `RUNPOD_API_KEY`, `RUNPOD_ENDPOINT_ID`,
`OPENAI_API_KEY`, `GOOGLE_TTS_API_KEY`, `TTS_PROVIDER`, `CRON_SECRET`. Without them, AI and speech use their documented
fallbacks.

### Limitations on Vercel

- Source-check intervals are enforced per function instance; the CDN cache keeps instances rare, but for strict global
  limits move the cache to a shared store (for example Vercel Blob or KV).
- `POST /api/fergana/signals` ("Refresh signals") is not cached; a new instance may check sources sooner than a
  long-running server would.
- The in-memory per-IP limiter on `/api/tts` and `/api/assistant` is per instance.

### Alternative: separate API host

The API also still runs as a normal server (`pnpm --filter @workspace/api-server run start`) on Replit, Render, Railway
or a VPS. In that case, deploy only the frontend to Vercel and proxy `/api/*` to that host with a rewrite.

## 5.4 Environments

| Environment | Frontend | API | Notes |
| --- | --- | --- | --- |
| Local development | Vite dev server (5173), dev CSP header, Replit dev plugins only inside Replit | `pnpm dev` (8080), proxied at `/api` | No keys needed |
| Production preview (local) | `vite preview` (`serve` script) | not proxied | Good for checking the strict production CSP and icons |
| Production | Static hosting | Node host | Set secrets on the API host only; the frontend has no secrets |

## 5.5 Environment variables for production

| Variable | Set on | Required? |
| --- | --- | --- |
| `PORT`, `BASE_PATH` | Frontend build | **Yes** (build fails without them) |
| `NODE_ENV=production` | Both | Recommended |
| `PORT` | API runtime | **Yes** |
| `RUNPOD_API_KEY`, `RUNPOD_ENDPOINT_ID` | API | For AI narration, CV extraction and open questions |
| `OPENAI_API_KEY` / `GOOGLE_TTS_API_KEY` | API | Optional higher-quality speech; Edge voices need no key |
| `TTS_PROVIDER` | API | Optional ordering or `off` |
| `CRON_SECRET` | API | For scheduled `/api/signals/cron` |
| `LOG_LEVEL` | API | Optional |

Never put keys in the frontend build: everything in the Vite bundle is public.

## 5.6 Voice assistant deployment considerations

- `/api/tts` is called per answer chunk; each response is `audio/mpeg`, cached privately for an hour.
- Edge neural voices need outbound access to `speech.platform.bing.com`; some hosts block it. Uzbek speech depends on
  it (or on OpenAI/Google keys), because browsers rarely ship an Uzbek voice.
- The limiter allows 40 TTS and 20 assistant requests per minute per IP **per process**; behind several instances the
  effective limit multiplies. Use a shared store before scaling out.
- Speech recognition happens in the browser (Web Speech API); it needs HTTPS and is not available in every browser
  (notably Firefox). The assistant always works by typing.

## 5.7 Verification after deploying

```bash
BASE=https://your-domain
curl -sI $BASE/ | head -1                          # 200
curl -s  $BASE/favicon.svg | grep -c "M13 22H7"    # 1 (Cloud & Sun mark)
curl -s  $BASE/api/healthz                         # {"status":"ok"}
curl -s  $BASE/api/fergana/signals | head -c 200   # JSON, not HTML
curl -s -o /dev/null -w "%{content_type}\n" -X POST $BASE/api/tts \
     -H 'content-type: application/json' -d '{"text":"Salom","lang":"uz"}'   # audio/mpeg
```

Then run the browser check against the deployment:

```bash
TEST_BASE_URL=$BASE/ node artifacts/skillcast-fergana/tests/e2e-demo-day.mjs
```

It prints `PASS`/`FAIL` per check and a `NOTE` listing any `/api` calls that failed (so you can tell "API not
deployed" from a real bug).

## 5.8 Deployment troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Build fails: `PORT environment variable is required` | Vite config needs `PORT` and `BASE_PATH` | Add both as build environment variables |
| `/api/...` returns `404 NOT_FOUND` (plain text) | The API function was not deployed: Root Directory is not the repo root, or a dashboard Build/Output override bypasses `vercel.json` | Clear the overrides, set Root Directory to the repository root, redeploy; the build log must show `[build-vercel] API paths: …` |
| `/api/...` returns HTML | A rewrite captures `/api` | Remove it; `config.json` already excludes `/api` from the SPA fallback |
| Assistant never speaks | `/api/tts` missing, blocked egress, or `TTS_PROVIDER=off` | Deploy the API; allow egress or set an OpenAI/Google key |
| "Explain in more detail" fails in Uzbek | Known `/api/coach` language-enum bug | See [03-architecture.md](03-architecture.md#34-api-reference) |
| Signals always "demo baseline" | API cannot reach the sources | Check outbound network; the UI is still usable |
| Old favicon | Browser cache | Hard refresh; the files are `favicon.svg`/`favicon.ico` in `dist/public` |
| Blank area with "Something went wrong" | A component threw; the error boundary contained it | Check the browser console; report with the language and screen |
