"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp, type AuthFormState } from "@/app/actions/auth";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
};

const copy = {
  "sign-in": {
    title: "Welcome back",
    subtitle: "Sign in to check off today's habits.",
    submit: "Sign in",
    pending: "Signing in…",
    switchText: "New to Compete?",
    switchLink: "Create an account",
    switchHref: "/sign-up",
  },
  "sign-up": {
    title: "Create your account",
    subtitle: "Start tracking your routine and compete with friends.",
    submit: "Create account",
    pending: "Creating account…",
    switchText: "Already have an account?",
    switchLink: "Sign in",
    switchHref: "/sign-in",
  },
} as const;

const inputClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-zinc-700 dark:bg-zinc-900";

export function AuthForm({ mode }: AuthFormProps) {
  const text = copy[mode];
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    mode === "sign-in" ? signIn : signUp,
    {},
  );

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold tracking-tight">{text.title}</h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">{text.subtitle}</p>

      <form action={formAction} className="mt-8 space-y-4">
        {mode === "sign-up" && (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Name</span>
            <input
              name="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              defaultValue={state.fields?.name}
              className={inputClass}
            />
          </label>
        )}

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.fields?.email}
            className={inputClass}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Password</span>
          <input
            name="password"
            type="password"
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            required
            minLength={8}
            className={inputClass}
          />
          {mode === "sign-up" && (
            <span className="block text-xs text-zinc-500">At least 8 characters.</span>
          )}
        </label>

        {state.error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300"
          >
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? text.pending : text.submit}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        {text.switchText}{" "}
        <Link
          href={text.switchHref}
          className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
        >
          {text.switchLink}
        </Link>
      </p>
    </div>
  );
}
