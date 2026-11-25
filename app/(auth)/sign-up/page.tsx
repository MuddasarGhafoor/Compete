import type { Metadata } from "next";
import { AuthForm } from "../auth-form";
import { DevLoginLink } from "../dev-login/dev-login-link"; // dev-login

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignUpPage() {
  return (
    <>
      <AuthForm mode="sign-up" />
      {/* dev-login */}
      <DevLoginLink />
    </>
  );
}
