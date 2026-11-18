// node --test scripts/dev-lib.test.mjs
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  classifyFailure, devWriteLocations, failureAdvice, freeBytes, lowSpaceLocations, nodeSupported,
} from './dev-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('classifies the real Windows disk-full failure', () => {
  // Message reported from a Windows machine during `pnpm dev`.
  assert.equal(classifyFailure('Error: ENOSPC: no space left on device, write'), 'disk-full');
  assert.equal(classifyFailure('There is not enough space on the disk.'), 'disk-full');
});

test('classifies locks, old Node, network/proxy errors, and leaves others unknown', () => {
  assert.equal(classifyFailure("EPERM: operation not permitted, rename 'dist\\index.mjs'"), 'file-locked');
  assert.equal(classifyFailure('Error [ERR_UNKNOWN_BUILTIN_MODULE]: No such built-in module: node:sqlite'), 'old-node');
  assert.equal(classifyFailure('request failed, reason: getaddrinfo ENOTFOUND'), 'network');
  assert.equal(classifyFailure('Failed to fetch sha256 checksum at https://example.org/x.gz.sha256 - 403 Forbidden'), 'network');
  assert.equal(classifyFailure('Error: something else'), 'unknown');
  // A path that merely contains the letters is not an error code.
  assert.equal(classifyFailure('loaded from C:/work/enospc-notes/schema.sql'), 'unknown');
});

test('disk-full advice names every write location and never suggests deleting files', () => {
  const advice = failureAdvice('disk-full', { projectRoot: root, step: 'Building API' });
  for (const { dir } of devWriteLocations(root)) assert.ok(advice.includes(dir), dir);
  assert.match(advice, /ENOSPC/);
  assert.doesNotMatch(advice, /\b(rm -rf|del |Remove-Item|rmdir)\b/i);
});

test('Node version gate matches node:sqlite availability (22.13+)', () => {
  assert.equal(nodeSupported('20.12.0'), false);
  assert.equal(nodeSupported('22.12.1'), false);
  assert.equal(nodeSupported('22.13.0'), true);
  assert.equal(nodeSupported('v24.11.0'), true);
  assert.equal(nodeSupported(process.versions.node), true);
});

test('free space can be read, and the low-space check uses a threshold', () => {
  const free = freeBytes(root);
  assert.ok(free === null || free > 0);
  assert.deepEqual(lowSpaceLocations(root, 0), []);
  if (free !== null) assert.ok(lowSpaceLocations(root, Number.MAX_SAFE_INTEGER).length >= 1);
});
