import Link from "next/link";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="text-sm text-muted-foreground">Build better habits, together.</p>
        </div>
        <nav aria-label="Footer" className="flex gap-6 text-sm">
          <Link href="/sign-in" className="text-muted-foreground transition-colors hover:text-foreground">
            Sign in
          </Link>
          <Link href="/sign-up" className="text-muted-foreground transition-colors hover:text-foreground">
            Create account
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
