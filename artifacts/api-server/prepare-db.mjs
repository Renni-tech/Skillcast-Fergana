// Prepares the local SQLite cache folder (artifacts/api-server/db/).
// The API creates its tables itself on first use (CREATE TABLE IF NOT EXISTS),
// using Node's built-in node:sqlite: nothing is generated or downloaded, and
// an existing skillcast.db is kept as it is.
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 22 || (major === 22 && minor < 13)) {
  console.error(
    `SkillCast's API needs Node.js 22.13 or newer for its built-in SQLite (found ${process.versions.node}). Install Node 24 LTS.`,
  );
  process.exit(1);
}

mkdirSync(fileURLToPath(new URL("./db/", import.meta.url)), { recursive: true });
