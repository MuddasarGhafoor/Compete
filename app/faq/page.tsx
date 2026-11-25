import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { FaqBrowser } from "./faq-browser";

export const metadata: Metadata = {
  title: "FAQ",
  description: "How Compete works, from your first habit to the weekly leaderboard.",
};

export default function FaqPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <FaqBrowser
          intro={
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-primary">FAQ</p>
              <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-balance sm:text-5xl">
                Questions, answered
              </h1>
              <p className="mt-4 text-lg text-pretty text-muted-foreground">
                How Compete works day to day, from your first habit to the weekly leaderboard.
              </p>
            </div>
          }
        />
      </main>

      <SiteFooter />
    </>
  );
}
