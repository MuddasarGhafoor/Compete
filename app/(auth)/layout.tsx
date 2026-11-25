import Link from "next/link";
import { ArrowLeft, CalendarCheck, Flame, Trophy } from "lucide-react";
import { Logo } from "@/components/logo";

const points = [
  { icon: CalendarCheck, text: "Plan the habits you want to build" },
  { icon: Flame, text: "Check in daily and grow your streaks" },
  { icon: Trophy, text: "Compete with friends every week" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-2">
      {/* Left: compact brand panel (desktop only) */}
      <aside className="relative hidden overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-emerald-900 text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:justify-between lg:p-10 xl:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.06)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-24 size-96 rounded-full bg-emerald-400/20 blur-3xl"
        />

        <Logo tone="light" className="relative self-start" />

        <div className="relative max-w-sm space-y-6">
          <h2 className="text-3xl leading-tight font-semibold tracking-tight text-balance">
            Turn your daily routine into a friendly competition.
          </h2>
          <ul className="space-y-3">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-emerald-50">
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-white/10 ring-1 ring-white/15">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-emerald-100/70">Build better habits, together.</p>
      </aside>

      {/* Right: the form */}
      <main className="flex flex-col bg-background px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between lg:justify-end">
          <Logo className="lg:hidden" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Home
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
