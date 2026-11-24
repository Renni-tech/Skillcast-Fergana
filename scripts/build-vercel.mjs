#!/usr/bin/env node
// Builds SkillCast Fergana for Vercel with the Build Output API (v3):
//
//   .vercel/output/
//     static/                      the frontend (artifacts/skillcast-fergana/dist/public)
//     functions/api/healthz.func/  the Express API bundled as one Node function
//     functions/api/<route>.func → symlinks to the same function, one per API path
//     config.json                  routing: files and functions first, then SPA fallback
//
// Why: the API (artifacts/api-server) is a long-running Express server. A
// static-only Vercel deployment has no /api at all, so live signals, the
// assistant and speech return Vercel's 404. Here the very same Express app
// (src/vercel.ts) runs as a Vercel Function; local development is unchanged.
//
// Vercel runs this as the Build Command (see vercel.json). It can also be run
// locally: `node scripts/build-vercel.mjs`.

import { spawnSync } from 'node:child_process';
import { cp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, '.vercel', 'output');
const web = path.join(root, 'artifacts', 'skillcast-fergana');
const api = path.join(root, 'artifacts', 'api-server');
const RUNTIME = process.env.VERCEL_FUNCTION_RUNTIME || 'nodejs22.x';

const log = (msg) => console.log(`[build-vercel] ${msg}`);

/** API paths, read from the Express routers so a new route is never missed. */
export async function apiRoutes() {
  const dir = path.join(api, 'src', 'routes');
  const routes = new Set();
  for (const file of await readdir(dir)) {
    if (!file.endsWith('.ts') || file.endsWith('.test.ts')) continue;
    const src = await readFile(path.join(dir, file), 'utf8');
    for (const m of src.matchAll(/router\.(?:route|get|post|put|patch|delete)\(\s*['"](\/[^'"]+)['"]/g)) {
      if (m[1].includes(':') || m[1].includes('*')) throw new Error(`Route ${m[1]} has parameters; add a catch-all function for it.`);
      routes.add(m[1].replace(/\/$/, ''));
    }
  }
  return [...routes].sort();
}

async function main() {
  await rm(out, { recursive: true, force: true });

  // 1. Frontend. vite.config.ts requires PORT and BASE_PATH even for a build.
  log('building the frontend');
  const env = { ...process.env, PORT: process.env.PORT || '3000', BASE_PATH: process.env.BASE_PATH || '/', NODE_ENV: 'production' };
  const res = spawnSync('pnpm', ['--filter', '@workspace/skillcast-fergana', 'run', 'build'], { cwd: root, env, stdio: 'inherit', shell: process.platform === 'win32' });
  if (res.status !== 0) throw new Error('frontend build failed');
  await cp(path.join(web, 'dist', 'public'), path.join(out, 'static'), { recursive: true });

  // 2. API function: the existing Express app, bundled with the API's own esbuild setup.
  log('bundling the API function');
  const { bundleApi } = await import(new URL('../artifacts/api-server/build.mjs', import.meta.url).href);
  const fnDir = path.join(out, 'functions', 'api', 'healthz.func');
  await bundleApi({ entry: 'src/vercel.ts', outdir: fnDir, define: { 'process.env.NODE_ENV': '"production"' } });
  await writeFile(path.join(fnDir, 'package.json'), JSON.stringify({ type: 'module' }) + '\n');
  await writeFile(path.join(fnDir, '.vc-config.json'), JSON.stringify({
    runtime: RUNTIME,
    handler: 'vercel.mjs',
    launcherType: 'Nodejs',
    shouldAddHelpers: false,
    shouldAddSourcemapSupport: true,
    // SIAT needs two requests of up to 12 s each; the AI and speech routes allow up to 50 s.
    maxDuration: 60,
  }, null, 2) + '\n');

  // 3. One function path per API route, all pointing to the same bundle (symlinked .func
  //    directories are part of the Build Output API). Each route keeps its exact URL, so
  //    Express sees the same paths as in local development; no rewrite is involved.
  const routes = await apiRoutes();
  for (const route of routes) {
    if (route === '/healthz') continue;
    const link = path.join(out, 'functions', 'api', `${route.slice(1)}.func`);
    await mkdir(path.dirname(link), { recursive: true });
    await symlink(path.relative(path.dirname(link), fnDir), link, 'dir');
  }
  log(`API paths: ${routes.map((r) => `/api${r}`).join(', ')}`);

  // 4. Routing: static files and functions first; any other non-API path gets the SPA
  //    (navigation uses #hashes, so this is only a safety net). Unknown /api paths stay 404.
  await writeFile(path.join(out, 'config.json'), JSON.stringify({
    version: 3,
    routes: [
      { handle: 'filesystem' },
      { src: '^/(?!api(?:/|$)).*$', dest: '/index.html' },
    ],
  }, null, 2) + '\n');

  log(`done → ${path.relative(root, out)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
