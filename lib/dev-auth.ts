/**
 * Development-only login bypass.
 *
 * When `DEV_AUTH_BYPASS="true"` is set in .env AND the app runs with `pnpm run dev`,
 * signed-out visitors are treated as a fake "Dev User" so every page can be checked
 * without logging in. It is always off in production builds (`next build` / `next start`).
 *
 * Note: the dev user does not exist in the database, so features that save data
 * need a real account (or must create the dev user first).
 */
export const isDevAuthBypassEnabled =
  process.env.NODE_ENV === "development" && process.env.DEV_AUTH_BYPASS === "true";

export const DEV_USER = {
  id: "dev-user",
  name: "Dev User",
  email: "dev@compete.local",
  isDevUser: true,
} as const;
