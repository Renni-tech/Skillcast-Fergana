import { mkdirSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const directory = fileURLToPath(new URL("./db/", import.meta.url));
mkdirSync(directory, { recursive: true });
// Retain the imported SQLite store; do not repurpose the workspace's Postgres.
execFileSync(process.execPath, [
  require.resolve("prisma/build/index.js"),
  "db", "push", "--skip-generate",
  "--schema", fileURLToPath(new URL("./prisma/schema.prisma", import.meta.url)),
], {
  stdio: "inherit",
  // path.join keeps one separator style on Windows (no mixed "\\/").
  env: { ...process.env, SKILLCAST_SQLITE_URL: `file:${path.join(directory, "skillcast.db")}` },
});
