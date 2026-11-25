"use server";

import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { refresh } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { endDevLogin, setDevLocked } from "@/lib/dev-auth"; // dev-login
import { prisma } from "@/lib/prisma";
import { requireUser, type CurrentUser } from "@/lib/session";
import { fail, ok, type ActionResult } from "@/lib/validation";

/*
 * PIN lock: "Lock" closes the app (session marked locked) and goes to the home page.
 * Entering the 4-digit PIN opens it again. 5 wrong PINs in a row sign the session out.
 * Locked state lives on the session row (or a dev cookie for dev login users).
 */

const scrypt = promisify(scryptCallback) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;
const PIN_PATTERN = /^\d{4}$/;
const MAX_ATTEMPTS = 5;

async function hashPin(pin: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(pin, salt, 32);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

async function verifyPin(pin: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const derived = await scrypt(pin, Buffer.from(saltHex, "hex"), expected.length);
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

async function setLocked(user: CurrentUser, locked: boolean) {
  if (user.isDevUser) {
    await setDevLocked(locked); // dev-login
    return;
  }
  // One database write; also rewrites the signed session cookie (see lib/auth.ts).
  const requestHeaders = await headers();
  await (locked ? auth.api.lockSession({ headers: requestHeaders }) : auth.api.unlockSession({ headers: requestHeaders }));
}

async function signOutCompletely() {
  await auth.api.signOut({ headers: await headers() }).catch(() => null);
  await endDevLogin(); // dev-login
}

export type LockResult = ActionResult & { needsPin?: boolean };

/** Locks the app and goes home. Returns needsPin when the user hasn't set a PIN yet. */
export async function lockApp(): Promise<LockResult> {
  const user = await requireUser();
  const row = await prisma.user.findUnique({ where: { id: user.id }, select: { pinHash: true } });
  if (!row?.pinHash) return { ok: false, error: "Set a PIN first.", needsPin: true };
  await setLocked(user, true);
  redirect("/");
}

function pinError(pin: string, confirm: string) {
  if (!PIN_PATTERN.test(pin)) return "Your PIN must be 4 digits.";
  if (pin !== confirm) return "The PINs don't match.";
  return null;
}

/** Saves a new PIN (and optionally locks right away). */
export async function setPin(pin: string, confirm: string, lockNow = false): Promise<ActionResult> {
  const user = await requireUser();
  if (user.locked) return fail("Unlock the app first.");
  const invalid = pinError(pin, confirm);
  if (invalid) return fail(invalid);

  await prisma.user.update({ where: { id: user.id }, data: { pinHash: await hashPin(pin), pinFailedAttempts: 0 } });
  if (lockNow) {
    await setLocked(user, true);
    redirect("/");
  }
  refresh();
  return ok("PIN saved");
}

export async function removePin(): Promise<ActionResult> {
  const user = await requireUser();
  if (user.locked) return fail("Unlock the app first.");
  await prisma.user.update({ where: { id: user.id }, data: { pinHash: null, pinFailedAttempts: 0 } });
  refresh();
  return ok("PIN removed");
}

/** Checks the PIN and opens the app (goes to /today). */
export async function unlockApp(pin: string): Promise<ActionResult> {
  const user = await requireUser();
  const row = await prisma.user.findUnique({
    where: { id: user.id },
    select: { pinHash: true, pinFailedAttempts: true },
  });

  if (!row?.pinHash) {
    // No PIN set (e.g. it was removed on another device): just open.
    await setLocked(user, false);
    redirect("/today");
  }
  if (!PIN_PATTERN.test(pin)) return fail("Enter your 4-digit PIN.");

  if (await verifyPin(pin, row.pinHash)) {
    if (row.pinFailedAttempts > 0) {
      await prisma.user.update({ where: { id: user.id }, data: { pinFailedAttempts: 0 } });
    }
    await setLocked(user, false);
    redirect("/today");
  }

  const attempts = row.pinFailedAttempts + 1;
  if (attempts >= MAX_ATTEMPTS) {
    await prisma.user.update({ where: { id: user.id }, data: { pinFailedAttempts: 0 } });
    await signOutCompletely();
    redirect("/sign-in?reason=pin");
  }
  await prisma.user.update({ where: { id: user.id }, data: { pinFailedAttempts: attempts } });
  const left = MAX_ATTEMPTS - attempts;
  return fail(`Wrong PIN. ${left} ${left === 1 ? "try" : "tries"} left before you're signed out.`);
}
