import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  Check,
  EyeOff,
  Flame,
  ListChecks,
  Percent,
  RotateCcw,
  Sparkles,
  Swords,
  TrendingUp,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { LeaderboardPreview, TodayPreview } from "@/components/marketing-previews";
import { SiteHeader } from "@/components/site-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";
import { cn } from "@/lib/utils";

const heroPoints = ["No app to install", "Works on phone and desktop", "You choose what friends see"];

const features: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ListChecks,
    title: "Daily check-ins",
    text: "Your habits for today in one list. Tap to mark each one done.",
  },
  {
    icon: CalendarDays,
    title: "Flexible schedules",
    text: "Every day, weekdays only, or just Mon, Wed and Fri. Set it per habit.",
  },
  {
    icon: Flame,
    title: "Streaks",
    text: "See how many days in a row you've hit your target, and keep it going.",
  },
  {
    icon: Users,
    title: "Friends",
    text: "Connect with a friend request. Both of you have to accept.",
  },
  {
    icon: Trophy,
    title: "Weekly leaderboard",
    text: "Everyone ranked by consistency. A fresh start every Monday.",
  },
  {
    icon: EyeOff,
    title: "Privacy controls",
    text: "Hide any habit's name from friends. It still counts toward your score.",
  },
];

const fairness: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Percent,
    title: "Scored by completion",
    text: "Your score is the share of your own habits you finish, so having more habits isn't an advantage.",
  },
  {
    icon: RotateCcw,
    title: "Fresh start every week",
    text: "The leaderboard resets every Monday. A bad week never holds you back for long.",
  },
  {
    icon: Swords,
    title: "Challenges (coming soon)",
    text: "Everyone tracks the same habit for a set time, for a head-to-head comparison.",
  },
];

const steps: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ListChecks,
    title: "Create your habits",
    text: "Pick the habits you want to build and the days they apply.",
  },
  {
    icon: BellRing,
    title: "Check in every day",
    text: "Mark habits done as you go. Your daily score updates right away.",
  },
  {
    icon: TrendingUp,
    title: "Climb the leaderboard",
    text: "Stay consistent and finish the week ahead of your friends.",
  },
];

const faqs = [
  {
    q: "How is my score calculated?",
    a: "Each day, your score is the percentage of that day's scheduled habits you completed. Your weekly score is the average of your daily scores, and that's what the leaderboard ranks.",
  },
  {
    q: "Can my friends see all my habits?",
    a: "Only what you allow. For each habit you choose whether friends can see its name. Hidden habits still count toward your score.",
  },
  {
    q: "What if I forget to check in?",
    a: "You can still log yesterday's habits. Older days are locked, so nobody can fill in last week after the fact.",
  },
  {
    q: "When does the leaderboard reset?",
    a: "Every Monday, so everyone starts the new week from zero.",
  },
  {
    q: "Do I need to install an app?",
    a: "No. Compete runs in your browser and is designed for phones first, so it works just as well on a laptop.",
  },
];

const footerLinks = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/sign-in", label: "Sign in" },
      { href: "/sign-up", label: "Create account" },
    ],
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-48 h-[560px] bg-[radial-gradient(50%_60%_at_50%_0%,oklch(0.696_0.17_162.48/0.2),transparent_70%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]"
          />

          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pt-24 lg:pb-28">
            <div className="space-y-7">
              <Badge variant="secondary" className="gap-1.5">
                <Sparkles />
                Daily habits, friendly rivalry
              </Badge>
              <h1 className="text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Build your routine. <span className="text-primary">Beat your friends.</span>
              </h1>
              <p className="max-w-xl text-lg text-pretty text-muted-foreground">
                Compete turns your daily habits into a friendly competition. Track your routine,
                keep your streaks alive, and see who&apos;s the most consistent this week.
              </p>

              <Suspense fallback={<GuestCtas />}>
                <HeroCtas />
              </Suspense>

              <ul className="flex flex-col gap-x-6 gap-y-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap">
                {heroPoints.map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:mr-0">
              <TodayPreview />
              {/* Floating highlights (decorative) */}
              <div
                aria-hidden
                className="absolute -top-5 -left-6 hidden items-center gap-2 rounded-xl border bg-card px-3 py-2 text-xs font-medium shadow-lg sm:flex"
              >
                <span className="grid size-6 place-items-center rounded-md bg-primary/10 text-primary">
                  <TrendingUp className="size-3.5" />
                </span>
                +12% vs last week
              </div>
              <div
                aria-hidden
                className="absolute -right-4 -bottom-5 hidden items-center gap-2 rounded-xl border bg-card px-3 py-2 text-xs font-medium shadow-lg sm:flex"
              >
                <span className="grid size-6 place-items-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Trophy className="size-3.5" />
                </span>
                You moved up to 2nd
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-16 border-t bg-card/50">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <SectionHeading
              eyebrow="Features"
              title="Everything you need to stay on track"
              text="Simple tools for building habits, with just enough competition to keep you going."
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="group rounded-xl border bg-card p-6 shadow-xs transition-shadow hover:shadow-md"
                >
                  <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fair competition */}
        <section className="border-t">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:py-24">
            <LeaderboardPreview className="order-last mx-auto w-full max-w-md lg:order-first lg:ml-0" />
            <div>
              <SectionHeading
                eyebrow="Competition"
                title="Fair, friendly and every week"
                text="Compete compares consistency, not who has the longest to-do list."
              />
              <ul className="mt-10 space-y-7">
                {fairness.map(({ icon: Icon, title, text }) => (
                  <li key={title} className="flex gap-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg border bg-card text-primary shadow-xs">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold">{title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-16 border-t bg-card/50">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <SectionHeading
              eyebrow="How it works"
              title="Up and running in a minute"
              text="Three steps, then it's just you, your habits and your friends."
              align="center"
            />
            <div className="relative mt-14">
            <div
              aria-hidden
              className="absolute top-6 right-[16.66%] left-[16.66%] hidden h-px bg-border sm:block"
            />
            <ol className="relative grid gap-10 sm:grid-cols-3 sm:gap-6">
              {steps.map(({ icon: Icon, title, text }, index) => (
                <li key={title} className="relative flex flex-col items-center text-center">
                  <span className="relative grid size-12 place-items-center rounded-full border bg-background text-primary shadow-xs">
                    <Icon className="size-5" />
                    <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground tabular-nums">
                      {index + 1}
                    </span>
                  </span>
                  <h3 className="mt-5 font-semibold">{title}</h3>
                  <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">{text}</p>
                </li>
              ))}
            </ol>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-16 border-t">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:gap-16 lg:py-24">
            <SectionHeading
              eyebrow="FAQ"
              title="Questions, answered"
              text="Still curious? These cover how Compete works day to day."
            />
            <Accordion className="w-full">
              {faqs.map((faq) => (
                <AccordionItem key={faq.q} value={faq.q}>
                  <AccordionTrigger className="text-base">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final call to action */}
        <section className="px-4 pb-20 sm:px-6 lg:pb-24">
          <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl bg-linear-to-br from-emerald-600 via-emerald-700 to-emerald-900 px-6 py-14 text-center text-white sm:px-12 sm:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-emerald-300/20 blur-3xl"
            />
            <h2 className="relative text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Start your streak today
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-emerald-50/85">
              Set up your habits in a minute, invite a friend, and find out who&apos;s more
              consistent by Sunday.
            </p>
            <div className="relative mt-8 flex justify-center">
              <Suspense fallback={<BannerCta href="/sign-up" label="Create your account" />}>
                <BannerAction />
              </Suspense>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card/50">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr]">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Track your daily routine, keep your streaks alive, and compete with friends.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-semibold">{group.title}</p>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t">
          <p className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
            Compete. Build better habits, together.
          </p>
        </div>
      </footer>
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  text: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-2xl space-y-3", align === "center" && "mx-auto text-center")}>
      <p className="text-sm font-semibold text-primary">{eyebrow}</p>
      <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
      <p className="text-pretty text-muted-foreground">{text}</p>
    </div>
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
        Get started
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

async function BannerAction() {
  const user = await getCurrentUser();
  return user ? (
    <BannerCta href="/today" label="Open your Today page" />
  ) : (
    <BannerCta href="/sign-up" label="Create your account" />
  );
}

function BannerCta({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ size: "lg" }),
        "h-11 bg-white px-5 text-emerald-800 hover:bg-emerald-50",
      )}
    >
      {label}
      <ArrowRight data-icon="inline-end" />
    </Link>
  );
}
