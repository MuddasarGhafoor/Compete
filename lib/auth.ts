import "server-only";
import { betterAuth, type BetterAuthPlugin } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

/**
 * PIN lock support: `auth.api.lockSession({ headers })` / `auth.api.unlockSession({ headers })`
 * mark the current session locked or unlocked and rewrite the signed session cookie in the same
 * step (one database write, no re-read). Server-only: they have no URL, so a browser can't call
 * them to skip the lock.
 */
function setLockedEndpoint(locked: boolean) {
  return createAuthEndpoint.serverOnly({ method: "POST", use: [sessionMiddleware] }, async (ctx) => {
    const { session, user } = ctx.context.session;
    const updated = await ctx.context.internalAdapter.updateSession(session.token, { locked, updatedAt: new Date() });
    await setSessionCookie(ctx, { session: updated ?? { ...session, locked }, user });
    return ctx.json({ locked });
  });
}

const sessionLock = () =>
  ({
    id: "session-lock",
    endpoints: { lockSession: setLockedEndpoint(true), unlockSession: setLockedEndpoint(false) },
  }) satisfies BetterAuthPlugin;

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
  session: {
    additionalFields: {
      // PIN lock (see app/actions/lock.ts). Set by the server only (sessionLock plugin).
      locked: { type: "boolean", required: false, defaultValue: false, input: false },
    },
    // Keep a signed copy of the session in a cookie so most requests skip the database.
    // Actions that change user data call refreshSessionData() (lib/session.ts) to update it at once.
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  // nextCookies lets Server Actions set and clear the session cookie. Must be the last plugin.
  plugins: [sessionLock(), nextCookies()],
});
