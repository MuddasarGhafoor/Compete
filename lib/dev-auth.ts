import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

/**
 * DEV LOGIN (development only)
 *
 * Visit /dev-login and click "Continue as Dev User" to use the app without a real account.
 * Works only when `DEV_LOGIN="true"` is in .env AND the app runs with `pnpm run dev`.
 * Production builds (`next build` / `next start`) always ignore it.
 *
 * The dev user is not saved in the database, so it is for viewing pages, not saving data.
 *
 * To remove dev login completely:
 *   1. Delete this file and the `app/(auth)/dev-login/` folder.
 *   2. Remove the lines marked `dev-login` in: lib/session.ts, proxy.ts,
 *      app/actions/auth.ts, app/(auth)/sign-in/page.tsx, app/(auth)/sign-up/page.tsx.
 *   3. Remove DEV_LOGIN from .env and .env.example.
 */
export const isDevLoginEnabled =
  process.env.NODE_ENV === "development" && process.env.DEV_LOGIN === "true";

const DEV_LOGIN_COOKIE = "compete_dev_login";

export const DEV_USER = {
  id: "dev-user",
  name: "Dev User",
  email: "dev@compete.local",
  isDevUser: true,
} as const;

/** The dev user, if dev login is enabled and the visitor has used it. */
export async function getDevUser() {
  if (!isDevLoginEnabled) return null;
  const cookieStore = await cookies();
  return cookieStore.has(DEV_LOGIN_COOKIE) ? { ...DEV_USER } : null;
}

/** For proxy.ts: quick cookie check without touching the database. */
export function hasDevLoginCookie(request: NextRequest) {
  return isDevLoginEnabled && request.cookies.has(DEV_LOGIN_COOKIE);
}

export async function startDevLogin() {
  if (!isDevLoginEnabled) throw new Error("Dev login is disabled.");
  const cookieStore = await cookies();
  cookieStore.set(DEV_LOGIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function endDevLogin() {
  if (!isDevLoginEnabled) return;
  const cookieStore = await cookies();
  cookieStore.delete(DEV_LOGIN_COOKIE);
}
