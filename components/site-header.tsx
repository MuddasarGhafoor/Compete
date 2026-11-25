import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/container";
import { DevLoginButton } from "@/components/dev-login-button"; // dev-login
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/session";
import { cn } from "@/lib/utils";

/** Top bar for public pages: Sign in / Get started, or the account menu when signed in. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <div className="flex items-center gap-2">
          {/* Reads the session, so it streams in behind a Suspense boundary. */}
          <Suspense fallback={<GuestActions />}>
            <AccountActions />
          </Suspense>
        </div>
      </Container>
    </header>
  );
}

async function AccountActions() {
  const user = await getCurrentUser();
  if (!user) return <GuestActions />;

  return (
    <>
      <Link href="/today" className={cn(buttonVariants({ size: "lg" }), "hidden sm:inline-flex")}>
        Open app
      </Link>
      <UserMenu user={user} />
    </>
  );
}

function GuestActions() {
  return (
    <>
      {/* dev-login */}
      <DevLoginButton />
      <Link href="/sign-in" className={buttonVariants({ variant: "ghost", size: "lg" })}>
        Sign in
      </Link>
      <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
        Get started
      </Link>
    </>
  );
}
