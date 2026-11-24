# SkillCast Fergana

**A learning forecast for the AI era.** SkillCast Fergana shows people in the Fergana region of Uzbekistan which skills
are rising, how well they fit future roles, and turns the gap into a personal, step-by-step learning plan built from real
courses and local places to learn. Built for the **Aiversecity Future-Ready Workforce** challenge (SDG "Survive AI"
domain) as a working proof of concept.

> 📚 **Full documentation is in [`docs/`](docs/README.md)**: overview, features, architecture and API, developer guide,
> deployment, testing, roadmap, and the proposed Telegram ecosystem.

## At a glance

| | |
| --- | --- |
| **Who it is for** | Learners (workers, students, job seekers, career changers), employers/HR, training institutions |
| **Languages** | Uzbek Latin (default), Uzbek Cyrillic, Russian, English |
| **Core idea** | Deterministic, published formulas compute every score; AI only narrates and proposes, with fallbacks |
| **Privacy** | No accounts. The profile stays in the browser; CVs are scrubbed in the browser before any text is sent |
| **Status** | Working POC: 200 automated tests passing, browser e2e across 4 languages × light/dark × desktop/mobile |

## Key characteristics

- **Deterministic, explainable core.** Matching, the Skill Momentum Index and the Wind Rose are fixed formulas in code.
  The same inputs always give the same result, and every score has a "Why?".
- **AI only where it is safe.** A self-hosted model (Qwen2.5-7B-Instruct on RunPod) only proposes CV skills, narrates
  explanations and answers open questions. Each has a deterministic fallback; users confirm extracted skills.
- **Honest data.** Signals come from official and open sources and carry their real status (periodic, cached,
  unavailable, demo baseline). Scenario indices are labelled estimates, never job counts.
- **Accessible and inclusive.** Accessibility panel, voice assistant, keyboard use, chart text alternatives, and a route to
  inclusive opportunities.
- **Synthetic people only.** Demo profiles, teams and the sample CV are fabricated (competition rule).

## Features

Status: ✅ implemented · 🟡 partial · 🧪 demo/illustrative · 📋 planned. Details: [docs/02-features.md](docs/02-features.md).

| Area | What it does | Status |
| --- | --- | --- |
| Learner onboarding | 6 steps: profile (131 occupations, 17 sectors, autocomplete in 3 languages), skills or CV, interests and weekly hours (1–168), future-skills radar, career strategy, work preferences | ✅ |
| Try Demo Profile | One click loads *Malika*, a synthetic learner who is part-way through her plan; real profile kept aside and restored | ✅ 🧪 |
| Career matching | 16 future roles, explainable 4-factor score, "Why this match?", optional AI narration | ✅ |
| Wind Rose | Your level vs market direction vs pathway target; tap any skill; "Improve next"; voice explanation | ✅ |
| Harada roadmap | One goal → up to 8 skill areas → 8 tasks each, statuses, milestones, hours and weeks | ✅ |
| What to learn | 23 real courses as an unlocking path; confirmed, reversible skill level-ups; researched local and online catalogue | ✅ |
| Badges | 24 tiered badges from real progress, reveal animation, per-badge previews, titles and Wind Rose colours | ✅ |
| Career assistant | Voice or text, deterministic answers and commands, optional LLM, neural speech with fallbacks | ✅ / 🟡 needs API |
| PDF reports | Five reports built on the device in 3 languages | ✅ |
| Signals | SIAT, World Bank and Remotive retrieval with status; 26-source catalogue; changelog | ✅ |
| Demand / Future Skills Radar | Scenario demand indices and outlook | 🧪 illustrative |
| Employer / HR | 4-step HR onboarding; synthetic-team readiness, AI scenarios, training plan, transition plan; locked premium previews | ✅ 🧪 |
| Institution view | Cohort readiness, per-student match, syllabus vs market | 🟡 link only (`#/institution`) |
| Themes, a11y, responsive | Light default + dark; text size, contrast, motion, spacing; no overflow at 390 px | ✅ |
| Accounts, Telegram bot and Mini App, Career Circle | | 📋 [proposal](docs/08-telegram-ecosystem.md) |

## How it works

```
match    = 0.45 × skill readiness + 0.25 × interest fit + 0.20 × experience fit + 0.10 × work-preference fit
momentum = 0.50 × posting frequency + 0.30 × trend (recent vs earlier) + 0.20 × research horizon (WEF 2025, Stanford AI Index)
```

Formulas: `artifacts/skillcast-fergana/src/lib/matching.ts`, `artifacts/api-server/src/skillcast/lib/momentum.ts`.

**Data retrieved by the API** (on a schedule, never real time):

| Pipeline | Sources | Feeds |
| --- | --- | --- |
| `/api/fergana/signals` (this app) | SIAT dataset 1311 (employment, Fergana and national), World Bank labour-force participation (Uzbekistan), Remotive remote postings | Local context and skill momentum |
| `/api/signals` (original app at `/skillcast/`) | Remotive, Arbeitnow, Greenhouse and Ashby job APIs | Momentum, stored in SQLite |

When a source cannot be reached, the app shows the last cached copy or a clearly labelled baseline; it never invents
numbers.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS 4, shadcn/ui (Radix UI), Recharts, Zustand (localStorage), next-themes, jsPDF, Lucide icons |
| API | Node.js 24, Express 5, Zod, Pino, esbuild |
| Storage | Browser `localStorage` for all user data; API caches in a JSON file and SQLite (`node:sqlite`) |
| AI | Qwen2.5-7B-Instruct on vLLM, RunPod serverless; speech via OpenAI TTS, Google TTS or Microsoft Edge neural voices |
| Contract | OpenAPI spec → generated Zod schemas and React Query client (`lib/`) |
| Tooling | pnpm workspaces, TypeScript project references, Bun and Node test runners, Playwright e2e |
| Hosting | Vercel (`vercel.json` + `scripts/build-vercel.mjs`: static site + the API as a function) and Replit; see [deployment](docs/05-deployment.md) |

## Project structure

```
artifacts/
  skillcast-fergana/   # The product (React + Vite)
  api-server/          # Express API shared by both apps
  skillcast/           # Original SkillCast app, served at /skillcast/
  mockup-sandbox/      # Design canvas (Replit), not part of the product
lib/                   # api-spec (OpenAPI), api-zod, api-client-react, db (unused Postgres scaffold)
scripts/               # dev.mjs (one-command local dev) and tests
docs/                  # Documentation
```

Full tree and package roles: [docs/03-architecture.md](docs/03-architecture.md#32-workspace-structure).

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/healthz` | Health check |
| GET / POST | `/api/fergana/signals` | Fergana sources and momentum (cached) / request a refresh |
| GET / POST | `/api/signals` | Original app's momentum snapshot / forced refresh (60 s cooldown) |
| GET | `/api/signals/cron` | Scheduled refresh; `Authorization: Bearer $CRON_SECRET` |
| POST | `/api/coach` | Narrated explanation from scores and gaps only (deterministic fallback) |
| POST | `/api/extract-cv` | Skill proposals from scrubbed CV text (deterministic fallback) |
| POST | `/api/assistant` | Open-question answer with allow-listed UI actions (503 → browser answers) |
| POST | `/api/tts` | Speech audio for assistant answers (503 → browser voice) |

Examples, limits and the known `/api/coach` Uzbek-language bug: [docs/03-architecture.md](docs/03-architecture.md#34-api-reference).

## Getting started

Requirements: **Node.js 24 LTS** (22.13+ required, for `node:sqlite`), **pnpm 10**, Git, about 1.5 GB free disk.

```bash
npm install -g pnpm@10
git clone https://github.com/Renni-tech/Skillcast-Fergana.git
cd Skillcast-Fergana
git checkout fergana-sources-i18n   # active development branch
pnpm install
pnpm dev
```

`pnpm dev` builds the API, prepares its cache folder, starts the API on **8080** and the frontend on **5173** (with `/api`
proxied). Open **http://localhost:5173/**. Ctrl+C stops both. Nothing is downloaded at start-up and no keys are needed.

To try it on a phone on the same Wi-Fi, put `HOST=0.0.0.0` in `.env`. Windows and VS Code notes, running pieces
separately, production builds and troubleshooting: [docs/04-developer-guide.md](docs/04-developer-guide.md).

### Environment variables (all optional for local use)

| Variable | Default | Purpose |
| --- | --- | --- |
| `WEB_PORT`, `API_PORT`, `HOST` | 5173, 8080, 127.0.0.1 | Local ports and bind address |
| `LOG_LEVEL` | `info` | API log level |
| `RUNPOD_API_KEY`, `RUNPOD_ENDPOINT_ID` | unset | Enable the model for CV extraction, narration and open questions |
| `OPENAI_API_KEY`, `OPENAI_TTS_MODEL`, `GOOGLE_TTS_API_KEY`, `TTS_PROVIDER` | unset | Optional speech providers; `TTS_PROVIDER=off` disables speech |
| `CRON_SECRET` | unset | Protects `GET /api/signals/cron` |
| `PORT`, `BASE_PATH` | set by `pnpm dev` | **Required** when running Vite directly or building for production |

`DATABASE_URL` is not needed.

## Data, privacy and verification

- `artifacts/skillcast-fergana/src/data/approved-sources.ts` is the approved source catalogue: 26 sources, each with its
  integration status (periodic, key required, reference, planned) and, for 17 of them, a dated check against the
  publisher's own page. Last audit: 18 November 2026.
- The learner profile, Harada statuses, completed courses, badges and employer setup are stored in the browser
  (`localStorage`). Reset clears them.
- `POST /api/extract-cv` receives only scrubbed text; `POST /api/coach` receives scores and gaps only; the RunPod
  endpoint does not persist prompts. The API stores no personal data.

## Testing

| Command | Covers | Result (22 Nov 2026) |
| --- | --- | --- |
| `pnpm run typecheck` | All packages | ✅ pass |
| `pnpm --filter @workspace/skillcast-fergana test` | Learner flow and HR onboarding, translation parity, experience, quality rules, demo profile, Wind Rose explanation, routes (Bun) | ✅ 134 / 134 |
| `pnpm run test:api` | SQLite store, Fergana signals, assistant agent | ✅ 14 / 14 |
| `pnpm run test:dev` | `pnpm dev` helpers | ✅ 5 / 5 |
| `pnpm --filter @workspace/skillcast test` | Original SkillCast app | ✅ 47 / 47 |
| `pnpm --filter @workspace/skillcast-fergana e2e` | Browser click-through (app must be running; needs Playwright) | ✅ 30 / 30 |
| `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/skillcast-fergana run build` | Production build | ✅ pass |

Details, what each check covers, and known issues: [docs/06-testing.md](docs/06-testing.md).

## Roadmap

Next: fix the Uzbek AI-narration bug and complete the API contract; add CI; split the bundle. Then optional
accounts with sync, a Telegram bot and Mini App, a unified progress timeline, Career Circle, and the Verified Skill
Passport. See [docs/07-roadmap.md](docs/07-roadmap.md), [docs/08-telegram-ecosystem.md](docs/08-telegram-ecosystem.md)
and [docs/09-future-enhancements.md](docs/09-future-enhancements.md).

**Business model (proposed):** free for learners; revenue from employers (talent matching, team reskilling plans),
training providers (verified course placement) and public-sector licences (regional analytics), always with
anonymised, consented data. No paid feature exists yet.

## Troubleshooting (most common)

| Problem | Fix |
| --- | --- |
| `Use pnpm instead` | Install with `pnpm install`, not npm or yarn. |
| `vite: not found` / dependencies missing | Run `pnpm install` in the project root. |
| `Node.js 22.13 or newer is required` | Install Node 24 LTS and reopen the terminal. |
| Port 8080 or 5173 in use | Set `API_PORT` / `WEB_PORT` in `.env`. |
| `PORT ... is required` when building | Set `PORT` and `BASE_PATH` (for example `PORT=5173 BASE_PATH=/`). |
| `ENOSPC`, Windows PowerShell policy, native module errors | See [docs/04-developer-guide.md](docs/04-developer-guide.md#47-troubleshooting). |
| Signal sources show "Unavailable" | Normal when sources are unreachable; the app falls back to the cache or a labelled baseline. |

## Replit

Replit does not use `pnpm dev`; it runs each artifact's own workflow (see `replit.md` and
`artifacts/*/.replit-artifact/artifact.toml`). The local script only adds an opt-in `/api` proxy
(`API_PROXY_TARGET`) that Replit never sets.
