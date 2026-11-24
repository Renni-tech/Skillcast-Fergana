// node --test scripts/build-vercel.test.mjs
// Vercel production paths: every Express route must become a function path,
// and vercel.json must run the build that creates them.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { apiRoutes } from './build-vercel.mjs';

test('every API route the frontend uses is deployed as a Vercel function path', async () => {
  const routes = await apiRoutes();
  for (const r of ['/healthz', '/fergana/signals', '/signals', '/signals/cron', '/coach', '/extract-cv', '/assistant', '/tts']) {
    assert.ok(routes.includes(r), `missing /api${r}`);
  }
  assert.ok(routes.every((r) => r.startsWith('/') && !r.includes(':')), 'routes are static paths');
});

test('vercel.json builds with the Build Output API script and pnpm', async () => {
  const cfg = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.equal(cfg.buildCommand, 'node scripts/build-vercel.mjs');
  assert.match(cfg.installCommand, /^pnpm install/);
  assert.equal(cfg.framework, null);
});

test('the frontend calls signals on the same origin, never localhost', async () => {
  const src = await readFile(new URL('../artifacts/skillcast-fergana/src/components/skillcast/shared.tsx', import.meta.url), 'utf8');
  assert.match(src, /fetch\('\/api\/fergana\/signals'/);
  assert.doesNotMatch(src, /localhost|127\.0\.0\.1/);
});
