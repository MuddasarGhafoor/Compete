import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

// Reads BETTER_AUTH_SECRET and BETTER_AUTH_URL from the environment.
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    // Extra columns on the user table (see prisma/schema.prisma).
    additionalFields: {
      username: { type: "string", required: false, input: true },
      timezone: { type: "string", required: false, input: true },
    },
    deleteUser: { enabled: true },
  },
  // Lets Server Actions set and clear the session cookie. Must be the last plugin.
  plugins: [nextCookies()],
});
