import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/**
 * Resolve where the SQLite database file lives.
 *
 * 1. If DATABASE_URL is set to a `file:...` path, use it.
 * 2. Otherwise, on Railway use the persistent volume mount path so the
 *    database survives redeploys (the volume is mounted at container start).
 * 3. Fall back to the local ./dev.db for development.
 */
function resolveDatabaseUrl(): string {
  const fromEnv = process.env.DATABASE_URL;
  if (fromEnv) return fromEnv;

  const volumeMount = process.env.RAILWAY_VOLUME_MOUNT_PATH;
  if (volumeMount) {
    return `file:${String(volumeMount).replace(/\/+$/, "")}/planhumans.db`;
  }

  return "file:./dev.db";
}

/**
 * better-sqlite3 does not create parent directories for the database file,
 * so make sure the directory exists before opening a connection.
 */
function ensureSqliteDir(url: string) {
  const filePath = url.startsWith("file:") ? url.slice("file:".length) : url;
  if (filePath === "/" || filePath === "") return;
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  } catch {
    // If the directory cannot be created (e.g. read-only filesystem), let the
    // adapter surface the real error on first DB access.
  }
}

const databaseUrl = resolveDatabaseUrl();
ensureSqliteDir(databaseUrl);

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
