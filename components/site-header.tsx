import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import { buttonVariants } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/session";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
];

/** Top bar for public pages: section links plus Sign in / Get started (or the account menu). */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(buttonVariants({ variant: "ghost" }), "text-muted-foreground")}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Reads the session, so it streams in behind a Suspense boundary. */}
          <Suspense fallback={<GuestActions />}>
            <AccountActions />
          </Suspense>
          <MobileNav links={navLinks} />
        </div>
      </div>
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
      <Link href="/sign-in" className={buttonVariants({ variant: "ghost", size: "lg" })}>
        Sign in
      </Link>
      <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
        Get started
      </Link>
    </>
  );
}
