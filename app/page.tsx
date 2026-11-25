import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Flame, ListChecks, Sparkles, Trophy, Users, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/logo";
import { TodayPreview } from "@/components/marketing-previews";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";
import { cn } from "@/lib/utils";

const features: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ListChecks,
    title: "Track daily habits",
    text: "Set up your routine once, then check habits off in a tap every day.",
  },
  {
    icon: Flame,
    title: "Keep your streaks",
    text: "See how many days in a row you've stayed on track and keep it going.",
  },
  {
    icon: Users,
    title: "Connect with friends",
    text: "Add friends with a request. You choose which habits they can see.",
  },
  {
    icon: Trophy,
    title: "Compete every week",
    text: "A weekly leaderboard ranks everyone by consistency and resets every Monday.",
  },
];

const steps = [
  { title: "Create your habits", text: "Pick the habits you want to build and the days they apply." },
  { title: "Check in every day", text: "Mark habits done as you go. Your score updates instantly." },
  { title: "Climb the leaderboard", text: "Stay consistent to beat your friends by the end of the week." },
];

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          {/* Reads the session, so it streams in behind a Suspense boundary. */}
          <Suspense fallback={<GuestNav />}>
            <HeaderActions />
          </Suspense>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 h-[480px] bg-[radial-gradient(50%_60%_at_50%_0%,oklch(0.696_0.17_162.48/0.18),transparent_70%)]"
          />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
            <div className="space-y-6">
              <Badge variant="secondary" className="gap-1.5">
                <Sparkles />
                Daily habits, friendly rivalry
              </Badge>
              <h1 className="text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Build your routine. <span className="text-primary">Beat your friends.</span>
              </h1>
              <p className="max-w-lg text-lg text-pretty text-muted-foreground">
                Compete turns your daily habits into a friendly competition. Track your routine,
                keep your streaks alive, and see who&apos;s the most consistent this week.
              </p>
              <Suspense fallback={<GuestCtas />}>
                <HeroCtas />
              </Suspense>
            </div>

            <TodayPreview className="mx-auto w-full max-w-md lg:mr-0" />
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-card/60">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight">
                Everything you need to stay on track
              </h2>
              <p className="text-muted-foreground">
                Simple tools for building habits, and just enough competition to keep you going.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-xl border bg-card p-5 shadow-xs">
                  <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
            <ol className="mt-10 grid gap-8 sm:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title} className="space-y-3">
                  <span className="grid size-8 place-items-center rounded-full border bg-card text-sm font-semibold tabular-nums">
                    {index + 1}
                  </span>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
          <Logo />
          <p className="text-sm text-muted-foreground">Build better habits, together.</p>
        </div>
      </footer>
    </>
  );
}

async function HeaderActions() {
  const user = await getCurrentUser();
  if (!user) return <GuestNav />;

  return (
    <Link href="/today" className={buttonVariants({ size: "lg" })}>
      Open app
      <ArrowRight data-icon="inline-end" />
    </Link>
  );
}

function GuestNav() {
  return (
    <nav className="flex items-center gap-2">
      <Link href="/sign-in" className={buttonVariants({ variant: "ghost", size: "lg" })}>
        Sign in
      </Link>
      <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
        Get started
      </Link>
    </nav>
  );
}

async function HeroCtas() {
  const user = await getCurrentUser();
  if (!user) return <GuestCtas />;

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link href="/today" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}>
        Continue as {user.name}
        <ArrowRight data-icon="inline-end" />
      </Link>
    </div>
  );
}

function GuestCtas() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link href="/sign-up" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}>
        Get started for free
        <ArrowRight data-icon="inline-end" />
      </Link>
      <Link
        href="/sign-in"
        className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5")}
      >
        I already have an account
      </Link>
    </div>
  );
}
