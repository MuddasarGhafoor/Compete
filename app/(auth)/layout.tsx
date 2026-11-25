import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { TodayPreview } from "@/components/marketing-previews";

/*
 * No site navbar here: just the logo and a "Back to home" link.
 *
 * Two completely separate, full-width columns with different colors:
 * left = deep forest brand panel, right = page background.
 * Inside each column the content box is half of the site Container (max-w-7xl = 2 × 40rem)
 * and pushed toward the middle, so text lines up with every other page.
 * Each column has a 64px top row, matching the header height elsewhere.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-2">
      {/* Left column: brand panel (desktop only) */}
      <aside className="hidden bg-panel text-panel-foreground lg:flex">
        <div className="ml-auto flex w-full max-w-160 flex-col pr-16 pl-8 xl:pr-24">
          <div className="flex h-16 shrink-0 items-center">
            <Logo tone="light" />
          </div>

          <div className="flex flex-1 flex-col justify-center py-12">
            <div className="max-w-md">
              <h2 className="font-display text-4xl leading-tight font-medium tracking-tight text-balance">
                A little friendly competition goes a long way.
              </h2>
              <p className="mt-4 text-panel-foreground/75">
                Track your habits, keep your streak, and see how you stack up against friends
                each week.
              </p>
            </div>
            <TodayPreview compact className="mt-10 max-w-sm text-card-foreground" />
          </div>

          <p className="flex h-16 shrink-0 items-center text-sm text-panel-foreground/60">
            Build better habits, together.
          </p>
        </div>
      </aside>

      {/* Right column: the form */}
      <main className="flex bg-background">
        <div className="mx-auto flex w-full max-w-160 flex-col px-4 sm:px-6 lg:mr-auto lg:ml-0 lg:pr-8 lg:pl-16 xl:pl-24">
          <div className="flex h-16 shrink-0 items-center justify-between lg:justify-end">
            {/* On small screens the brand panel is hidden, so show the logo here. */}
            <Logo className="lg:hidden" />
            <Link
              href="/"
              className="-mr-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to home
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center py-10 lg:justify-start">
            <div className="w-full max-w-sm">{children}</div>
          </div>

          {/* Balances the top row so the form sits in the visual middle. */}
          <div aria-hidden className="hidden h-16 shrink-0 lg:block" />
        </div>
      </main>
    </div>
  );
}
