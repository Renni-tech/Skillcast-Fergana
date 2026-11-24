// Local SQLite cache for signal runs, snapshots and the forecast changelog.
//
// Uses Node's built-in `node:sqlite` (Node 22.13+), so there is nothing to
// generate or download: no Prisma engines, no native build, no extra disk use.
// The tables and column formats match the earlier Prisma schema (DateTime as
// epoch milliseconds, Boolean as 0/1, JSON as text), so an existing
// db/skillcast.db keeps working.
import { mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { tmpdir } from "node:os";

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS "SignalRun" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "live" BOOLEAN NOT NULL,
  "totalPostings" INTEGER NOT NULL,
  "sources" TEXT NOT NULL,
  "note" TEXT
);
CREATE TABLE IF NOT EXISTS "SignalSnapshot" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "runId" TEXT NOT NULL,
  "skillSlug" TEXT NOT NULL,
  "postings" INTEGER NOT NULL,
  "recentPostings" INTEGER NOT NULL,
  "earlierPostings" INTEGER NOT NULL,
  "frequency" REAL NOT NULL,
  "trend" REAL NOT NULL,
  "momentum" REAL NOT NULL,
  "samples" JSONB,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SignalSnapshot_runId_fkey" FOREIGN KEY ("runId") REFERENCES "SignalRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "SignalSnapshot_runId_skillSlug_key" ON "SignalSnapshot"("runId", "skillSlug");
CREATE TABLE IF NOT EXISTS "ChangelogEntry" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "version" TEXT NOT NULL,
  "live" BOOLEAN NOT NULL,
  "summary" TEXT NOT NULL,
  "details" TEXT NOT NULL
);
`;

export interface SignalRunRow {
  id: string;
  createdAt: Date;
  live: boolean;
  totalPostings: number;
  sources: string;
  note: string | null;
}
export interface SignalSnapshotRow {
  id: string;
  runId: string;
  skillSlug: string;
  postings: number;
  recentPostings: number;
  earlierPostings: number;
  frequency: number;
  trend: number;
  momentum: number;
  samples: string | null;
  createdAt: Date;
}
export interface ChangelogRow {
  id: string;
  createdAt: Date;
  version: string;
  live: boolean;
  summary: string;
  details: string;
}
export type NewSnapshot = Omit<SignalSnapshotRow, "id" | "createdAt" | "samples"> & {
  samples?: string;
};

/** Accepts epoch ms (written by this module and by Prisma) or ISO/SQL text. */
function toDate(value: unknown): Date {
  if (typeof value === "number" || typeof value === "bigint") return new Date(Number(value));
  const text = String(value);
  return new Date(/^\d+$/.test(text) ? Number(text) : text.replace(" ", "T") + (/[zZ]|[+-]\d\d:?\d\d$/.test(text) ? "" : "Z"));
}
type Raw = Record<string, unknown>;
const runRow = (r: Raw): SignalRunRow => ({
  id: String(r.id), createdAt: toDate(r.createdAt), live: Boolean(r.live),
  totalPostings: Number(r.totalPostings), sources: String(r.sources), note: r.note == null ? null : String(r.note),
});
const snapshotRow = (r: Raw): SignalSnapshotRow => ({
  id: String(r.id), runId: String(r.runId), skillSlug: String(r.skillSlug),
  postings: Number(r.postings), recentPostings: Number(r.recentPostings), earlierPostings: Number(r.earlierPostings),
  frequency: Number(r.frequency), trend: Number(r.trend), momentum: Number(r.momentum),
  samples: r.samples == null ? null : String(r.samples), createdAt: toDate(r.createdAt),
});
const changelogRow = (r: Raw): ChangelogRow => ({
  id: String(r.id), createdAt: toDate(r.createdAt), version: String(r.version),
  live: Boolean(r.live), summary: String(r.summary), details: String(r.details),
});

export function defaultDatabaseFile(): string {
  // On Vercel the deployed bundle is read-only; /tmp is the only writable place.
  const directory = process.env.VERCEL
    ? path.join(tmpdir(), "skillcast")
    : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../db");
  mkdirSync(directory, { recursive: true });
  return path.join(directory, "skillcast.db");
}

/** Small typed store over the three cache tables. */
export function openStore(file: string = defaultDatabaseFile()) {
  const sql = new DatabaseSync(file);
  sql.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;");
  sql.exec(SCHEMA_SQL);

  // Monotonic timestamps so "latest" ordering is stable even within one millisecond.
  let lastStamp = 0;
  const now = () => (lastStamp = Math.max(Date.now(), lastStamp + 1));

  const tx = <T>(fn: () => T): T => {
    sql.exec("BEGIN");
    try {
      const result = fn();
      sql.exec("COMMIT");
      return result;
    } catch (error) {
      sql.exec("ROLLBACK");
      throw error;
    }
  };

  const snapshotsFor = (runId: string) =>
    (sql.prepare(`SELECT * FROM "SignalSnapshot" WHERE "runId" = ? ORDER BY "skillSlug"`).all(runId) as Raw[]).map(snapshotRow);

  return {
    createRun(data: Omit<SignalRunRow, "id" | "createdAt">): SignalRunRow {
      const row = { id: randomUUID(), createdAt: now(), ...data };
      sql.prepare(`INSERT INTO "SignalRun" ("id","createdAt","live","totalPostings","sources","note") VALUES (?,?,?,?,?,?)`)
        .run(row.id, row.createdAt, row.live ? 1 : 0, row.totalPostings, row.sources, row.note);
      return { ...row, createdAt: new Date(row.createdAt) };
    },
    createSnapshots(rows: NewSnapshot[]): void {
      const insert = sql.prepare(
        `INSERT INTO "SignalSnapshot" ("id","runId","skillSlug","postings","recentPostings","earlierPostings","frequency","trend","momentum","samples","createdAt") VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      );
      tx(() => {
        const stamp = now();
        for (const r of rows) {
          insert.run(randomUUID(), r.runId, r.skillSlug, r.postings, r.recentPostings, r.earlierPostings,
            r.frequency, r.trend, r.momentum, r.samples ?? null, stamp);
        }
      });
    },
    getRun(id: string): (SignalRunRow & { snapshots: SignalSnapshotRow[] }) | null {
      const r = sql.prepare(`SELECT * FROM "SignalRun" WHERE "id" = ?`).get(id) as Raw | undefined;
      return r ? { ...runRow(r), snapshots: snapshotsFor(String(r.id)) } : null;
    },
    latestRun(excludeId?: string): (SignalRunRow & { snapshots: SignalSnapshotRow[] }) | null {
      const r = (excludeId
        ? sql.prepare(`SELECT * FROM "SignalRun" WHERE "id" <> ? ORDER BY "createdAt" DESC LIMIT 1`).get(excludeId)
        : sql.prepare(`SELECT * FROM "SignalRun" ORDER BY "createdAt" DESC LIMIT 1`).get()) as Raw | undefined;
      return r ? { ...runRow(r), snapshots: snapshotsFor(String(r.id)) } : null;
    },
    setRunNote(id: string, note: string): void {
      sql.prepare(`UPDATE "SignalRun" SET "note" = ? WHERE "id" = ?`).run(note, id);
    },
    createChangelog(data: Omit<ChangelogRow, "id" | "createdAt">): void {
      sql.prepare(`INSERT INTO "ChangelogEntry" ("id","createdAt","version","live","summary","details") VALUES (?,?,?,?,?,?)`)
        .run(randomUUID(), now(), data.version, data.live ? 1 : 0, data.summary, data.details);
    },
    recentChangelog(limit: number): ChangelogRow[] {
      return (sql.prepare(`SELECT * FROM "ChangelogEntry" ORDER BY "createdAt" DESC LIMIT ?`).all(limit) as Raw[]).map(changelogRow);
    },
    /** Deletes runs (and their snapshots) and changelog entries older than the cutoff; keeps at most `keepChangelog` entries. */
    prune(cutoff: Date, keepChangelog: number): void {
      tx(() => {
        sql.prepare(`DELETE FROM "SignalRun" WHERE "createdAt" < ?`).run(cutoff.getTime());
        sql.prepare(`DELETE FROM "ChangelogEntry" WHERE "createdAt" < ?`).run(cutoff.getTime());
        sql.prepare(
          `DELETE FROM "ChangelogEntry" WHERE "id" NOT IN (SELECT "id" FROM "ChangelogEntry" ORDER BY "createdAt" DESC LIMIT ?)`,
        ).run(keepChangelog);
      });
    },
    close: () => sql.close(),
  };
}

export type Store = ReturnType<typeof openStore>;

const globalStore = globalThis as typeof globalThis & { skillcastStore?: Store };
let store: Store | undefined;
/** The process-wide store, opened on first use. */
export function getStore(): Store {
  store ??= globalStore.skillcastStore ?? openStore();
  if (process.env.NODE_ENV !== "production") globalStore.skillcastStore = store;
  return store;
}
