import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/container";
import { DevLoginButton } from "@/components/dev-login-button"; // dev-login
import { FaqLink } from "@/components/faq-link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/session";
import { cn } from "@/lib/utils";

/**
 * Top bar for public pages.
 * Right side: theme toggle, FAQ icon, then "Get started" (opens sign-in) or the account menu.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo compactOnMobile />
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <FaqLink />
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
      <Link
        href="/today"
        className={cn(buttonVariants({ size: "lg" }), "ml-1.5 hidden sm:inline-flex")}
      >
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
      <Link href="/sign-in" className={cn(buttonVariants({ size: "lg" }), "ml-1.5")}>
        Get started
      </Link>
    </>
  );
}
