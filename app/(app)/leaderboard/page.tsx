import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowDown, ArrowUp, Crown, Flame, Minus, Timer, Users } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { PersonAvatar } from "@/components/app/person-avatar";
import { PageSkeleton } from "@/components/app/require-session";
import { SegmentedLinks } from "@/components/app/segmented-links";
import { ComparisonChart } from "@/components/charts/comparison-chart";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getViewer } from "@/lib/data/core";
import { getStandings } from "@/lib/data/social";
import { addDays, formatDay, startOfWeek, weekdayIndex } from "@/lib/dates";
import { formatPercent, plural } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Leaderboard",
};

export default function LeaderboardPage(props: PageProps<"/leaderboard">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LeaderboardContent searchParams={props.searchParams} />
    </Suspense>
  );
}

async function LeaderboardContent({ searchParams }: { searchParams: PageProps<"/leaderboard">["searchParams"] }) {
  const viewer = await getViewer();
  const { week } = await searchParams;
  const isLastWeek = week === "last";
  const thisWeek = startOfWeek(viewer.today);
  const weekStart = isLastWeek ? addDays(thisWeek, -7) : thisWeek;
  const standings = await getStandings(viewer, weekStart);

  const daysLeft = 7 - weekdayIndex(viewer.today);
  const range = `${formatDay(weekStart, { month: "short", day: "numeric" })} – ${formatDay(addDays(weekStart, 6), {
    month: "short",
    day: "numeric",
  })}`;

  const header = (
    <PageHeader
      title="Leaderboard"
      description={`Ranked by weekly score · ${range}`}
      actions={
        <SegmentedLinks
          items={[
            { href: "/leaderboard", label: "This week", active: !isLastWeek },
            { href: "/leaderboard?week=last", label: "Last week", active: isLastWeek },
          ]}
        />
      }
    />
  );

  if (standings.length < 2) {
    return (
      <div className="space-y-8">
        {header}
        <EmptyState
          icon={Users}
          title="The leaderboard needs friends"
          description="Add friends and you'll be ranked against them every week. Scores are the average of your daily completion, so it's fair however many habits you have."
        >
          <Link href="/friends" className={buttonVariants({ size: "lg" })}>
            Find friends
          </Link>
        </EmptyState>
      </div>
    );
  }

  const leader = standings[0];
  const chartPeople = standings.slice(0, 6);
  const chartData = leader.daily.map((day, position) => ({
    label: formatDay(day.date, { weekday: "short" }),
    full: formatDay(day.date, { weekday: "long", month: "short", day: "numeric" }),
    ...Object.fromEntries(chartPeople.map((entry, index) => [`p${index}`, entry.daily[position]?.percent ?? null])),
  }));

  return (
    <div className="space-y-8">
      {header}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        {isLastWeek ? (
          <span className="flex items-center gap-1.5">
            <Crown className="size-4 text-warm" />
            {leader.person.isYou ? "You won last week" : `${leader.person.name} won last week`} with{" "}
            {formatPercent(leader.score)}
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Timer className="size-4" />
            Resets in {plural(daysLeft, "day")} (Monday)
          </span>
        )}
        <span>{plural(standings.length, "person", "people")}</span>
      </div>

      <Card className="py-0">
        <ol className="divide-y">
          {standings.map((entry, position) => {
            const change =
              entry.score !== null && entry.previousScore !== null ? entry.score - entry.previousScore : null;
            return (
              <li
                key={entry.person.id}
                className={cn("flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6", entry.person.isYou && "bg-accent/60")}
              >
                <span className="grid w-6 shrink-0 place-items-center text-sm font-semibold text-muted-foreground tabular-nums">
                  {position === 0 ? <Crown className="size-4.5 text-warm" /> : position + 1}
                </span>
                <PersonAvatar name={entry.person.name} isYou={entry.person.isYou} />
                <div className="min-w-0 flex-1">
                  {entry.person.isYou || !entry.person.username ? (
                    <p className="truncate font-medium">{entry.person.isYou ? `${entry.person.name} (you)` : entry.person.name}</p>
                  ) : (
                    <Link href={`/friends/${entry.person.username}`} className="truncate font-medium hover:underline">
                      {entry.person.name}
                    </Link>
                  )}
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", entry.person.isYou ? "bg-primary" : "bg-foreground/25")}
                      style={{ width: `${entry.score ?? 0}%` }}
                    />
                  </div>
                </div>
                <div className="hidden w-16 items-center justify-end gap-1 text-sm text-muted-foreground tabular-nums sm:flex">
                  <Flame className="size-3.5 text-warm" />
                  {entry.streak}
                </div>
                <div className="hidden w-16 justify-end sm:flex">
                  {change === null ? (
                    <span className="text-xs text-muted-foreground">–</span>
                  ) : (
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
                        change > 0 ? "text-primary" : change < 0 ? "text-destructive" : "text-muted-foreground",
                      )}
                      title="Change from the week before"
                    >
                      {change > 0 ? <ArrowUp className="size-3" /> : change < 0 ? <ArrowDown className="size-3" /> : <Minus className="size-3" />}
                      {Math.abs(change)}
                    </span>
                  )}
                </div>
                <span className="w-14 shrink-0 text-right text-lg font-semibold tabular-nums">{formatPercent(entry.score)}</span>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Day by day</CardTitle>
          <CardDescription>Daily completion for {chartPeople.length < standings.length ? "the top 6" : "everyone"}.</CardDescription>
        </CardHeader>
        <CardContent>
          <ComparisonChart
            series={chartPeople.map((entry, index) => ({
              key: `p${index}`,
              label: entry.person.isYou ? "You" : entry.person.name.split(" ")[0],
              isYou: entry.person.isYou,
            }))}
            data={chartData}
          />
        </CardContent>
      </Card>
    </div>
  );
}
