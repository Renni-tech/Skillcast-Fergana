// node --test src/skillcast/lib/db.test.ts   (pnpm --filter @workspace/api-server test)
// The signal cache store on Node's built-in SQLite: no Prisma, no download.
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import { openStore } from "./db.ts";

function tempDb() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "skillcast-db-"));
  return { file: path.join(dir, "skillcast.db"), cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

test("creates the schema and round-trips runs, snapshots and changelog", () => {
  const { file, cleanup } = tempDb();
  const store = openStore(file);
  try {
    const run = store.createRun({ live: false, totalPostings: 0, sources: "[]", note: "seed" });
    store.createSnapshots([
      { runId: run.id, skillSlug: "python", postings: 3, recentPostings: 2, earlierPostings: 1, frequency: 10, trend: 60, momentum: 70 },
      { runId: run.id, skillSlug: "communication", postings: 1, recentPostings: 0, earlierPostings: 1, frequency: 5, trend: 40, momentum: 50, samples: "[]" },
    ]);
    const loaded = store.getRun(run.id);
    assert.ok(loaded);
    assert.equal(loaded.live, false);
    assert.equal(loaded.note, "seed");
    assert.ok(loaded.createdAt instanceof Date && !Number.isNaN(loaded.createdAt.getTime()));
    assert.deepEqual(loaded.snapshots.map((s) => s.skillSlug), ["communication", "python"]);

    store.setRunNote(run.id, "throttled");
    assert.equal(store.getRun(run.id)?.note, "throttled");

    store.createChangelog({ version: "v1", live: false, summary: "first", details: "{}" });
    store.createChangelog({ version: "v2", live: true, summary: "second", details: "{}" });
    assert.deepEqual(store.recentChangelog(8).map((c) => c.summary), ["second", "first"]);
  } finally {
    store.close();
    cleanup();
  }
});

test("latestRun orders by time and can exclude a run", () => {
  const { file, cleanup } = tempDb();
  const store = openStore(file);
  try {
    const a = store.createRun({ live: false, totalPostings: 0, sources: "[]", note: null });
    const b = store.createRun({ live: true, totalPostings: 5, sources: "[]", note: null });
    assert.equal(store.latestRun()?.id, b.id);
    assert.equal(store.latestRun(b.id)?.id, a.id);
  } finally {
    store.close();
    cleanup();
  }
});

test("prune removes old runs with their snapshots (cascade) and caps the changelog", () => {
  const { file, cleanup } = tempDb();
  const store = openStore(file);
  try {
    const run = store.createRun({ live: false, totalPostings: 0, sources: "[]", note: null });
    store.createSnapshots([{ runId: run.id, skillSlug: "python", postings: 1, recentPostings: 1, earlierPostings: 0, frequency: 1, trend: 1, momentum: 1 }]);
    for (let i = 0; i < 5; i++) store.createChangelog({ version: `v${i}`, live: false, summary: `s${i}`, details: "{}" });
    store.prune(new Date(Date.now() + 60_000), 2);
    assert.equal(store.getRun(run.id), null);
    assert.equal(store.recentChangelog(10).length, 0);
  } finally {
    store.close();
    cleanup();
  }
  // Keep-cap only (nothing old enough to expire).
  const second = tempDb();
  const s2 = openStore(second.file);
  try {
    for (let i = 0; i < 5; i++) s2.createChangelog({ version: `v${i}`, live: false, summary: `s${i}`, details: "{}" });
    s2.prune(new Date(0), 2);
    assert.deepEqual(s2.recentChangelog(10).map((c) => c.summary), ["s4", "s3"]);
  } finally {
    s2.close();
    second.cleanup();
  }
});

test("reads a database written in the former Prisma format (ms timestamps, 0/1 booleans)", () => {
  const { file, cleanup } = tempDb();
  const raw = new DatabaseSync(file);
  raw.exec(`CREATE TABLE "SignalRun" ("id" TEXT NOT NULL PRIMARY KEY, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "live" BOOLEAN NOT NULL, "totalPostings" INTEGER NOT NULL, "sources" TEXT NOT NULL, "note" TEXT);`);
  raw.prepare(`INSERT INTO "SignalRun" VALUES (?,?,?,?,?,?)`).run("old-run", 1731916800000, 1, 42, "[]", null);
  raw.close();
  const store = openStore(file);
  try {
    const run = store.getRun("old-run");
    assert.ok(run);
    assert.equal(run.live, true);
    assert.equal(run.totalPostings, 42);
    assert.equal(run.createdAt.toISOString(), "2024-11-18T08:00:00.000Z");
  } finally {
    store.close();
    cleanup();
  }
});
