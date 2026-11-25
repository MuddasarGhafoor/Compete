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
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

// Reuse one client during development so hot reloads don't open new connections.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
