// Helpers for scripts/dev.mjs, kept separate so they can be unit-tested
// (node --test scripts/dev-lib.test.mjs). No dependencies beyond Node.

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statfsSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';

const STAMP = '.skillcast-generate-stamp';

/**
 * Where the generated Prisma client lives for a package directory, and
 * whether it is current for this schema, Prisma version and platform.
 * Prisma 6 writes the client (with a copy of the platform query engine) to
 * node_modules/.prisma/client next to @prisma/client.
 */
export function prismaClientState(packageDir, schemaPath) {
  const require = createRequire(path.join(packageDir, 'package.json'));
  const clientPkg = require.resolve('@prisma/client/package.json');
  const prismaPkg = require.resolve('prisma/package.json');
  const outputDir = path.join(path.dirname(clientPkg), '..', '..', '.prisma', 'client');
  const version = JSON.parse(readFileSync(prismaPkg, 'utf8')).version;
  const schemaHash = createHash('sha256').update(readFileSync(schemaPath)).digest('hex');
  const expected = `${schemaHash} ${version} ${process.platform}-${process.arch}`;
  let engine = null;
  try {
    engine = readdirSync(outputDir).find((f) => /query_engine.*\.node$/.test(f)) ?? null;
  } catch { /* not generated yet */ }
  let stamp = null;
  try { stamp = readFileSync(path.join(outputDir, STAMP), 'utf8').trim(); } catch { /* no stamp */ }
  return {
    outputDir,
    engine,
    current: Boolean(engine && existsSync(path.join(outputDir, 'index.js')) && stamp === expected),
    writeStamp: () => writeFileSync(path.join(outputDir, STAMP), `${expected}\n`),
  };
}

/** Free bytes on the volume holding `dir`, or null if it cannot be read. */
export function freeBytes(dir) {
  try {
    const s = statfsSync(dir);
    return s.bavail * s.bsize;
  } catch {
    return null;
  }
}

export const formatMB = (bytes) => `${Math.round(bytes / 1024 / 1024)} MB`;

/**
 * The places Prisma writes to while downloading engines (Prisma 6):
 * the system temp folder, its download cache, and node_modules.
 */
export function prismaWriteLocations(projectRoot) {
  const cache = process.platform === 'win32'
    ? path.join(projectRoot, 'node_modules', '.cache', 'prisma') // falls back to %APPDATA%\Prisma
    : path.join(process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache'), 'prisma');
  return [
    { label: 'System temp folder (TEMP/TMP)', dir: os.tmpdir() },
    { label: 'Prisma engine cache', dir: cache },
    { label: 'Project node_modules', dir: path.join(projectRoot, 'node_modules') },
  ];
}

/** Classifies a failed step's output into an actionable category. */
export function classifyFailure(output) {
  const text = String(output);
  // Error codes are matched exactly (case-sensitive, whole word) so that file
  // names or paths that merely contain the letters do not trigger a match.
  if (/\bENOSPC\b/.test(text) || /no space left on device|not enough space on the disk/i.test(text)) return 'disk-full';
  if (/\b(EPERM|EBUSY)\b/.test(text) || /operation not permitted|resource busy or locked/i.test(text)) return 'file-locked';
  if (/\b(ENOTFOUND|ETIMEDOUT|ECONNRESET|ECONNREFUSED|EAI_AGAIN)\b/.test(text)
    || /getaddrinfo|socket hang up|self[- ]signed certificate|unable to get local issuer|fetch failed/i.test(text)) return 'network';
  return 'unknown';
}

/** Human guidance for a classified failure. Never suggests deleting user files. */
export function failureAdvice(kind, { projectRoot, step }) {
  const isWin = process.platform === 'win32';
  if (kind === 'disk-full') {
    const lines = prismaWriteLocations(projectRoot).map(({ label, dir }) => {
      const free = freeBytes(existsSync(dir) ? dir : path.dirname(dir));
      return `    • ${label}: ${dir}${free === null ? '' : `  (free: ${formatMB(free)})`}`;
    });
    return [
      `${step} ran out of disk space (ENOSPC).`,
      'On first run Prisma downloads its query and schema engines (about 40 MB compressed)',
      'and copies them into a cache and node_modules, so it needs roughly 300 MB free on each drive below:',
      ...lines,
      'What to do:',
      '  1. Free space on the drive that is full (on Windows, Settings → System → Storage).',
      isWin
        ? '  2. If only C: is full but another drive has space, point the temp folder there for this terminal:\n       $env:TEMP = "D:\\Temp"; $env:TMP = "D:\\Temp"   (create the folder first)'
        : '  2. If the temp drive is full but another has space, run with TMPDIR=/path/with/space pnpm dev.',
      '  3. Run `pnpm dev` again. Already-downloaded engines are reused; nothing is downloaded twice.',
    ].join('\n');
  }
  if (kind === 'file-locked') {
    return `${step} could not write a file because it is in use. Close other terminals or editors running the API (or an antivirus scan), then run \`pnpm dev\` again.`;
  }
  if (kind === 'network') {
    return `${step} could not download Prisma engines (network error). Check your internet connection or proxy. Behind a corporate proxy, set HTTPS_PROXY; Prisma also honours PRISMA_ENGINES_MIRROR. Then run \`pnpm dev\` again.`;
  }
  return `${step} failed. See the output above.`;
}
