import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const databaseDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../db",
);
mkdirSync(databaseDirectory, { recursive: true });

const globalPrisma = globalThis as typeof globalThis & {
  skillcastPrisma?: PrismaClient;
};

export const db =
  globalPrisma.skillcastPrisma ??
  new PrismaClient({
    log: ["error", "warn"],
    datasources: {
      db: { url: `file:${path.join(databaseDirectory, "skillcast.db")}` },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalPrisma.skillcastPrisma = db;
}
