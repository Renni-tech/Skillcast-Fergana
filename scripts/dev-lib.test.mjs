// node --test scripts/dev-lib.test.mjs
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { classifyFailure, failureAdvice, freeBytes, prismaClientState, prismaWriteLocations } from './dev-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiDir = path.join(root, 'artifacts', 'api-server');

test('classifies the real Windows Prisma failure as disk-full', () => {
  // Message reported from a Windows machine during `pnpm dev`.
  assert.equal(classifyFailure('Error: ENOSPC: no space left on device, write'), 'disk-full');
  assert.equal(classifyFailure('There is not enough space on the disk.'), 'disk-full');
});

test('classifies locks and network errors, and leaves others unknown', () => {
  assert.equal(classifyFailure("EPERM: operation not permitted, rename 'query_engine-windows.dll.node.tmp'"), 'file-locked');
  assert.equal(classifyFailure('request to https://binaries.prisma.sh failed, reason: getaddrinfo ENOTFOUND'), 'network');
  assert.equal(classifyFailure('Error: something else'), 'unknown');
  // A path that merely contains the letters is not an error code.
  assert.equal(classifyFailure('Prisma schema loaded from C:/work/enospc-notes/schema.prisma'), 'unknown');
});

test('disk-full advice names every write location and never suggests deleting files', () => {
  const advice = failureAdvice('disk-full', { projectRoot: root, step: 'Generating Prisma client' });
  for (const { dir } of prismaWriteLocations(root)) assert.ok(advice.includes(dir), dir);
  assert.match(advice, /ENOSPC/);
  assert.doesNotMatch(advice, /\b(rm -rf|del |Remove-Item|rmdir)\b/i);
});

test('free space can be read for an existing directory', () => {
  const free = freeBytes(root);
  assert.ok(free === null || free > 0);
});

test('Prisma client state is current only with a matching stamp', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'schema-'));
  try {
    const schema = path.join(dir, 'schema.prisma');
    writeFileSync(schema, 'generator client { provider = "prisma-client-js" }\n');
    const before = prismaClientState(apiDir, schema);
    assert.equal(typeof before.current, 'boolean');
    // A different schema never matches the stamp written for the real one.
    assert.equal(before.current, false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
