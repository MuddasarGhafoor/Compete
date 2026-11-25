import Link from "next/link";
import { ArrowRight, CalendarCheck, Flame, Trophy, Wrench } from "lucide-react";
import { Logo } from "@/components/logo";
import { LeaderboardPreview } from "@/components/marketing-previews";
import { isDevAuthBypassEnabled } from "@/lib/dev-auth";

const highlights = [
  {
    icon: CalendarCheck,
    title: "Plan your routine",
    text: "Choose the habits you want to build and the days they matter.",
  },
  {
    icon: Flame,
    title: "Stay consistent",
    text: "Check in every day and watch your streaks grow.",
  },
  {
    icon: Trophy,
    title: "Win the week",
    text: "Compare scores with friends on a weekly leaderboard.",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-2">
      {/* Left: brand panel (desktop only) */}
      <aside className="relative hidden overflow-hidden bg-zinc-950 p-10 text-white lg:flex lg:flex-col xl:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_15%_0%,oklch(0.596_0.145_163.225/0.35),transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        />

        <Logo tone="light" className="relative self-start" />

        <div className="relative my-auto max-w-md space-y-10 py-12">
          <div className="space-y-4">
            <h2 className="text-4xl leading-tight font-semibold tracking-tight text-balance">
              Turn your daily routine into a friendly competition.
            </h2>
            <p className="text-lg text-zinc-400">
              Compete keeps you and your friends accountable, one habit at a time.
            </p>
          </div>

          <ul className="space-y-6">
            {highlights.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/5 ring-1 ring-white/10">
                  <Icon className="size-5 text-emerald-400" />
                </span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-zinc-400">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          <LeaderboardPreview />
        </div>

        <p className="relative text-sm text-zinc-500">
          Built for consistency, powered by friendly rivalry.
        </p>
      </aside>

      {/* Right: the form */}
      <main className="flex flex-col px-6 py-8 sm:px-10">
        <Logo className="self-start lg:hidden" />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 py-12">
          {children}
          {isDevAuthBypassEnabled && <DevBypassNotice />}
        </div>
      </main>
    </div>
  );
}

function DevBypassNotice() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-dashed border-amber-500/50 bg-amber-500/5 p-4 text-sm">
      <Wrench className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="space-y-1">
        <p className="font-medium">Development login bypass is on</p>
        <p className="text-muted-foreground">You can open the app without signing in.</p>
        <Link
          href="/today"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          Open Today as Dev User
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
