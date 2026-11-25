import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDevUserId, isDevLocked, isDevLoginEnabled } from "@/lib/dev-auth"; // dev-login
import { prisma } from "@/lib/prisma"; // dev-login

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  /** IANA timezone; null until the browser reports it (see TimezoneSync) */
  timezone: string | null;
  /** Locked with the PIN lock: the app stays closed until the PIN is entered. */
  locked: boolean;
  /** True when signed in through the development-only dev login. */
  isDevUser?: boolean;
};

// dev-login: dev users have no session cookie cache, so cache their rows briefly in memory
// (the dev server is long-lived) to avoid a database round trip on every page.
type DevRow = { id: string; name: string; email: string; username: string | null; timezone: string | null };
const devUserCache = new Map<string, { row: DevRow; at: number }>();

async function getDevUserRow(id: string): Promise<DevRow | null> {
  const cached = devUserCache.get(id);
  if (cached && Date.now() - cached.at < 60_000) return cached.row;
  const row = await prisma.user
    .findUnique({ where: { id }, select: { id: true, name: true, email: true, username: true, timezone: true } })
    .catch(() => null);
  if (row) devUserCache.set(id, { row, at: Date.now() });
  else devUserCache.delete(id);
  return row;
}

/** Call after changing a user's name, username or timezone. */
export async function refreshSessionData(userId: string) {
  devUserCache.delete(userId); // dev-login
  // Re-reads the session from the database, which also rewrites the signed session cookie.
  await auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } }).catch(() => null);
}

/**
 * Reads the session (from the signed cookie cache when possible, so no database round trip).
 * With Cache Components, call this only inside a <Suspense> boundary.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // Keep headers() outside the try/catch: Next.js uses thrown signals here while prerendering.
  const requestHeaders = await headers();

  let session: Awaited<ReturnType<typeof auth.api.getSession>> = null;
  try {
    session = await auth.api.getSession({ headers: requestHeaders });
  } catch (error) {
    // dev-login: keep pages working if the database is unreachable during development.
    if (!isDevLoginEnabled) throw error;
    console.warn("[dev login] Could not read the session.", error);
  }

  if (session) {
    const { id, name, email, username, timezone } = session.user;
    return {
      id,
      name,
      email,
      username: username ?? null,
      timezone: timezone ?? null,
      locked: Boolean(session.session.locked),
    };
  }

  // dev-login: signed in as a dev user? (No row = deleted: treat as signed out.)
  const devUserId = await getDevUserId();
  if (!devUserId) return null;
  const row = await getDevUserRow(devUserId);
  if (!row) return null;
  return { ...row, locked: await isDevLocked(), isDevUser: true };
});

/** Same as getCurrentUser, but sends signed-out visitors to /sign-in. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}

// dev-login: the Dev User and seeded test users, for the "Switch test user" menu.
// Call it only after reading the session (it uses Date.now(), which Cache Components only allows
// once the request has read cookies/headers).
let devAccountsCache: { rows: { id: string; name: string; username: string | null }[]; at: number } | null = null;

export async function getDevAccounts() {
  if (!isDevLoginEnabled) return [];
  if (devAccountsCache && Date.now() - devAccountsCache.at < 60_000) return devAccountsCache.rows;
  const rows = await prisma.user
    .findMany({
      where: { OR: [{ id: "dev-user" }, { email: { endsWith: "@compete.test" } }] },
      select: { id: true, name: true, username: true },
      orderBy: { name: "asc" },
    })
    .catch(() => []);
  devAccountsCache = { rows, at: Date.now() };
  return rows;
}
