import type { Metadata } from "next";
import { Container } from "@/components/container";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { FaqBrowser } from "./faq-browser";
import { faqGroups } from "./faq-data";

export const metadata: Metadata = {
  title: "FAQ",
  description: "How Compete works, from your first habit to the weekly leaderboard.",
};

const questionCount = faqGroups.reduce((total, group) => total + group.items.length, 0);

export default function FaqPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Page heading */}
        <section className="border-b bg-secondary/60">
          <Container className="py-16 sm:py-20">
            <div className="max-w-2xl animate-in duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
              <p className="text-sm font-medium text-muted-foreground">
                FAQ · {questionCount} questions
              </p>
              <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-balance sm:text-5xl">
                Questions, answered
              </h1>
              <p className="mt-4 text-lg text-pretty text-muted-foreground">
                How Compete works day to day, from your first habit to the weekly leaderboard.
              </p>
            </div>
          </Container>
        </section>

        <Container className="py-12 sm:py-16">
          <FaqBrowser />
        </Container>
      </main>

      <SiteFooter />
    </>
  );
}
