#!/usr/bin/env node
// ─── Local development: `pnpm dev` ─────────────────────────────────────────
// Starts the SkillCast Fergana API and frontend together on Windows, macOS and
// Linux. Every step runs as a plain `node` process (no shell syntax), so it
// behaves the same in PowerShell, cmd.exe and bash.
//
//   1. build the API        (artifacts/api-server/build.mjs, esbuild, a few MB)
//   2. prepare the database (artifacts/api-server/prepare-db.mjs, non-destructive)
//   3. start the API and wait for GET /api/healthz
//   4. start Vite with BASE_PATH=/ and /api proxied to the API
//
// Nothing is downloaded: the API stores its cache with Node's built-in SQLite
// (node:sqlite), so there is no Prisma generate step and no engine download.
//
// Ctrl+C stops both servers. If either server exits, the other is stopped too.
// Replit does not use this script; it keeps its own artifact workflows.

import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MIN_NODE, classifyFailure, failureAdvice, formatMB, lowSpaceLocations, nodeSupported } from './dev-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiDir = path.join(root, 'artifacts', 'api-server');
const webDir = path.join(root, 'artifacts', 'skillcast-fergana');
const isWindows = process.platform === 'win32';

const color = (code) => (text) => (process.stdout.isTTY ? `\x1b[${code}m${text}\x1b[0m` : text);
const cyan = color(36), green = color(32), red = color(31), dim = color(2), bold = color(1);
const log = (msg) => console.log(`${cyan('[dev]')} ${msg}`);
const fail = (msg) => { console.error(`${red('[dev]')} ${msg}`); process.exit(1); };

// ── Preconditions ──────────────────────────────────────────────────────────
if (!nodeSupported(process.versions.node)) {
  fail(`Node.js ${MIN_NODE.join('.')} or newer is required (found ${process.versions.node}). Install Node 24 LTS from https://nodejs.org and open a new terminal.`);
}
if (!existsSync(path.join(root, 'node_modules')) || !existsSync(path.join(webDir, 'node_modules'))) {
  fail('Dependencies are not installed. Run `pnpm install` once in the project folder, then `pnpm dev`.');
}

// Optional local overrides from .env (see .env.example). Empty values are ignored.
const envFile = path.join(root, '.env');
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
  for (const [key, value] of Object.entries(process.env)) if (value === '') delete process.env[key];
  log(`Loaded ${dim('.env')}`);
}

const port = (name, fallback) => {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value <= 0 || value > 65535) fail(`${name} must be a port number (got "${process.env[name]}").`);
  return value;
};
const API_PORT = port('API_PORT', 8080);
// 127.0.0.1 by default: no Windows Firewall prompt, nothing exposed on the network.
// Set HOST=0.0.0.0 in .env to open the app from a phone or tablet on the same Wi-Fi.
const HOST = process.env.HOST || '127.0.0.1';
const WEB_PORT = port('WEB_PORT', 5173);
if (API_PORT === WEB_PORT) fail('API_PORT and WEB_PORT must be different.');

const portFree = (p) => new Promise((resolve) => {
  const server = net.createServer().once('error', () => resolve(false))
    .once('listening', () => server.close(() => resolve(true)));
  server.listen(p, HOST);
});

// Resolve CLIs from the packages that depend on them, so no global installs are needed.
// Uses each package's own "bin" entry, which works even when "exports" hides it.
const resolveBin = (dir, pkg, bin = pkg) => {
  try {
    const require = createRequire(path.join(dir, 'package.json'));
    const manifestPath = require.resolve(`${pkg}/package.json`);
    const manifest = require(manifestPath);
    const rel = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.[bin];
    if (!rel) throw new Error('no bin');
    return path.join(path.dirname(manifestPath), rel);
  } catch {
    return fail(`Could not find the ${pkg} command-line tool. Run \`pnpm install\` again.`);
  }
};
const viteCli = resolveBin(webDir, 'vite');

// ── Process management ─────────────────────────────────────────────────────
const children = new Set();
let shuttingDown = false;

function stop(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  if (isWindows) {
    // Kill the whole tree (Vite starts an esbuild helper process).
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    child.kill('SIGTERM');
    setTimeout(() => { if (child.exitCode === null) child.kill('SIGKILL'); }, 5000).unref();
  }
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  log('Stopping servers…');
  for (const child of children) stop(child);
  const deadline = setTimeout(() => process.exit(code), 6000);
  deadline.unref();
  const check = setInterval(() => {
    if ([...children].every((c) => c.exitCode !== null || c.signalCode !== null)) {
      clearInterval(check);
      process.exit(code);
    }
  }, 100);
}

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP', ...(isWindows ? ['SIGBREAK'] : [])]) {
  process.on(signal, () => shutdown(0));
}

function prefixed(stream, label) {
  let buffer = '';
  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';
    for (const line of lines) if (line.trim()) console.log(`${label} ${line}`);
  });
}

/**
 * Run a one-off setup step, streaming its output. On failure, classify the
 * output (disk full, file locked, network) and print what to do next.
 */
function step(title, args, cwd, env = {}) {
  log(title);
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, { cwd, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
    children.add(child);
    let tail = '';
    const keep = (chunk) => { tail = (tail + chunk.toString()).slice(-20000); };
    child.stdout.on('data', (c) => { process.stdout.write(c); keep(c); });
    child.stderr.on('data', (c) => { process.stderr.write(c); keep(c); });
    child.on('exit', (code, signal) => {
      children.delete(child);
      if (shuttingDown) return;
      if (code === 0) return resolve();
      const advice = failureAdvice(classifyFailure(tail), { projectRoot: root, step: title.replace(/…$/, '') });
      fail(`${title.replace(/…$/, '')} failed (${signal ?? `exit code ${code}`}).\n${advice}`);
    });
  });
}

/** Start a long-running server; if it exits on its own, stop everything. */
function serve(label, args, cwd, env) {
  const child = spawn(process.execPath, args, { cwd, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  children.add(child);
  prefixed(child.stdout, label);
  prefixed(child.stderr, label);
  child.on('exit', (code, signal) => {
    if (!shuttingDown) {
      console.error(`${red('[dev]')} ${label} stopped unexpectedly (${signal ?? `exit code ${code}`}).`);
      shutdown(1);
    }
  });
  return child;
}

async function waitFor(url, label, timeoutMs = 60000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (shuttingDown) return;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 400));
  }
  console.error(`${red('[dev]')} ${label} did not respond at ${url} within ${timeoutMs / 1000}s.`);
  shutdown(1);
}

function lanUrls() {
  return Object.values(os.networkInterfaces()).flat()
    .filter((a) => a && a.family === 'IPv4' && !a.internal)
    .map((a) => `http://${a.address}:${WEB_PORT}/`);
}

// ── Start ──────────────────────────────────────────────────────────────────
for (const [name, p] of [['API_PORT', API_PORT], ['WEB_PORT', WEB_PORT]]) {
  if (!(await portFree(p))) {
    fail(`Port ${p} is already in use. Stop the program using it, or set ${name} in .env (see .env.example).`);
  }
}

for (const { label, dir, free } of lowSpaceLocations(root)) {
  log(red(`Low disk space: ${formatMB(free)} free on the drive for ${dir} (${label}). Building may fail; free some space if it does.`));
}
await step('Building API…', ['build.mjs'], apiDir, { NODE_ENV: 'development' });
await step('Preparing local SQLite cache…', ['prepare-db.mjs'], apiDir);

log(`Starting API on port ${API_PORT}…`);
serve(cyan('[api]'), ['--enable-source-maps', '--disable-warning=ExperimentalWarning', path.join('dist', 'index.mjs')], apiDir, {
  NODE_ENV: 'development', PORT: String(API_PORT), HOST,
});
await waitFor(`http://127.0.0.1:${API_PORT}/api/healthz`, 'API');

log(`Starting frontend on port ${WEB_PORT}…`);
serve(green('[web]'), [viteCli, '--config', 'vite.config.ts'], webDir, {
  NODE_ENV: 'development', PORT: String(WEB_PORT), BASE_PATH: '/', WEB_HOST: HOST,
  API_PROXY_TARGET: `http://127.0.0.1:${API_PORT}`,
});
await waitFor(`http://127.0.0.1:${WEB_PORT}/`, 'Frontend');

if (!shuttingDown) {
  console.log([
    '',
    bold('  SkillCast Fergana is running'),
    `  ${green('Frontend')}  http://localhost:${WEB_PORT}/`,
    `  ${cyan('API')}       http://localhost:${API_PORT}/api/healthz`,
    ...(HOST === '0.0.0.0' ? lanUrls().map((u) => `  ${green('On Wi-Fi')}  ${u}`) : []),
    `  ${dim('The frontend proxies /api to the API. Press Ctrl+C to stop both.')}`,
    '',
  ].join('\n'));
}
