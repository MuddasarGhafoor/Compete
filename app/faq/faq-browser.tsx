"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronsDownUp, ChevronsUpDown, Search, SearchX, X } from "lucide-react";
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

const allItemIds = faqGroups.flatMap((group) => group.items.map((item) => item.id));

function filterGroups(query: string): FaqGroup[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return faqGroups;
  return faqGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => item.q.toLowerCase().includes(needle) || item.a.toLowerCase().includes(needle),
      ),
    }))
    .filter((group) => group.items.length > 0);
}

/** Wraps matches of `query` in <mark>. */
function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim();
  if (!needle) return text;

  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === needle.toLowerCase() ? (
      <mark key={index} className="rounded-sm bg-warm/30 px-0.5 text-foreground">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

/** Highlights the topic whose section is currently in view. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // A band in the upper part of the screen, below the sticky header.
      { rootMargin: "-120px 0px -55% 0px" },
    );
    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

export function FaqBrowser() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string[]>([]);

  const groups = useMemo(() => filterGroups(query), [query]);
  const groupIds = useMemo(() => groups.map((group) => group.id), [groups]);
  const active = useActiveSection(groupIds);
  const matchCount = groups.reduce((total, group) => total + group.items.length, 0);
  const allOpen = open.length >= allItemIds.length;

  function handleSearch(value: string) {
    setQuery(value);
    // Open every matching answer while searching; collapse again when cleared.
    setOpen(value.trim() ? filterGroups(value).flatMap((g) => g.items.map((i) => i.id)) : []);
  }

  /** Each topic has its own accordion; merge its open items into the shared list. */
  function setGroupOpen(groupItemIds: string[], values: string[]) {
    setOpen((current) => [...current.filter((id) => !groupItemIds.includes(id)), ...values]);
  }

  return (
    <div>
      {/* Search + expand all */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Search questions"
            aria-label="Search questions"
            className="h-11 rounded-xl bg-card pr-10 pl-10 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => handleSearch("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
            >
              <X />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3 sm:ml-auto">
          {query && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {matchCount} {matchCount === 1 ? "result" : "results"}
            </p>
          )}
          {!query && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setOpen(allOpen ? [] : allItemIds)}
            >
              {allOpen ? <ChevronsDownUp data-icon="inline-start" /> : <ChevronsUpDown data-icon="inline-start" />}
              {allOpen ? "Collapse all" : "Expand all"}
            </Button>
          )}
        </div>
      </div>

      {/* Topic chips (mobile and tablet), sticky under the header */}
      {groups.length > 0 && (
        <nav
          aria-label="FAQ topics"
          className="sticky top-16 z-30 -mx-4 mt-8 border-b bg-background/95 px-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:hidden"
        >
          <ul className="no-scrollbar flex gap-2 overflow-x-auto py-3">
            {groups.map((group) => (
              <li key={group.id} className="shrink-0">
                <a
                  href={`#${group.id}`}
                  data-active={active === group.id}
                  className="inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm text-muted-foreground transition-colors data-[active=true]:border-foreground data-[active=true]:bg-foreground data-[active=true]:text-background"
                >
                  {group.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="mt-8 grid gap-12 lg:mt-12 lg:grid-cols-[240px_1fr] lg:gap-16">
        {/* Topic list (desktop) with scroll spy */}
        <nav aria-label="FAQ topics" className="hidden lg:block">
          <div className="sticky top-28">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Topics
            </p>
            <ul className="mt-4 space-y-1 border-l">
              {groups.map((group) => (
                <li key={group.id}>
                  <a
                    href={`#${group.id}`}
                    data-active={active === group.id}
                    className="-ml-px flex items-center justify-between gap-3 border-l-2 border-transparent py-2 pr-2 pl-4 text-sm text-muted-foreground transition-all duration-200 hover:text-foreground data-[active=true]:border-primary data-[active=true]:font-medium data-[active=true]:text-foreground"
                  >
                    {group.title}
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                      {group.items.length}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="min-w-0 space-y-16">
          {groups.map(({ id, title, description, icon: Icon, items }) => (
            <section key={id} id={id} className="reveal scroll-mt-36 lg:scroll-mt-28">
              <div className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg border bg-card text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
              </div>

              <Accordion
                multiple
                value={open.filter((openId) => items.some((item) => item.id === openId))}
                onValueChange={(values) => setGroupOpen(items.map((item) => item.id), values)}
                className="mt-6 rounded-xl border bg-card px-5 sm:px-6"
              >
                {items.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="py-4 text-base hover:no-underline data-panel-open:text-primary">
                      <span>
                        <Highlight text={item.q} query={query} />
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 leading-relaxed text-muted-foreground">
                      <Highlight text={item.a} query={query} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}

          {groups.length === 0 && (
            <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-16 text-center">
              <SearchX className="size-8 text-muted-foreground" />
              <p className="mt-4 font-semibold">No questions match &ldquo;{query}&rdquo;</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different word, like score, streak or friends.</p>
              <Button type="button" variant="outline" size="lg" className="mt-6" onClick={() => handleSearch("")}>
                Clear search
              </Button>
            </div>
          )}

          <div className="reveal flex flex-col gap-4 rounded-xl border bg-secondary p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
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
        </div>
      </div>
    </div>
  );
}
