"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Plus, Search, SearchX, X } from "lucide-react";
import { Container } from "@/components/container";
import { MotionProvider } from "@/components/motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { faqGroups, type FaqGroup } from "./faq-data";

type TopicId = "all" | FaqGroup["id"];

const totalCount = faqGroups.reduce((total, group) => total + group.items.length, 0);

const topics: { id: TopicId; title: string; count: number }[] = [
  { id: "all", title: "All topics", count: totalCount },
  ...faqGroups.map((group) => ({ id: group.id, title: group.title, count: group.items.length })),
];

function visibleGroups(topic: TopicId, query: string): FaqGroup[] {
  const needle = query.trim().toLowerCase();
  return faqGroups
    .filter((group) => topic === "all" || group.id === topic)
    .map((group) => ({
      ...group,
      items: needle
        ? group.items.filter(
            (item) =>
              item.q.toLowerCase().includes(needle) || item.a.toLowerCase().includes(needle),
          )
        : group.items,
    }))
    .filter((group) => group.items.length > 0);
}

/** Wraps matches of `query` in <mark>. */
function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim();
  if (!needle) return text;

  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.split(new RegExp(`(${escaped})`, "gi")).map((part, index) =>
    part.toLowerCase() === needle.toLowerCase() ? (
      <mark key={index} className="rounded-sm bg-warm/30 px-0.5 text-foreground">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

type FaqBrowserProps = {
  /** Server-rendered page heading for the top band. */
  intro: React.ReactNode;
};

/*
 * Layout (nothing is sticky, so nothing moves while scrolling):
 *   1. Top band: page heading + search.
 *   2. Topic tabs (filter) + result count / expand all.
 *   3. One row per topic: topic info on the left, its questions on the right.
 */
export function FaqBrowser({ intro }: FaqBrowserProps) {
  const [topic, setTopic] = useState<TopicId>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string[]>([]);

  const groups = useMemo(() => visibleGroups(topic, query), [topic, query]);
  const shownIds = groups.flatMap((group) => group.items.map((item) => item.id));
  const allShownOpen = shownIds.length > 0 && shownIds.every((id) => open.includes(id));
  const searching = query.trim().length > 0;

  function handleSearch(value: string) {
    setQuery(value);
    setTopic("all");
    // Open every matching answer while searching; collapse again when cleared.
    setOpen(
      value.trim() ? visibleGroups("all", value).flatMap((g) => g.items.map((i) => i.id)) : [],
    );
  }

  function selectTopic(id: TopicId) {
    setTopic(id);
    setQuery("");
    setOpen([]);
  }

  /** Each topic has its own accordion; merge its open items into the shared list. */
  function setGroupOpen(groupItemIds: string[], values: string[]) {
    setOpen((current) => [...current.filter((id) => !groupItemIds.includes(id)), ...values]);
  }

  return (
    <MotionProvider>
      {/* 1. Top band */}
      <section className="border-b bg-secondary/50">
        <Container className="grid gap-8 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end lg:gap-16">
          {intro}

          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search questions"
              aria-label="Search questions"
              className="h-12 rounded-xl bg-card pr-11 pl-11 text-base shadow-xs [&::-webkit-search-cancel-button]:hidden"
            />
            {searching && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleSearch("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground"
              >
                <X />
              </Button>
            )}
          </div>
        </Container>
      </section>

      <Container className="py-10 sm:py-12">
        {/* 2. Topic tabs + count */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="FAQ topics" className="min-w-0">
            <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              {topics.map(({ id, title, count }) => {
                const active = topic === id && !searching;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => selectTopic(id)}
                    aria-pressed={active}
                    className={cn(
                      "relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      active ? "text-background" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="faq-active-topic"
                        className="absolute inset-0 rounded-full bg-foreground"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      />
                    )}
                    <span className="relative">{title}</span>
                    <span
                      className={cn(
                        "relative text-xs tabular-nums",
                        active ? "text-background/70" : "text-muted-foreground/70",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {searching ? (
                <>
                  {shownIds.length} {shownIds.length === 1 ? "result" : "results"} for{" "}
                  <span className="font-medium text-foreground">&ldquo;{query.trim()}&rdquo;</span>
                </>
              ) : (
                <>{shownIds.length} questions</>
              )}
            </p>
            {shownIds.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setOpen(
                    allShownOpen
                      ? open.filter((id) => !shownIds.includes(id))
                      : [...new Set([...open, ...shownIds])],
                  )
                }
              >
                {allShownOpen ? "Collapse all" : "Expand all"}
              </Button>
            )}
          </div>
        </div>

        {/* 3. One row per topic */}
        <div className="mt-8">
          <AnimatePresence mode="popLayout" initial={false}>
            {groups.map(({ id, title, description, icon: Icon, items }) => (
              <motion.section
                key={id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                aria-labelledby={`faq-${id}`}
                className="grid gap-6 border-t py-10 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-16"
              >
                <div>
                  <span className="grid size-10 place-items-center rounded-lg border bg-card text-primary">
                    <Icon className="size-5" />
                  </span>
                  <h2 id={`faq-${id}`} className="mt-4 text-lg font-semibold tracking-tight">
                    {title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>

                <Accordion
                  multiple
                  value={open.filter((openId) => items.some((item) => item.id === openId))}
                  onValueChange={(values) => setGroupOpen(items.map((item) => item.id), values)}
                  className="space-y-3"
                >
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.05 + index * 0.04 }}
                    >
                      <AccordionItem
                        value={item.id}
                        className="rounded-xl border bg-card px-5 transition-colors not-last:border-b data-open:border-primary/35 sm:px-6"
                      >
                        <AccordionTrigger
                          className="items-center gap-4 py-4 text-base hover:no-underline"
                          icon={
                            <span className="ml-auto grid size-7 shrink-0 place-items-center rounded-full border text-muted-foreground transition-all duration-300 group-aria-expanded/accordion-trigger:rotate-45 group-aria-expanded/accordion-trigger:border-primary/40 group-aria-expanded/accordion-trigger:bg-primary/10 group-aria-expanded/accordion-trigger:text-primary">
                              <Plus className="size-4" />
                            </span>
                          }
                        >
                          <span>
                            <Highlight text={item.q} query={query} />
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pr-11 pb-5 leading-relaxed text-muted-foreground">
                          <Highlight text={item.a} query={query} />
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  ))}
                </Accordion>
              </motion.section>
            ))}
          </AnimatePresence>

          {groups.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center rounded-xl border border-dashed px-6 py-16 text-center"
            >
              <SearchX className="size-8 text-muted-foreground" />
              <p className="mt-4 font-semibold">No questions match &ldquo;{query.trim()}&rdquo;</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different word, like score, streak or friends.
              </p>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="mt-6"
                onClick={() => handleSearch("")}
              >
                Clear search
              </Button>
            </motion.div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-xl border bg-secondary p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="font-semibold">The best way to find out is to try it.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              It takes about a minute to set up your first habits.
            </p>
          </div>
          <Link
            href="/sign-in"
            className={cn(buttonVariants({ size: "lg" }), "h-11 shrink-0 px-5")}
          >
            Get started
            <ArrowRight data-icon="inline-end" />
          </Link>
        </div>
      </Container>
    </MotionProvider>
  );
}
