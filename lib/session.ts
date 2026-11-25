import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDevUser, isDevLoginEnabled } from "@/lib/dev-auth"; // dev-login
import { prisma } from "@/lib/prisma"; // dev-login

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  /** IANA timezone; null until the browser reports it (see TimezoneSync) */
  timezone: string | null;
  /** True for the development-only dev login user. */
  isDevUser?: boolean;
};

/**
 * Reads the session from the request cookies (once per render).
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
    return { id, name, email, username: username ?? null, timezone: timezone ?? null };
  }

  // dev-login: the dev user has a real database row (created by /dev-login).
  const devUser = await getDevUser();
  if (!devUser) return null;
  const row = await prisma.user
    .findUnique({ where: { id: devUser.id }, select: { name: true, username: true, timezone: true } })
    .catch(() => null);
  return {
    ...devUser,
    name: row?.name ?? devUser.name,
    username: row?.username ?? null,
    timezone: row?.timezone ?? null,
  };
});

/** Same as getCurrentUser, but sends signed-out visitors to /sign-in. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}
