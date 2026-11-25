import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma CLI (migrations) uses Neon's direct, non-pooled connection.
    // `neon deploy` / `neon env pull` writes it to .env as DATABASE_URL_UNPOOLED.
    url: process.env.DATABASE_URL_UNPOOLED,
  },
});
