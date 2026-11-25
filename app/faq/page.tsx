import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/container";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "FAQ",
  description: "How Compete works, from your first habit to the weekly leaderboard.",
};

const faqGroups = [
  {
    id: "getting-started",
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
      {
        q: "Do I need friends to use it?",
        a: "No. On your own you still get your daily list, scores and streaks. Friends add the weekly leaderboard.",
      },
    ],
  },
  {
    id: "scores-and-streaks",
    title: "Scores and streaks",
    items: [
      {
        q: "How is my score calculated?",
        a: "Each day, your score is the percentage of that day's scheduled habits you completed. Your weekly score is the average of your daily scores, and that's what the leaderboard ranks.",
      },
      {
        q: "Do days with nothing scheduled count against me?",
        a: "No. If a habit only runs on weekdays, it isn't part of your weekend score.",
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
    id: "friends-and-competition",
    title: "Friends and competition",
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
        q: "Isn't it unfair if someone has fewer habits?",
        a: "No. Everyone is scored on the share of their own habits they finish, so a longer list doesn't earn more points.",
      },
      {
        q: "When does the leaderboard reset?",
        a: "Every Monday, so everyone starts the new week from zero.",
      },
      {
        q: "What are challenges?",
        a: "Coming soon. Someone picks one habit and a time frame, friends join, and everyone tracks the same thing for a head-to-head comparison.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <Container className="py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-muted-foreground">FAQ</p>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-balance sm:text-5xl">
              Questions, answered
            </h1>
            <p className="mt-4 text-lg text-pretty text-muted-foreground">
              How Compete works day to day, from your first habit to the weekly leaderboard.
            </p>
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-[220px_1fr] lg:gap-16">
            {/* Topic list (desktop) */}
            <nav aria-label="FAQ topics" className="hidden lg:block">
              <ul className="sticky top-28 space-y-1 border-l">
                {faqGroups.map((group) => (
                  <li key={group.id}>
                    <a
                      href={`#${group.id}`}
                      className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      {group.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="space-y-12">
              {faqGroups.map((group) => (
                <section key={group.id} id={group.id} className="scroll-mt-24">
                  <h2 className="text-xl font-semibold tracking-tight">{group.title}</h2>
                  <Accordion className="mt-4 rounded-xl border bg-card px-5 sm:px-6">
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
                </section>
              ))}

              <div className="flex flex-col gap-4 rounded-xl border bg-secondary p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div>
                  <p className="font-semibold">The best way to find out is to try it.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    It takes about a minute to set up your first habits.
                  </p>
                </div>
                <Link href="/sign-up" className={cn(buttonVariants({ size: "lg" }), "h-11 shrink-0 px-5")}>
                  Get started
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </main>

      <SiteFooter />
    </>
  );
}
