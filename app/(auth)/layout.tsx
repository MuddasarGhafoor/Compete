import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { TodayPreview } from "@/components/marketing-previews";

// Both columns use the same 64px top bar and lg:px-8 side padding as the site header.

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-2">
      {/* Left: brand panel (desktop only) */}
      <aside className="hidden border-r bg-secondary lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <div className="flex h-16 shrink-0 items-center px-8">
          <Logo />
        </div>

        <div className="flex flex-1 flex-col justify-center gap-10 px-8 xl:px-16">
          <div className="max-w-md">
            <h2 className="font-display text-4xl leading-tight font-medium tracking-tight text-balance">
              A little friendly competition goes a long way.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Track your habits, keep your streak, and see how you stack up against friends each
              week.
            </p>
          </div>
          <TodayPreview compact className="max-w-sm" />
        </div>

        <p className="shrink-0 px-8 pb-8 text-sm text-muted-foreground">
          Build better habits, together.
        </p>
      </aside>

      {/* Right: the form */}
      <main className="flex flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6 lg:justify-end lg:px-8">
          <Logo className="lg:hidden" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Home
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-10 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
}
