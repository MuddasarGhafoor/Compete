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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

const faqGroups = [
  {
    title: "Getting started",
    items: [
      {
        q: "Do I need to install an app?",
        a: "No. Compete runs in your browser. It's built for phones first and works just as well on a laptop.",
      },
      {
        q: "What kind of habits can I track?",
        a: "Anything you can mark as done or not done, like \"Go for a run\", \"Read 20 pages\" or \"No sugar\". Habits with a number target, like 8 glasses of water, are coming later.",
      },
      {
        q: "How many habits should I start with?",
        a: "Three to five is a good start. Your score is a percentage, so a short list you actually finish beats a long one you don't.",
      },
    ],
  },
  {
    title: "Scores and streaks",
    items: [
      {
        q: "How is my score calculated?",
        a: "Each day, your score is the percentage of that day's scheduled habits you completed. Your weekly score is the average of your daily scores, and that's what the leaderboard ranks.",
      },
      {
        q: "How do streaks work?",
        a: "Every day you check in and hit your target adds one to your streak. Miss a day and it starts over.",
      },
      {
        q: "What if I forget to check in?",
        a: "You can still log yesterday's habits. Anything older is locked, so nobody can fill in last week after the fact.",
      },
    ],
  },
  {
    title: "Friends and privacy",
    items: [
      {
        q: "How do I add friends?",
        a: "Send them a friend request. Once they accept, you'll both show up on each other's weekly leaderboard.",
      },
      {
        q: "Can my friends see all my habits?",
        a: "Only what you allow. For each habit you choose whether friends can see its name. Hidden habits still count toward your score.",
      },
      {
        q: "When does the leaderboard reset?",
        a: "Every Monday, so everyone starts the new week from zero.",
      },
    ],
  },
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
          <dl className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4">
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

        {/* FAQ */}
        <Section id="faq">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <SectionHeading
                title="Questions, answered"
                intro="How Compete works day to day, from your first habit to the weekly leaderboard."
              />
            </div>

            <div className="space-y-10">
              {faqGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="text-sm font-semibold text-muted-foreground">{group.title}</h3>
                  <Accordion className="mt-3 rounded-xl border bg-card px-5">
                    {group.items.map((item) => (
                      <AccordionItem key={item.q} value={item.q}>
                        <AccordionTrigger className="py-4 text-base hover:no-underline">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 text-muted-foreground">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
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
      <Link href="/sign-up" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}>
        Get started
        <ArrowRight data-icon="inline-end" />
      </Link>
      <Link
        href="/sign-in"
        className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5")}
      >
        Sign in
      </Link>
    </div>
  );
}
