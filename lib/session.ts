import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DEV_USER, isDevAuthBypassEnabled } from "@/lib/dev-auth";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  /** True for the fake user from the development login bypass. */
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
    // With the dev bypass on, keep pages working even if the database isn't connected yet.
    if (!isDevAuthBypassEnabled) throw error;
    console.warn("[dev auth bypass] Could not read session, using Dev User.", error);
  }

  if (session) {
    const { id, name, email } = session.user;
    return { id, name, email };
  }

  // A real login always wins; the bypass only fills in for signed-out visitors.
  return isDevAuthBypassEnabled ? { ...DEV_USER } : null;
});

/** Same as getCurrentUser, but sends signed-out visitors to /sign-in. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}
