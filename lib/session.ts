import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDevUser, isDevLoginEnabled } from "@/lib/dev-auth"; // dev-login

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  /** True for the fake user from the development-only dev login. */
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
    // dev-login: keep pages working while the database isn't connected yet.
    if (!isDevLoginEnabled) throw error;
    console.warn("[dev login] Could not read the session.", error);
  }

  if (session) {
    const { id, name, email } = session.user;
    return { id, name, email };
  }

  return getDevUser(); // dev-login: returns null when dev login is off or unused
});

/** Same as getCurrentUser, but sends signed-out visitors to /sign-in. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}
