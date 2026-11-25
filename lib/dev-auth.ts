import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

/**
 * DEV LOGIN (development only)
 *
 * A wrench icon in the navbar opens /dev-login, which signs you in as a fake "Dev User"
 * and goes straight to the Today page. Works only when `DEV_LOGIN="true"` is in .env AND
 * the app runs with `pnpm run dev`. Production builds always ignore it.
 *
 * /dev-login also creates the Dev User row in the database (id "dev-user"), so habits,
 * check-ins and the rest can be saved while developing.
 *
 * To remove dev login completely:
 *   1. Delete this file, `app/dev-login/route.ts` and `components/dev-login-button.tsx`.
 *   2. Remove the lines marked `dev-login` in: lib/session.ts, proxy.ts,
 *      app/actions/auth.ts and components/site-header.tsx.
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

/** Marks the visitor as signed in as the Dev User. */
export function setDevLoginCookie(response: NextResponse) {
  response.cookies.set(DEV_LOGIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/** Called on sign out. */
export async function endDevLogin() {
  if (!isDevLoginEnabled) return;
  const cookieStore = await cookies();
  cookieStore.delete(DEV_LOGIN_COOKIE);
}
