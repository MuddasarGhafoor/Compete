import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { TodayPreview } from "@/components/marketing-previews";
import { ThemeToggle } from "@/components/theme-toggle";

/*
 * No site navbar here: just the logo and a "Back to home" link.
 *
 * Two completely separate, full-width columns with different colors:
 * left = deep forest brand panel, right = page background.
 * Inside each column the content box is half of the site Container (max-w-7xl = 2 × 40rem)
 * and pushed toward the middle, so text lines up with every other page.
 *
 * On large screens the page is exactly one screen tall (h-dvh) with no page scroll.
 * On very short screens a column scrolls on its own instead of the page.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh flex-1 lg:h-dvh lg:grid-cols-2">
      {/* Left column: brand panel (desktop only) */}
      <aside className="hidden bg-panel text-panel-foreground lg:flex lg:overflow-y-auto">
        <div className="ml-auto flex w-full max-w-160 flex-col pr-16 pl-8 xl:pr-24">
          <div className="flex h-16 shrink-0 items-center">
            <Logo tone="light" />
          </div>

          <div className="flex flex-1 flex-col justify-center py-6">
            <div className="max-w-md">
              <h2 className="font-display text-3xl leading-tight font-medium tracking-tight text-balance xl:text-4xl">
                A little friendly competition goes a long way.
              </h2>
              <p className="mt-3 text-panel-foreground/75">
                Track your habits, keep your streak, and see how you stack up against friends
                each week.
              </p>
            </div>
            {/* Hidden on short screens so everything fits without scrolling. */}
            <TodayPreview
              compact
              className="mt-8 max-w-sm text-card-foreground [@media(max-height:700px)]:hidden"
            />
          </div>

          <p className="flex h-16 shrink-0 items-center text-sm text-panel-foreground/60">
            Build better habits, together.
          </p>
        </div>
      </aside>

      {/* Right column: the form */}
      <main className="flex bg-background lg:overflow-y-auto">
        <div className="mx-auto flex w-full max-w-160 flex-col px-4 sm:px-6 lg:mr-auto lg:ml-0 lg:pr-8 lg:pl-16 xl:pl-24">
          <div className="flex h-16 shrink-0 items-center justify-between">
            <Link
              href="/"
              className="-ml-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to home
            </Link>
            <ThemeToggle />
          </div>

          <div className="flex flex-1 items-center justify-center py-6 lg:justify-start">
            <div className="w-full max-w-sm">
              {/* On small screens the brand panel is hidden, so show the logo above the form. */}
              <Logo className="mb-8 lg:hidden" />
              {children}
            </div>
          </div>

          {/* Balances the top row so the form sits in the visual middle. */}
          <div aria-hidden className="hidden h-16 shrink-0 lg:block" />
        </div>
      </main>
    </div>
  );
}
