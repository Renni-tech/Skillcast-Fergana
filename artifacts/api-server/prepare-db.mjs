import { mkdirSync } from "node:fs";
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
  env: { ...process.env, SKILLCAST_SQLITE_URL: `file:${directory}/skillcast.db` },
});
