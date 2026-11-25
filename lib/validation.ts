/** Shared input rules (used by forms and Server Actions). */

export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export function normalizeUsername(value: string): string {
  return value.trim().replace(/^@/, "").toLowerCase();
}

/** Returns an error message, or null if the username is valid. */
export function usernameError(username: string): string | null {
  if (!USERNAME_PATTERN.test(username)) {
    return "Usernames are 3–20 characters: lowercase letters, numbers and underscores.";
  }
  return null;
}

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

export const fail = (error: string): ActionResult => ({ ok: false, error });
export const ok = (message?: string): ActionResult => ({ ok: true, message });
