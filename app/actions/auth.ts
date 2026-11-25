"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { safeTimeZone } from "@/lib/dates";
import { endDevLogin } from "@/lib/dev-auth"; // dev-login
import { prisma } from "@/lib/prisma";
import { normalizeUsername, usernameError } from "@/lib/validation";

export type AuthFormState = {
  error?: string;
  // Echoed back so the form keeps what the user typed after an error.
  fields?: { name?: string; email?: string; username?: string };
};

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function toErrorMessage(error: unknown) {
  if (error instanceof APIError && error.message) return error.message;
  console.error(error);
  return "Something went wrong. Please try again.";
}

export async function signUp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = readText(formData, "name");
  const username = normalizeUsername(readText(formData, "username"));
  const email = readText(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  // Sent by the browser (hidden field); used for "today" in the user's timezone.
  const detectedZone = readText(formData, "timezone");
  const timezone = safeTimeZone(detectedZone) === detectedZone ? detectedZone : undefined;
  const fields = { name, email, username };

  if (name.length < 2) {
    return { error: "Please enter your name (at least 2 characters).", fields };
  }
  const invalidUsername = usernameError(username);
  if (invalidUsername) {
    return { error: invalidUsername, fields };
  }
  if (!email.includes("@")) {
    return { error: "Please enter a valid email address.", fields };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters.", fields };
  }
  if (await prisma.user.findUnique({ where: { username }, select: { id: true } })) {
    return { error: "That username is taken. Try another.", fields };
  }

  try {
    await auth.api.signUpEmail({
      body: { name, email, password, username, timezone },
      headers: await headers(),
    });
  } catch (error) {
    return { error: toErrorMessage(error), fields };
  }

  // redirect() throws, so it stays outside the try/catch.
  redirect("/today");
}

export async function signIn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readText(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fields = { email };

  if (!email || !password) {
    return { error: "Please enter your email and password.", fields };
  }

  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
  } catch (error) {
    return { error: toErrorMessage(error), fields };
  }

  redirect("/today");
}

export async function signOut() {
  const requestHeaders = await headers();
  try {
    await auth.api.signOut({ headers: requestHeaders });
  } catch (error) {
    // Nothing to sign out of (no real session); just leave.
    console.warn("Sign out skipped:", error);
  }
  await endDevLogin(); // dev-login
  redirect("/sign-in");
}
