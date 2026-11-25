"use server";

import { refresh } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { getViewer } from "@/lib/data/core";
import { safeTimeZone } from "@/lib/dates";
import { endDevLogin } from "@/lib/dev-auth"; // dev-login
import { prisma } from "@/lib/prisma";
import { refreshSessionData } from "@/lib/session";
import { fail, normalizeUsername, ok, usernameError, type ActionResult } from "@/lib/validation";

export async function updateProfile(input: { name: string; username: string }): Promise<ActionResult> {
  const viewer = await getViewer();
  const name = input.name.trim();
  if (name.length < 2 || name.length > 50) return fail("Your name should be 2–50 characters.");

  const username = normalizeUsername(input.username);
  const invalid = usernameError(username);
  if (invalid) return fail(invalid);

  const taken = await prisma.user.findFirst({ where: { username, id: { not: viewer.id } }, select: { id: true } });
  if (taken) return fail("That username is taken. Try another.");

  await prisma.user.update({ where: { id: viewer.id }, data: { name, username } });
  await refreshSessionData(viewer.id);
  refresh();
  return ok("Profile saved");
}

/**
 * Saves the user's timezone. With `onlyIfUnset`, it's the silent automatic version
 * used on first visit (it never overrides a timezone the user picked).
 */
export async function setTimezone(timeZone: string, onlyIfUnset = false): Promise<ActionResult> {
  const viewer = await getViewer();
  if (safeTimeZone(timeZone) !== timeZone) return fail("That timezone isn't recognised.");
  if (onlyIfUnset && viewer.timezone) return ok();

  await prisma.user.update({ where: { id: viewer.id }, data: { timezone: timeZone } });
  await refreshSessionData(viewer.id);
  refresh();
  return ok("Timezone saved");
}

function authError(error: unknown, fallback: string) {
  if (error instanceof APIError && error.message) return error.message;
  console.error(error);
  return fallback;
}

export async function changePassword(input: { currentPassword: string; newPassword: string }): Promise<ActionResult> {
  const viewer = await getViewer();
  if (viewer.isDevUser) return fail("The dev login user has no password."); // dev-login
  if (input.newPassword.length < 8) return fail("Your new password needs at least 8 characters.");

  try {
    await auth.api.changePassword({
      body: { currentPassword: input.currentPassword, newPassword: input.newPassword, revokeOtherSessions: true },
      headers: await headers(),
    });
  } catch (error) {
    return fail(authError(error, "Couldn't change your password. Try again."));
  }
  return ok("Password changed. Other devices were signed out.");
}

export async function deleteAccount(input: { password: string }): Promise<ActionResult> {
  const viewer = await getViewer();

  // dev-login: the dev user has no password; delete the row directly.
  if (viewer.isDevUser) {
    await prisma.user.delete({ where: { id: viewer.id } });
    await endDevLogin();
    redirect("/");
  }

  try {
    await auth.api.deleteUser({ body: { password: input.password }, headers: await headers() });
  } catch (error) {
    return fail(authError(error, "Couldn't delete your account. Check your password and try again."));
  }
  redirect("/");
}
