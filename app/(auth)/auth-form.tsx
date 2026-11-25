"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CircleAlert, Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn, signUp, type AuthFormState } from "@/app/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export function AuthForm({ mode }: AuthFormProps) {
  const text = copy[mode];
  const isSignUp = mode === "sign-up";
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    isSignUp ? signUp : signIn,
    {},
  );

  return (
    <div className="w-full">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">{text.title}</h1>
        <p className="text-sm text-muted-foreground">{text.subtitle}</p>
      </div>

      <form action={formAction} className="mt-6 space-y-4">
        {isSignUp && (
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              required
              minLength={2}
              defaultValue={state.fields?.name}
              className="h-10"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            defaultValue={state.fields?.email}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              placeholder={isSignUp ? "At least 8 characters" : "Your password"}
              required
              minLength={8}
              className="h-10 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </Button>
          </div>
        </div>

        {state.error && (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" size="lg" disabled={pending} className="h-10 w-full">
          {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
          {pending ? text.pending : text.submit}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {text.switchText}{" "}
        <Link href={text.switchHref} className="font-medium text-primary hover:underline">
          {text.switchLink}
        </Link>
      </p>
    </div>
  );
}
