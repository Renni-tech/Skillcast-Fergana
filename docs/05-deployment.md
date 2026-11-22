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
```

There is **no `vercel.json` in the repository**. If the project is deployed on Vercel, that configuration lives in the
Vercel dashboard; section 5.3 documents a working setup.

## 5.2 Replit (configuration in the repository) ✅

Replit runs each artifact as a service behind one domain:

| Service | Build | Run | Route |
| --- | --- | --- | --- |
| Frontend | `pnpm --filter @workspace/skillcast-fergana run build` | static files from `dist/public`, rewrite `/* → /index.html` | `/` |
| API | `pnpm --filter @workspace/api-server run build` | `pnpm --filter @workspace/api-server run start` with `PORT=8080` | `/api` |
| Original app | its own build | static | `/skillcast/` |

The API runs `prepare-db.mjs` on start, so `db/` exists. Its caches are **not durable** across republishes; they rebuild
themselves. Set secrets (`RUNPOD_*`, `CRON_SECRET`, TTS keys) in Replit Secrets.

## 5.3 Vercel 🟡 (dashboard configuration, not in the repo)

### Frontend on Vercel

| Setting | Value |
| --- | --- |
| Root directory | repository root (pnpm workspace) |
| Install command | `pnpm install --frozen-lockfile` |
| Build command | `pnpm --filter @workspace/skillcast-fergana run build` |
| Output directory | `artifacts/skillcast-fergana/dist/public` |
| Environment variables (build) | **`PORT=3000`** and **`BASE_PATH=/`**: `vite.config.ts` throws without them, even for a build |
| Node.js version | 22.x or 24.x |

Routing: the app uses hash URLs (`#/forecast/radar`), so no SPA rewrite is strictly needed for navigation. A catch-all
rewrite to `index.html` is still harmless, **but it must not capture `/api/*`**, otherwise API calls receive the HTML
page with status 200. The TTS client already rejects non-audio responses, and the other calls fall back on JSON parse
errors, but a correct rewrite avoids the wasted requests.

### API: where to host it

The API is a stateful, long-running Express server: in-memory rate limiting and refresh cooldowns, file caches in `db/`,
`node:sqlite`, and outbound calls that can take up to 50 s (RunPod) or 20 s (Edge speech). That fits poorly with
Vercel serverless functions. Recommended options:

1. **Separate Node host** (Replit autoscale, Render, Railway, Fly.io, a VPS) running `pnpm --filter @workspace/api-server run start`,
   and a Vercel rewrite that proxies `/api/*` to it, so the browser stays same-origin (the production CSP has
   `connect-src 'self'`):

   ```json
   {
     "rewrites": [
       { "source": "/api/:path*", "destination": "https://YOUR-API-HOST/api/:path*" },
       { "source": "/((?!api/).*)", "destination": "/index.html" }
     ]
   }
   ```
   This is an example for a future `vercel.json`; it is not in the repository.

2. **Vercel serverless (not implemented)**: would need an adapter around `app.ts`, moving caches to an external store
   (for example Vercel KV or Postgres), and accepting cold starts. Not recommended for the voice assistant.

If the API is not deployed at all, the app still works: signals show the labelled baseline, AI features use
deterministic answers, and the assistant falls back to the device voice or text.

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
| `/api/...` returns HTML | SPA rewrite captures `/api` or no API is deployed | Exclude `/api` from the catch-all; add the proxy rewrite |
| Assistant never speaks | `/api/tts` missing, blocked egress, or `TTS_PROVIDER=off` | Deploy the API; allow egress or set an OpenAI/Google key |
| "Explain in more detail" fails in Uzbek | Known `/api/coach` language-enum bug | See [03-architecture.md](03-architecture.md#34-api-reference) |
| Signals always "demo baseline" | API cannot reach the sources | Check outbound network; the UI is still usable |
| Old favicon | Browser cache | Hard refresh; the files are `favicon.svg`/`favicon.ico` in `dist/public` |
| Blank area with "Something went wrong" | A component threw; the error boundary contained it | Check the browser console; report with the language and screen |
