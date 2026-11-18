# SkillCast Fergana

An AI-assisted Smart Education and future-skills platform for learners in
Fergana City, Uzbekistan and beyond. It is a pnpm monorepo:

| Path | What it is |
| --- | --- |
| `artifacts/skillcast-fergana/` | **SkillCast Fergana** frontend (React + Vite). Uzbek by default, also Russian and English. |
| `artifacts/api-server/` | Express API: signal sources, forecast changelog, CV extraction and coach endpoints. Stores signal snapshots in a local SQLite file. |
| `artifacts/skillcast/` | The original SkillCast app (kept for reference, served at `/skillcast/` on Replit). |
| `lib/` | Shared API contract (`api-spec`), generated clients (`api-client-react`, `api-zod`) and a PostgreSQL helper (`db`, unused by the API). |
| `scripts/` | Workspace scripts, including `dev.mjs` (local `pnpm dev`). |

## Run it locally (Windows, macOS, Linux)

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

### Checks

```powershell
pnpm run typecheck
pnpm run test:dev                                   # pnpm dev helpers (Node test runner)
pnpm run test:api                                   # API SQLite store (Node test runner)
pnpm --filter @workspace/skillcast-fergana test     # frontend (needs Bun)
pnpm run build                                      # production builds
```

The frontend tests use [Bun](https://bun.sh) (`bun test`). Install Bun to run
them; `pnpm dev` does not need it.

## Accessibility and the voice assistant

- **Display settings** (header → Accessibility): text size, high contrast,
  reduced motion, underlined links and reading spacing. Saved in the browser.
  A skip link, visible keyboard focus and labelled controls are always on.
- **Voice assistant** (floating button, or header → Accessibility): runs in
  the browser with no external service. It opens sections, explains skills and
  the Wind Rose, suggests what to learn next, recommends pathways, reads
  answers aloud and searches SkillCast's pathways, courses, learning sources
  and inclusive opportunities. Answers come only from SkillCast data.
  - Speech input uses the browser's Web Speech API (Chrome and Edge). In other
    browsers, type instead; everything else works the same.
  - Reading aloud uses the voices installed on the device. If there is no
    voice for the selected language (common for Uzbek), the answer is shown
    as text instead of being read with the wrong voice.
  - It does not browse the internet or list live vacancies.
- **Inclusive opportunities** and **learning sources** live in
  `artifacts/skillcast-fergana/src/data/inclusive.ts` and
  `src/data/learning-sources.ts`. Every entry carries a verification level
  (approved list, official publisher, curated, or fictional demo) shown in the
  UI. Add entries there with a real URL; set `lastChecked` once someone has
  opened the link.

## Signal sources and verification

`artifacts/skillcast-fergana/src/data/approved-sources.ts` is the approved
source catalogue. Two kinds of status are shown, and they mean different things:

- **Integration status**: *periodic* (the API retrieves it on a schedule, never
  real time), *cached*, *unavailable*, *demo baseline*, *reference* (a link
  only), *planned*, *API key required*.
- **SkillCast check** (`check: { on, url }`): the date someone opened the
  publisher's own page and confirmed the facts in `src.check.<id>`, with the
  page as evidence. Sources whose sites block automated checks (data.egov.uz,
  OECD, the ILO DOI link) or whose file could not be read stay "not checked yet".
  Unconfirmed fields show "Not confirmed yet"; nothing is marked verified
  without a check. Last audit: 18 November 2026 (it corrected ILOSTAT's update
  cadence to daily and the moved UN SDG database link).

When you re-check a source, update `check.on`, keep `check.url` pointing at the
page you read, and edit `src.check.<id>` in all three languages.

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
