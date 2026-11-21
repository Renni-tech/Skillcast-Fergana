# SkillCast Fergana

**A learning forecast for the AI era.** SkillCast Fergana shows people in the Fergana region of Uzbekistan which skills are rising, how well they fit future roles, and turns the gap into a personal, step-by-step learning plan built from real courses. It was built for the **Aiversecity Future-Ready Workforce** challenge (SDG "Survive AI" domain) as a working proof of concept.

Three audiences, one engine:

- **Learners** (workers, teachers, students, job seekers): forecast → matching → Wind Rose → Harada roadmap → Duolingo-style course path.
- **Employers / HR**: team skill gaps, AI-exposure risk, adoption scenarios and an explainable training plan.
- **Training institutions**: cohort readiness and the best-matching pathway per student.

### Key characteristics

- **Deterministic, explainable core.** Matching and momentum use published formulas that run in code, not in a language model. The same inputs always give the same result, and every score has a "Why?" explanation.
- **AI only where it is safe.** A self-hosted model (Qwen2.5-7B-Instruct on RunPod) only proposes CV skills and narrates explanations. Both have deterministic fallbacks, and the user confirms every extracted skill.
- **Honest data.** Signals come from official and open sources and carry their real status (periodic, cached, unavailable, demo baseline). 17 of the 26 catalogue sources carry a dated check against the publisher's own page. Scenario indices are labelled as estimates, never as job counts.
- **Privacy by design.** The profile lives in the user's browser. A CV is scrubbed of personal details in the browser before any text is sent; the coach receives only scores and gaps. No account is needed.
- **Accessible and inclusive.** Uzbek (default), Russian and English; text size, contrast, spacing, reduced motion, keyboard use and a voice assistant; 0 axe WCAG 2.1 A/AA violations on the main screens; a dedicated route to inclusive opportunities.
- **Synthetic people only.** Demo profiles, teams and the sample CV are fabricated (competition rule).

## Features

### Learner journey

| Feature | What it does |
| --- | --- |
| **Onboarding** (6 steps) | Profile (status, field, profession, experience, education), skills with 1–5 levels or a CV, interests and weekly learning hours, work preferences and accessibility needs. |
| **Field and profession autocomplete** | Search 17 sectors and 131 occupations (ISCO-08 codes, plus local crafts such as suzani embroidery, silk weaving and Rishton pottery) by partial words and aliases in Uzbek, Russian or English, with mouse or keyboard. "Other / not listed" keeps your own wording. Current and target profession are stored separately and both feed matching. |
| **Weekly study hours** | 1–168 hours a week with quick choices. Plans are paced at up to 40 hours a week and say so when you choose more, so timelines stay realistic. |
| **CV extraction** | PII scrubbed in the browser; skills proposed by the model or by a deterministic in-browser extractor; the user confirms and edits the levels. |
| **Future Skills Radar** (forecast) | Scenario demand index (0–100) for the best-matching pathways under **moderate** or **fast** AI adoption, plus an employment-outlook chart over three horizons. |
| **Career matching** | 16 future roles in three strategies (*Work with AI*, *Pivot to another career*, *Emerging opportunities*), 13 sectors. Fit score, matching skills, skills to build, market outlook, AI task exposure, SDG tags and "Why this match?". |
| **Wind Rose** | Signature radar: current skills (blue), market direction (violet), pathway target; tap any skill for a detail panel; "What this means for you", "Promising directions", "Improve next", and an accessible data table. |
| **Harada-inspired roadmap** | One goal → 8 skill areas → 64 tasks with estimated hours and a status (Not started / In progress / Completed) saved in the browser. |
| **What to learn** | Skill gaps linked to real courses (23 in the catalogue), ordered by gap priority, shown as a Duolingo-style path that unlocks step by step. |
| **Skill progression** | Marking a course done proposes a +1 level for each skill it teaches (capped by course level). You confirm which to apply; the fit score, Wind Rose and next steps update, and un-marking the course reverts it. |
| **Badges and rewards** | 24 badges (Bronze / Silver / Gold in 8 categories: First Steps, Career Explorer, Curious Mind, Consistent Learner, Skill Builder, Knowledge Seeker, Goal Achiever, Future Ready), each tied to real progress such as completed courses, confirmed level-ups, Harada milestones, study days and skill readiness. A new badge plays a short reveal once (silhouette, spin, light burst, meaning and how it was earned) and then flies into the collection. Skip, "skip all", reduced-motion and an optional sound (off by default) are supported. The collection shows progress toward locked badges, replays earned ones, and unlocks titles, a profile frame and Wind Rose colours. |
| **Where to learn: places and online resources** | 18 checked local and regional entries plus the 14-provider list. Areas: Fergana region (Fergana State University, TUIT Fergana, IT Park Fergana, the "Ishga marhamat" mono-centre, Margilan Crafts Development Centre, Rishton ceramics), Uzbekistan, Central Asia and online. Topics: programming, AI, business, languages, design, crafts, embroidery, knitting, sewing, painting, agriculture and vocational trades. Ranking uses pathway skill gaps, field and professions, home area, online or in-person preference (saved to the profile), language, cost and weekly hours, and every result shows why it was suggested. Addresses appear only with their source and a confidence label (official, directory or approximate); when none was found the app says so. Each pathway step links to the best extra place to learn that skill. |
| **Progress** | Course completion, hours learned, role skill milestones, Harada tasks and a private weekly reflection note. |
| **PDF export and sharing** | Five reports (full, Wind Rose, learning roadmap, career and profile analysis, progress and achievements), built as A4 PDFs on the device in Uzbek, Russian or English with an embedded font subset (DejaVu Sans) and a vector Wind Rose. Each report shows its date; a name appears only if typed in for that export and is not saved. Sharing uses the system share sheet where the browser can share files, otherwise the PDF is downloaded; a short text summary can be copied. No links are created and nothing is uploaded. |
| **SDG impact** | Every pathway mapped to UN SDG targets, with SDG 4 (Quality Education) at the core. |
| **Demand stats** | Scenario indices with plain-language verdicts and the skill-momentum calculation behind them. |
| **Inclusive opportunities** | Jobs, training and support programmes relevant to people with disabilities, with verified entries kept separate from examples. |

### Employer / HR view

Team learning priorities and skill gaps for a synthetic team: company context, target-role readiness, roles most exposed to AI, most exposed staff, AI-adoption planning scenarios, an explainable training plan per role, a transition plan and SDG connections. All figures are labelled as illustrative.

**Premium analytics (prototype).** Four locked previews: team skills heatmap, talent matcher, reskilling return forecast and skill passport checks. Each is blurred behind a lock with a Premium label. Its preview explains what it would show, which data it would use (opt-in and anonymised) and that it is not available yet. There is no payment flow, and nothing is sold.

### Institution view

Cohort readiness and the best-matching entry-level pathway per student, for training centres and universities.

### Signal sources

A five-step chain from source to recommendation, the live status of every retrieved source, and the approved catalogue (26 sources: 3 periodic, 3 needing an API key, 17 reference, 3 planned) with scope, data type, update frequency, licence, why it matters, and the dated SkillCast check with an evidence link. A forecast changelog records what changed after each refresh.

### Accessibility

Language switch (uz / ru / en), text size, high contrast, line spacing, underlined links, reduced motion, keyboard navigation with visible focus, non-colour status cues, chart text alternatives, and a **career assistant** (voice or typed). It answers from the learner's saved profile and SkillCast data:
  - what to learn next and why a pathway fits;
  - what is missing and how long it will take;
  - a plan for the week, progress so far, and where to learn a skill.

  It also handles follow-up questions ("why?", "how do I learn it?", "tell me more") and offers buttons that open the relevant section. "Explain in more detail" calls the optional LLM narrator, with loading, error and retry states; without the LLM, a deterministic explanation in the learner's language is shown. Speech:
  - Uzbek recognition with Cyrillic-to-Latin normalisation;
  - clear messages for no speech, network or unsupported language, with "listen in Russian instead" when Uzbek recognition is unavailable;
  - when the device has no Uzbek voice, the same answer can be read aloud in Russian or English.

## How it works

**Match score** (per role, in `src/lib/matching.ts`):

```
match = 0.45 × skill readiness + 0.25 × interest fit + 0.20 × experience fit + 0.10 × work-preference fit
```

**Skill Momentum Index** (per skill, in `artifacts/api-server/src/skillcast/lib/momentum.ts`):

```
momentum = 0.50 × posting frequency + 0.30 × trend (recent vs earlier postings) + 0.20 × research horizon (WEF Future of Jobs 2025, Stanford AI Index)
```

**Data sources retrieved by the API** (on a schedule, never real time):

| Source | Provides | Used for |
| --- | --- | --- |
| Statistics Agency of Uzbekistan (SIAT, dataset 1311) | Employment rate, Fergana region and national, annual (CC BY 4.0) | Local labour-market context |
| World Bank Indicators API | Labour-force participation, Uzbekistan (CC BY 4.0) | National trend |
| Remotive, Arbeitnow, Greenhouse, Ashby job APIs | Job postings (free, no key) | Skill frequency and trend → momentum |

When a source cannot be reached, the app shows the last cached copy or a clearly labelled baseline; it never invents numbers.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, shadcn/ui (Radix UI), Recharts, Framer Motion, Zustand (localStorage persistence), TanStack Query, React Hook Form + Zod, Lucide icons |
| API | Node.js 24, Express 5, Zod, Pino logging, esbuild bundle |
| Storage | SQLite through Node's built-in `node:sqlite` (signal runs, snapshots, changelog); user data in the browser only |
| AI | Qwen2.5-7B-Instruct on vLLM, self-hosted on RunPod serverless (CV extraction proposals and narration only) |
| Contract | OpenAPI spec with generated React Query client and Zod schemas (`lib/`) |
| Browser APIs | Web Speech API (voice), localStorage |
| Tooling | pnpm workspaces (monorepo), TypeScript project references, Bun test runner, Node test runner, Playwright + axe-core (audits) |
| Hosting | Replit (autoscale deployment) |

## Project structure

```
artifacts/
  skillcast-fergana/        # SkillCast Fergana frontend (React + Vite)
    src/components/skillcast/  # landing, onboarding, dashboard, wind-rose, harada, pathway,
                               # sdgview, demand, employer, institution, signalsview,
                               # voice-assistant, a11y, inclusive, learning-sources
    src/lib/                # matching, wind-rose, harada, learning-rank, cv (PII scrubber),
                            # voice-intents, store, i18n (uz/ru/en copy tables)
    src/data/               # roles (16), skills (50), courses (23), approved-sources (26),
                            # learning-sources (14), inclusive (8), team, institution, sample CV
    tests/                  # learner flow, i18n parity, experience, quality
  api-server/               # Express API
    src/routes/             # health, skillcast (signals, coach, extract-cv), fergana-signals
    src/skillcast/lib/      # momentum, signals-run, fergana-signals, runpod, db (node:sqlite)
  skillcast/                # original SkillCast app (reference, served at /skillcast/)
  mockup-sandbox/           # UI component sandbox
lib/                        # api-spec (OpenAPI), api-client-react, api-zod, db
scripts/                    # dev.mjs (one-command local dev), dev-lib + tests, post-merge hook
```

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/healthz` | Health check |
| GET | `/api/signals` | Latest skill-momentum snapshot (cached) |
| POST | `/api/signals` | Refresh signals (60 s cooldown) |
| GET | `/api/signals/cron` | Scheduled refresh; needs `Authorization: Bearer $CRON_SECRET` |
| GET | `/api/fergana/signals` | SIAT, World Bank and Remotive signals with provenance and status |
| POST | `/api/coach` | Narrated explanation from scores and gaps only (deterministic fallback) |
| POST | `/api/extract-cv` | Skill proposals from scrubbed CV text (deterministic fallback) |

## Getting started (Windows, macOS, Linux)

> **Tested so far:** Linux (full run: install, `pnpm dev`, API, frontend, Ctrl+C).
> Windows-specific behaviour (paths, process shutdown, PowerShell) is handled in
> the scripts and was reported working up to `pnpm install` on a real Windows
> PC; the full `pnpm dev` run on Windows still needs to be confirmed after this
> change. macOS has not been tested.

### 1. Requirements

| Tool | Version | Check |
| --- | --- | --- |
| **Node.js** | **24 LTS** recommended, **22.13 or newer** required (the API uses Node's built-in SQLite) | `node -v` |
| **pnpm** | **10** (the lockfile was made with 10.28) | `pnpm -v` |
| Git and VS Code | any recent version | |

Install pnpm once (PowerShell, Command Prompt or Terminal):

```powershell
npm install -g pnpm@10
```

**Disk space:** about **1.5 GB free** for the first install (`node_modules` is
about 600 MB; pnpm also keeps a shared package store of similar size, on Windows
usually on the same drive as the project). Running the app adds only a few MB.

### 2. Get the code

```powershell
git clone https://github.com/Renni-tech/Skillcast-Fergana.git
cd Skillcast-Fergana
git checkout fergana-sources-i18n   # while this branch is under review
```

### 3. Install

```powershell
pnpm install
```

### 4. Environment (optional)

Nothing is required. To change a port or listen on your Wi-Fi, copy
`.env.example` to `.env` and edit it (PowerShell: `Copy-Item .env.example .env`).
`.env` is git-ignored; never commit real keys. No Replit variables and no
database server are needed.

### 5. Start

```powershell
pnpm dev
```

`pnpm dev` runs four steps and then prints the addresses:

1. Builds the API (esbuild, a few seconds).
2. Prepares the local SQLite cache folder (`artifacts/api-server/db/`).
3. Starts the API on port **8080** and waits until `/api/healthz` answers.
4. Starts the frontend on port **5173**, with `/api` forwarded to the API.

```
  SkillCast Fergana is running
  Frontend  http://localhost:5173/
  API       http://localhost:8080/api/healthz
```

**Nothing is downloaded by `pnpm dev`.** Earlier versions generated a Prisma
client and downloaded Prisma engines on the first run (the step that failed with
`ENOSPC` on Windows). The API now stores its small signal cache with Node's
built-in `node:sqlite`, so that step and its ~150 MB of engine files are gone.
An existing `skillcast.db` keeps working.

### 6. Open it

Open **http://localhost:5173/** (Ctrl+click it in the VS Code terminal).

To try it on a **phone or tablet** on the same Wi-Fi, put `HOST=0.0.0.0` in
`.env`, run `pnpm dev` again and open one of the "On Wi-Fi" addresses it prints.
Windows may ask whether Node.js may use the network: allow **Private networks**.

### 7. Stop

Press **Ctrl+C** once. Both servers stop and their ports are freed. If Windows
asks `Terminate batch job (Y/N)?`, type **Y**. If either server crashes, the
other one is stopped too, so nothing keeps running in the background.

The frontend reloads instantly when you edit it. After changing API code, stop
with Ctrl+C and run `pnpm dev` again (the API is rebuilt on every start).

### Open in VS Code (Windows)

1. **File → Open Folder…** and choose the `Skillcast-Fergana` folder.
2. **Terminal → New Terminal** (PowerShell).
3. Run `pnpm install` the first time, then `pnpm dev`.
4. Ctrl+click `http://localhost:5173/` in the terminal.

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `WEB_PORT` | `5173` | Frontend port. |
| `API_PORT` | `8080` | API port (the frontend forwards `/api` here). |
| `HOST` | `127.0.0.1` | Where both servers listen. `0.0.0.0` = reachable from your Wi-Fi. |
| `LOG_LEVEL` | `info` | API log level. |
| `RUNPOD_API_KEY`, `RUNPOD_ENDPOINT_ID` | unset | Optional RunPod model for CV extraction and narrated explanations. Without them the app uses its deterministic fallbacks. |
| `CRON_SECRET` | unset | Optional; protects `GET /api/signals/cron`. |

`DATABASE_URL` is **not** needed.

## Data, privacy and verification

- `artifacts/skillcast-fergana/src/data/approved-sources.ts` is the approved source catalogue. **Integration status** (periodic, cached, unavailable, demo baseline, reference, planned, key required) and the **SkillCast check** (`check: { on, url }`, the date someone read the publisher's own page) are shown separately. Sources whose sites block automated checks stay "not checked yet". Last audit: 18 November 2026.
- The learner profile, Harada task status and completed courses are stored in the browser (`localStorage`). Reset clears them.
- `POST /api/extract-cv` receives only scrubbed text; `POST /api/coach` receives scores and skill gaps only. The RunPod endpoint does not persist prompts.

## Testing and verification

| Command | Covers | Result (18 Nov 2026) |
| --- | --- | --- |
| `pnpm run typecheck` | All packages | Pass |
| `pnpm --filter @workspace/skillcast-fergana test` | Learner flow, uz/ru/en parity, experience, source-audit rules (Bun) | 62 / 62 |
| `pnpm --filter @workspace/skillcast test` | Original SkillCast app | 47 / 47 |
| `pnpm run test:api` | API SQLite store, incl. reading an old Prisma-made file | 4 / 4 |
| `pnpm run test:dev` | `pnpm dev` helpers (disk, Node version, failure messages) | 5 / 5 |
| `pnpm run build` | Production builds (set `PORT` and `BASE_PATH` as Replit does) | Pass |

Also checked: no horizontal overflow at 360, 768 and 1280 px in all three languages (Playwright probe), and 0 axe WCAG 2.1 A/AA violations on 8 screens × uz/ru × light/dark.

## Roadmap

**Short term (next 3 months)**

- **Verified Skill Passport**: one click exports a shareable summary or PDF of completed Harada goals, the Wind Rose and earned badges, with a QR code that verifies it.
- **B2B Talent Matcher**: employers search anonymised Wind Rose profiles of learners who earned specific badges and pay to unlock a candidate who has opted in.
- **Telegram bot and PWA**: reminders, weekly progress and offline access for low-bandwidth users.
- **More local data**: integrate ish.mehnat.uz vacancies (with access) and ILOSTAT series; add regional breakdowns.
- **Pilot** with one school, one employment centre and one training provider in Fergana.

**Long term (6–24 months)**

- Cover all 14 regions of Uzbekistan, then Central Asia, with Tajik and Kazakh interfaces.
- Course partnerships (IT Park, universities, online platforms) with completion data that updates skill levels automatically.
- Institution dashboards for employment centres and ministries: anonymised regional skill-gap maps to plan training budgets.
- Mentor and peer-learning matching; employer-sponsored learning paths.
- Independent audit of the scoring formulas for fairness and bias.

**Business model**

Free for learners. Revenue from employers (talent matching, team reskilling plans), training providers (verified course placement and referrals) and public-sector licences (regional analytics), always with anonymised, consented data.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `vite: not found`, `node_modules missing`, or `Dependencies are not installed` | Run `pnpm install` in the project root. |
| `Port 8080 is already in use` (or 5173) | Close the other program, or set `API_PORT` / `WEB_PORT` in `.env`. On Windows, find it with `netstat -ano \| findstr :8080`. |
| `Cannot find module @rollup/rollup-win32-x64-msvc` (or a similar `win32` / `darwin` package) | Delete `node_modules` and run `pnpm install` again. These native packages are platform-specific and must be installed on the machine that runs them. |
| `Use pnpm instead` during install | Install with `pnpm install`, not `npm install` or `yarn`. |
| `ENOSPC: no space left on device` (during `pnpm install` or `pnpm dev`) | A drive is full; this is the computer, not SkillCast. Free space (Settings → System → Storage → Cleanup recommendations). If only `C:` is full, point the temp folder to another drive for this terminal: `New-Item -ItemType Directory D:\Temp -Force; $env:TEMP="D:\Temp"; $env:TMP="D:\Temp"`. `pnpm dev` names each folder it writes to and how much space is free. If an older version of this project downloaded Prisma engines, that cache (`%APPDATA%\Prisma` or `%LOCALAPPDATA%\Prisma`, if present) is no longer used and is yours to remove. |
| `Node.js 22.13 or newer is required` | Install Node 24 LTS from nodejs.org, close and reopen the terminal, check `node -v`, then run `pnpm dev` again. |
| `EPERM` / `EBUSY` while building | Another process holds a file: close other terminals running SkillCast (or wait for an antivirus scan), then run `pnpm dev` again. |
| Windows Firewall asks about Node.js | Only happens with `HOST=0.0.0.0`. Allow **Private networks** to test from your phone; with the default `HOST` there is no prompt. |
| `Terminate batch job (Y/N)?` after Ctrl+C | Normal on Windows; type `Y`. Both servers are already stopped. |
| `pnpm` is not recognized | Run `npm install -g pnpm@10` and open a new terminal. |
| PowerShell blocks `pnpm.ps1` ("running scripts is disabled") | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, or use the Command Prompt instead of PowerShell. |
| Signal sources show "Unavailable" | Normal when the official sources cannot be reached from your network. The app falls back to the last cached result or a labelled demo baseline. |

## Replit

Replit does not use `pnpm dev`; it runs each artifact's own workflow (see
`replit.md` and `artifacts/*/.replit-artifact/artifact.toml`). The local
script only adds an opt-in `/api` proxy (`API_PROXY_TARGET`) that Replit never
sets.
