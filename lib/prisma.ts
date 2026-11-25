import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

function createPrismaClient() {
  // The app uses Neon's pooled connection (DATABASE_URL, written by `neon deploy`).
  // Neon's links say sslmode=require, which `pg` already treats as verify-full but warns about;
  // asking for verify-full explicitly keeps the same strict TLS check without the warning.
  const connectionString = process.env.DATABASE_URL?.replace(
    "sslmode=require",
    "sslmode=verify-full",
  );
  const adapter = new PrismaPg({
    connectionString,
    // Opening a connection costs several round trips (TLS + auth), which adds up even with the
    // database in Singapore. Keep idle connections for 10 minutes instead of pg's 10 seconds.
    idleTimeoutMillis: 10 * 60 * 1000,
    keepAlive: true,
    max: 10,
  });
  return new PrismaClient({ adapter });
}

// Reuse one client during development so hot reloads don't open new connections.
// A stale cached client is replaced automatically (no dev server restart needed) after
// `prisma generate` (the PrismaClient class changes) or when DATABASE_URL in .env changes.
const globalForPrisma = globalThis as unknown as {
  prismaCache?: { client: ReturnType<typeof createPrismaClient>; ctor: typeof PrismaClient; url?: string };
};

const cached = globalForPrisma.prismaCache;
export const prisma =
  cached && cached.ctor === PrismaClient && cached.url === process.env.DATABASE_URL
    ? cached.client
    : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  if (cached && cached.client !== prisma) void cached.client.$disconnect().catch(() => {});
  globalForPrisma.prismaCache = { client: prisma, ctor: PrismaClient, url: process.env.DATABASE_URL };
}
