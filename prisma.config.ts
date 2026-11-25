import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // `pnpm db:seed`: test users and data for development (see prisma/seed.ts)
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Prisma CLI (migrations) uses Neon's direct, non-pooled connection.
    // `neon deploy` / `neon env pull` writes it to .env as DATABASE_URL_UNPOOLED.
    url: process.env.DATABASE_URL_UNPOOLED,
  },
});
