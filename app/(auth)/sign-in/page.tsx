import type { Metadata } from "next";
import { AuthForm } from "../auth-form";
import { DevLoginLink } from "../dev-login/dev-login-link"; // dev-login

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <>
      <AuthForm mode="sign-in" />
      {/* dev-login */}
      <DevLoginLink />
    </>
  );
}
