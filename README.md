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

1. Generates the Prisma client for the API.
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
```

The frontend tests use [Bun](https://bun.sh) (`bun test`). Install Bun to run them;
`pnpm dev` does not need it.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `vite: not found`, `node_modules missing`, or `Dependencies are not installed` | Run `pnpm install` in the project root. |
| `Port 8080 is already in use` (or 5173) | Close the other program, or set `API_PORT` / `WEB_PORT` in `.env`. On Windows, find it with `netstat -ano \| findstr :8080`. |
| `Cannot find module @rollup/rollup-win32-x64-msvc` (or a similar `win32` / `darwin` package) | Delete `node_modules` and run `pnpm install` again. These native packages are platform-specific and must be installed on the machine that runs them. |
| `Use pnpm instead` during install | Install with `pnpm install`, not `npm install` or `yarn`. |
| `Generating Prisma client… failed` | Prisma downloads its engine on first use; check your internet connection or proxy, then run `pnpm dev` again. |
| `pnpm` is not recognized | Run `npm install -g pnpm@10` and open a new terminal. |
| PowerShell blocks `pnpm.ps1` ("running scripts is disabled") | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, or use the Command Prompt instead of PowerShell. |
| Signal sources show "Unavailable" | Normal when the official sources cannot be reached from your network. The app falls back to the last cached result or a labelled demo baseline. |

## Replit

Replit does not use `pnpm dev`; it runs each artifact's own workflow (see
`replit.md` and `artifacts/*/.replit-artifact/artifact.toml`). The local
script only adds an opt-in `/api` proxy (`API_PROXY_TARGET`) that Replit never
sets.
