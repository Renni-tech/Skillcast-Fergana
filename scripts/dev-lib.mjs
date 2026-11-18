// Helpers for scripts/dev.mjs, kept separate so they can be unit-tested
// (node --test scripts/dev-lib.test.mjs). No dependencies beyond Node.

import { existsSync, statfsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/** Minimum Node.js version: the API uses the built-in node:sqlite module. */
export const MIN_NODE = [22, 13];

/** True when `version` (e.g. "22.12.0") is at least MIN_NODE. */
export function nodeSupported(version) {
  const [major, minor] = String(version).replace(/^v/, '').split('.').map(Number);
  return major > MIN_NODE[0] || (major === MIN_NODE[0] && minor >= MIN_NODE[1]);
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

/** `pnpm dev` writes only to these places: the API build output, the SQLite cache and the temp folder. */
export function devWriteLocations(projectRoot) {
  return [
    { label: 'Project folder (API build in artifacts/api-server/dist, SQLite cache in artifacts/api-server/db)', dir: projectRoot },
    { label: 'System temp folder (TEMP/TMP)', dir: os.tmpdir() },
  ];
}

/** Locations with less than `minBytes` free (deduplicated by volume reading). */
export function lowSpaceLocations(projectRoot, minBytes = 200 * 1024 * 1024) {
  return devWriteLocations(projectRoot)
    .map((loc) => ({ ...loc, free: freeBytes(loc.dir) }))
    .filter(({ free }) => free !== null && free < minBytes);
}

/** Classifies a failed step's output into an actionable category. */
export function classifyFailure(output) {
  const text = String(output);
  // Error codes are matched exactly (case-sensitive, whole word) so that file
  // names or paths that merely contain the letters do not trigger a match.
  if (/\bENOSPC\b/.test(text) || /no space left on device|not enough space on the disk/i.test(text)) return 'disk-full';
  if (/\b(EPERM|EBUSY)\b/.test(text) || /operation not permitted|resource busy or locked/i.test(text)) return 'file-locked';
  if (/\bERR_UNKNOWN_BUILTIN_MODULE\b/.test(text) || /No such built-in module: node:sqlite/.test(text)) return 'old-node';
  if (/\b(ENOTFOUND|ETIMEDOUT|ECONNRESET|ECONNREFUSED|EAI_AGAIN)\b/.test(text)
    || /getaddrinfo|socket hang up|self[- ]signed certificate|unable to get local issuer|fetch failed|\b40[37] Forbidden\b/i.test(text)) return 'network';
  return 'unknown';
}

/** Human guidance for a classified failure. Never suggests deleting project files. */
export function failureAdvice(kind, { projectRoot, step }) {
  const isWin = process.platform === 'win32';
  if (kind === 'disk-full') {
    const lines = devWriteLocations(projectRoot).map(({ label, dir }) => {
      const free = freeBytes(existsSync(dir) ? dir : path.dirname(dir));
      return `    • ${label}: ${dir}${free === null ? '' : `  (free: ${formatMB(free)})`}`;
    });
    return [
      `${step} ran out of disk space (ENOSPC). This is a problem with the computer's free space, not with SkillCast.`,
      '`pnpm dev` downloads nothing; it only writes a few MB of build output and a small SQLite file here:',
      ...lines,
      'What to do:',
      `  1. Free space on the drive that is full${isWin ? ' (Settings → System → Storage → Cleanup recommendations)' : ''}.`,
      isWin
        ? '  2. If only C: is full but another drive has space, point the temp folder there for this terminal:\n       New-Item -ItemType Directory D:\\Temp -Force; $env:TEMP = "D:\\Temp"; $env:TMP = "D:\\Temp"'
        : '  2. If the temp drive is full but another has space, run with TMPDIR=/path/with/space pnpm dev.',
      '  3. Run `pnpm dev` again.',
    ].join('\n');
  }
  if (kind === 'file-locked') {
    return `${step} could not write a file because it is in use. Close other terminals running SkillCast (or wait for an antivirus scan), then run \`pnpm dev\` again.`;
  }
  if (kind === 'old-node') {
    return `${step} needs Node.js ${MIN_NODE.join('.')} or newer (built-in SQLite). Install Node 24 LTS from https://nodejs.org, open a new terminal and run \`pnpm dev\` again.`;
  }
  if (kind === 'network') {
    return `${step} hit a network error. \`pnpm dev\` itself needs no internet; check your connection or proxy (HTTPS_PROXY) if a dependency tried to download something, then run \`pnpm dev\` again.`;
  }
  return `${step} failed. See the output above.`;
}
