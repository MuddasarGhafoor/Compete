import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  EyeOff,
  Flame,
  ListChecks,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/container";
import { LeaderboardPreview, TodayPreview } from "@/components/marketing-previews";
import { Section, SectionHeading } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "Write down your habits",
    text: "Pick the few things you want to do more often, and the days they matter.",
  },
  {
    title: "Check in as you go",
    text: "Tick each habit off when it's done. Your score for the day updates straight away.",
  },
  {
    title: "Compare notes on Sunday",
    text: "See who stuck to their routine best this week, then start again on Monday.",
  },
];

const features: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ListChecks,
    title: "One list for today",
    text: "Only the habits scheduled for today, so there's nothing to scroll past.",
  },
  {
    icon: CalendarDays,
    title: "Schedules that fit",
    text: "Every day, weekdays only, or just Monday, Wednesday and Friday.",
  },
  {
    icon: Flame,
    title: "Streaks",
    text: "A running count of the days in a row you've kept it up.",
  },
  {
    icon: Users,
    title: "Friends",
    text: "Send a request; once they accept, you're on each other's leaderboard.",
  },
  {
    icon: Trophy,
    title: "A weekly leaderboard",
    text: "Ranked by consistency, and wiped clean every Monday.",
  },
  {
    icon: EyeOff,
    title: "Private habits",
    text: "Hide a habit's name from friends. It still counts toward your score.",
  },
];

const fairPoints = [
  "You're scored on the share of your own habits you finish.",
  "More habits doesn't mean more points, so nobody wins by padding their list.",
  "Everyone starts from zero every Monday.",
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section>
          <Container className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                A habit tracker for you and your friends
              </p>
              <h1 className="mt-4 font-display text-5xl leading-[1.05] font-medium tracking-tight text-balance sm:text-6xl">
                Build your routine. <span className="text-primary italic">Beat your friends.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-pretty text-muted-foreground">
                Check off your day, keep your streak going, and find out who&apos;s been the most
                consistent by Sunday. Nothing to install, and you decide what your friends see.
              </p>
              <div className="mt-8">
                <Suspense fallback={<GuestCtas />}>
                  <PrimaryCtas />
                </Suspense>
              </div>
            </div>

            <TodayPreview className="w-full max-w-md justify-self-center lg:justify-self-end" />
          </Container>
        </section>

        {/* How it works */}
        <Section id="how-it-works" title="How it works" intro="Three steps, and you're set.">
          <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="border-t pt-6">
                <p className="font-display text-3xl text-muted-foreground tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* Features */}
        <Section
          id="features"
          title="Small on purpose"
          intro="Compete does a few things and tries to do them well."
        >
          {/* gap-px over bg-border draws 1px lines between the cells */}
          <dl className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 bg-background p-6 sm:p-8">
                <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <dt className="font-semibold">{title}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{text}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Section>

        {/* Fair competition */}
        <Section>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                title="Fair competition, every week"
                intro="Three habits done well beats ten done halfway. The leaderboard is built around that."
              />
              <ul className="mt-8 space-y-4">
                {fairPoints.map((point) => (
                  <li key={point} className="flex gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <LeaderboardPreview className="w-full max-w-md justify-self-center lg:justify-self-end" />
          </div>
        </Section>

        {/* Closing call to action */}
        <Section>
          <div className="flex flex-col gap-8 rounded-xl border bg-card p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
                Ready when you are.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Set up your first habits in a minute, then invite a friend whenever you like.
              </p>
            </div>
            <Suspense fallback={<GuestCtas />}>
              <PrimaryCtas />
            </Suspense>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </>
  );
}

async function PrimaryCtas() {
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
      <Link href="/sign-in" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}>
        Get started
        <ArrowRight data-icon="inline-end" />
      </Link>
      <Link
        href="/faq"
        className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5")}
      >
        Read the FAQ
      </Link>
    </div>
  );
}
