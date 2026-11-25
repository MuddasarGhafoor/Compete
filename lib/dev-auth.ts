import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

/**
 * DEV LOGIN (development only)
 *
 * A wrench icon in the navbar opens /dev-login, which signs you in as the "Dev User" (or, with
 * ?as=<id>, as one of the fake test users from `pnpm db:seed`) and goes to the Today page.
 * Switch users from the account menu. Works only when `DEV_LOGIN="true"` is in .env AND the app
 * runs with `pnpm run dev`. Production builds always ignore it.
 *
 * Dev users are real database rows (the Dev User is created on first use), so everything can be
 * saved. Only "dev-user" and seeded test users (emails ending in @compete.test) can be used here.
 *
 * To remove dev login completely:
 *   1. Delete this file, `app/dev-login/route.ts` and `components/dev-login-button.tsx`.
 *   2. Remove the lines marked `dev-login` in: lib/session.ts, proxy.ts, app/actions/*.ts,
 *      components/site-header.tsx and components/user-menu.tsx.
 *   3. Remove DEV_LOGIN from .env and .env.example.
 */
export const isDevLoginEnabled =
  process.env.NODE_ENV === "development" && process.env.DEV_LOGIN === "true";

const DEV_LOGIN_COOKIE = "compete_dev_login";
const DEV_LOCK_COOKIE = "compete_dev_locked";

export const DEV_USER = {
  id: "dev-user",
  name: "Dev User",
  email: "dev@compete.local",
} as const;

/** Test accounts that dev login may sign in as. */
export function isDevAccount(user: { id: string; email: string }) {
  return user.id === DEV_USER.id || user.email.endsWith("@compete.test");
}

/** The id of the dev user the visitor signed in as, if any. */
export async function getDevUserId(): Promise<string | null> {
  if (!isDevLoginEnabled) return null;
  const cookieStore = await cookies();
  return cookieStore.get(DEV_LOGIN_COOKIE)?.value || null;
}

/** For proxy.ts: quick cookie check without touching the database. */
export function hasDevLoginCookie(request: NextRequest) {
  return isDevLoginEnabled && request.cookies.has(DEV_LOGIN_COOKIE);
}

/** Signs the visitor in as a dev user (and clears any dev lock). */
export function setDevLoginCookie(response: NextResponse, userId: string) {
  response.cookies.set(DEV_LOGIN_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  response.cookies.delete(DEV_LOCK_COOKIE);
}

export async function isDevLocked(): Promise<boolean> {
  if (!isDevLoginEnabled) return false;
  const cookieStore = await cookies();
  return cookieStore.has(DEV_LOCK_COOKIE);
}

/** Dev users have no Better Auth session, so their lock lives in a cookie. */
export async function setDevLocked(locked: boolean) {
  if (!isDevLoginEnabled) return;
  const cookieStore = await cookies();
  if (locked) cookieStore.set(DEV_LOCK_COOKIE, "1", { httpOnly: true, sameSite: "lax", path: "/" });
  else cookieStore.delete(DEV_LOCK_COOKIE);
}

/** Called on sign out. */
export async function endDevLogin() {
  if (!isDevLoginEnabled) return;
  const cookieStore = await cookies();
  cookieStore.delete(DEV_LOGIN_COOKIE);
  cookieStore.delete(DEV_LOCK_COOKIE);
}
