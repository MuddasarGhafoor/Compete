import type { Metadata } from "next";
import { Suspense } from "react";
import { ShieldAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage(props: PageProps<"/sign-in">) {
  return (
    <>
      <Suspense fallback={null}>
        <SignInNotice searchParams={props.searchParams} />
      </Suspense>
      <AuthForm mode="sign-in" />
    </>
  );
}

/** Explains why the visitor was signed out (e.g. too many wrong PIN attempts). */
async function SignInNotice({ searchParams }: { searchParams: PageProps<"/sign-in">["searchParams"] }) {
  const { reason } = await searchParams;
  if (reason !== "pin") return null;
  return (
    <Alert className="mb-6">
      <ShieldAlert />
      <AlertDescription>
        Too many wrong PIN attempts, so you were signed out. Sign in again with your email and password.
      </AlertDescription>
    </Alert>
  );
}
