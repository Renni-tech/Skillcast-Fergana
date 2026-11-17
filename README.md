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

### Requirements

- **Node.js 24 LTS** (20.12 or newer works). Check with `node -v`.
- **pnpm 10** (the version this lockfile was made with):
  ```powershell
  npm install -g pnpm@10
  ```
- **Git** and **VS Code**.

### One-time setup

```powershell
git clone https://github.com/Renni-tech/Skillcast-Fergana.git
cd Skillcast-Fergana
pnpm install
```

### Every run

```powershell
pnpm dev
```

`pnpm dev` does everything in order and prints the addresses when ready:

1. Generates the Prisma client for the API (only when the schema, Prisma
   version or platform changed; otherwise it prints "Prisma client is up to date").
2. Builds the API and creates or updates the local SQLite cache
   (`artifacts/api-server/db/skillcast.db`, non-destructive).
3. Starts the API on port **8080** and waits until `/api/healthz` answers.
4. Starts the frontend on port **5173**, with `/api` proxied to the API.

```
  SkillCast Fergana is running
  Frontend  http://localhost:5173/
  API       http://localhost:8080/api/healthz
```

Open **http://localhost:5173/**. Press **Ctrl+C** once to stop both servers. If
either server crashes, the other one is stopped too, so nothing keeps running
in the background.

The frontend reloads instantly when you edit it. After changing API code, stop
with Ctrl+C and run `pnpm dev` again (the API is rebuilt on every start).

### Disk space and the first run

The first `pnpm dev` downloads Prisma's engines for your platform (Windows:
`query_engine-windows.dll.node` and `schema-engine-windows.exe`, about 40 MB
compressed). This download is expected and happens once: `pnpm install` skips
Prisma's own install-time download, so the engines are fetched on first use.
Prisma writes them to three places, so keep roughly **300 MB free** on each
drive involved:

| Location | Windows | macOS / Linux |
| --- | --- | --- |
| Temp folder (download) | `%TEMP%` (usually on `C:`) | `$TMPDIR` or `/tmp` |
| Prisma engine cache | `node_modules\.cache\prisma` in the project, else `%APPDATA%\Prisma` | `~/.cache/prisma` |
| Project | `node_modules` | `node_modules` |

Later runs reuse the cached engines and skip `prisma generate` when nothing
changed. `pnpm dev` warns when a drive has less than 300 MB free, and if a step
runs out of space it says which locations Prisma uses and how much is free.

### Open in VS Code

1. **File → Open Folder…** and choose the `Skillcast-Fergana` folder.
2. **Terminal → New Terminal** (PowerShell on Windows).
3. Run `pnpm install` the first time, then `pnpm dev`.
4. Ctrl+click `http://localhost:5173/` in the terminal.

### Environment variables

Nothing is required for local development. To change a setting, copy
`.env.example` to `.env` in the project root and edit it. `.env` is git-ignored;
never commit real keys.

| Variable | Default | Purpose |
| --- | --- | --- |
| `WEB_PORT` | `5173` | Frontend port. |
| `API_PORT` | `8080` | API port (the frontend proxies `/api` here). |
| `LOG_LEVEL` | `info` | API log level. |
| `RUNPOD_API_KEY`, `RUNPOD_ENDPOINT_ID` | unset | Optional RunPod model for CV extraction and narrated explanations. Without them the app uses its deterministic fallbacks. |
| `CRON_SECRET` | unset | Optional; protects `GET /api/signals/cron`. |

`DATABASE_URL` is **not** needed: the API keeps signal snapshots in SQLite.

### Checks

```powershell
pnpm run typecheck
pnpm --filter @workspace/skillcast-fergana test
pnpm run test:dev
```

`test:dev` checks the `pnpm dev` helpers (error classification, Prisma client
detection) with Node's built-in test runner.

The frontend tests use [Bun](https://bun.sh) (`bun test`). Install Bun to run them;
`pnpm dev` does not need it.

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

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `vite: not found`, `node_modules missing`, or `Dependencies are not installed` | Run `pnpm install` in the project root. |
| `Port 8080 is already in use` (or 5173) | Close the other program, or set `API_PORT` / `WEB_PORT` in `.env`. On Windows, find it with `netstat -ano \| findstr :8080`. |
| `Cannot find module @rollup/rollup-win32-x64-msvc` (or a similar `win32` / `darwin` package) | Delete `node_modules` and run `pnpm install` again. These native packages are platform-specific and must be installed on the machine that runs them. |
| `Use pnpm instead` during install | Install with `pnpm install`, not `npm install` or `yarn`. |
| `Generating Prisma client failed` … `ENOSPC: no space left on device, write` | A drive Prisma writes to is full (see **Disk space and the first run**). Usually it is `C:`, because `%TEMP%` is there even when the project is on another drive. Free space (Settings → System → Storage), or point the temp folder at a drive with space for this terminal: `New-Item -ItemType Directory D:\Temp -Force; $env:TEMP="D:\Temp"; $env:TMP="D:\Temp"`, then run `pnpm dev` again. The message lists each location and its free space. |
| `Generating Prisma client failed` with a network error | Prisma downloads its engine on first use: check your internet connection or proxy (`HTTPS_PROXY`), then run `pnpm dev` again. |
| `EPERM` / `EBUSY` while generating | Another process holds the engine file: stop other running copies of the API (or wait for an antivirus scan), then run `pnpm dev` again. |
| `pnpm` is not recognized | Run `npm install -g pnpm@10` and open a new terminal. |
| PowerShell blocks `pnpm.ps1` ("running scripts is disabled") | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, or use the Command Prompt instead of PowerShell. |
| Signal sources show "Unavailable" | Normal when the official sources cannot be reached from your network. The app falls back to the last cached result or a labelled demo baseline. |

## Replit

Replit does not use `pnpm dev`; it runs each artifact's own workflow (see
`replit.md` and `artifacts/*/.replit-artifact/artifact.toml`). The local
script only adds an opt-in `/api` proxy (`API_PROXY_TARGET`) that Replit never
sets.
