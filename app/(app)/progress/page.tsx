import type { Metadata } from "next";
import { Suspense } from "react";
import {
  CalendarCheck,
  ChartColumn,
  CircleCheckBig,
  Flame,
  Lock,
  Medal,
  Sparkles,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { PageSkeleton } from "@/components/app/require-session";
import { SegmentedLinks } from "@/components/app/segmented-links";
import { StatCard } from "@/components/app/stat-card";
import { DailyChart } from "@/components/charts/daily-chart";
import { Heatmap } from "@/components/charts/heatmap";
import { WeeklyChart } from "@/components/charts/weekly-chart";
import { HabitIcon } from "@/components/habit-icon";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { countFinishedChallenges, getChallenges } from "@/lib/data/challenges";
import { getViewer, loadUserActivity } from "@/lib/data/core";
import { addDays, dayRange, describeSchedule, formatDay, startOfWeek } from "@/lib/dates";
import { formatPercent, plural } from "@/lib/format";
import {
  achievements,
  averagePercent,
  bestStreak,
  currentStreak,
  dailyStats,
  habitSummary,
  indexCheckIns,
  perfectWeeks,
  weekScore,
  type Achievement,
} from "@/lib/stats";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Progress",
};

const achievementIcons: Record<Achievement["icon"], LucideIcon> = {
  sparkles: Sparkles,
  flame: Flame,
  "calendar-check": CalendarCheck,
  trophy: Trophy,
  medal: Medal,
  target: Target,
};

export default function ProgressPage(props: PageProps<"/progress">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProgressContent searchParams={props.searchParams} />
    </Suspense>
  );
}

async function ProgressContent({ searchParams }: { searchParams: PageProps<"/progress">["searchParams"] }) {
  const viewer = await getViewer();
  const { range: rangeParam } = await searchParams;
  const range = rangeParam === "7" ? 7 : 30;

  const thisWeek = startOfWeek(viewer.today);
  const from = addDays(thisWeek, -7 * 25); // 26 whole weeks (matches the heatmap)
  const [activity, challenges] = await Promise.all([
    loadUserActivity(viewer.id, viewer.tz, from),
    getChallenges(viewer),
  ]);

  if (activity.habits.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader title="Progress" description="How consistent you've been, day by day and week by week." />
        <EmptyState
          icon={ChartColumn}
          title="Your stats start with your first habit"
          description="Add habits and check them off. Charts, streaks and your calendar will fill in from there."
        />
      </div>
    );
  }

  const index = indexCheckIns(activity.checkIns);
  const days = dailyStats(activity.habits, index, from, viewer.today);
  const byDate = new Map(days.map((day) => [day.date, day.percent]));
  const best = bestStreak(days, viewer.today);
  const habitById = new Map(activity.habits.map((habit) => [habit.id, habit]));
  const totalDone = activity.checkIns.filter((checkIn) => {
    const habit = habitById.get(checkIn.habitId);
    return habit ? checkIn.value >= habit.target : false;
  }).length;
  const last30 = averagePercent(days.filter((day) => day.date > addDays(viewer.today, -30)));

  const dailyData = dayRange(addDays(viewer.today, -(range - 1)), viewer.today).map((date) => ({
    label: range === 7 ? formatDay(date, { weekday: "short" }) : formatDay(date, { month: "short", day: "numeric" }),
    full: formatDay(date, { weekday: "long", month: "short", day: "numeric" }),
    percent: byDate.get(date) ?? null,
  }));

  const weeklyData = Array.from({ length: 12 }, (_, i) => addDays(thisWeek, -7 * (11 - i))).map((weekStart) => ({
    label: formatDay(weekStart, { month: "short", day: "numeric" }),
    full: `Week of ${formatDay(weekStart, { month: "long", day: "numeric" })}`,
    score: weekScore(days, weekStart, viewer.today),
  }));

  const heatmapStart = addDays(thisWeek, -7 * 25);
  const heatmapDays = dayRange(heatmapStart, addDays(thisWeek, 6)).map((date) => ({
    date,
    percent: byDate.get(date) ?? null,
    future: date > viewer.today,
  }));

  const badges = achievements({
    totalDone,
    bestStreak: best,
    perfectWeeks: perfectWeeks(days, viewer.today),
    challengesFinished: countFinishedChallenges(challenges),
  });
  const earned = badges.filter((badge) => badge.earned).length;

  const summaries = activity.habits
    .filter((habit) => !habit.archivedDay)
    .map((habit) => habitSummary(habit, index, from, viewer.today));

  return (
    <div className="space-y-8">
      <PageHeader title="Progress" description="How consistent you've been, day by day and week by week." />

      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Flame} label="Current streak" value={plural(currentStreak(days, viewer.today), "day")} tone="warm" />
        <StatCard icon={Trophy} label="Best streak" value={plural(best, "day")} hint="Last 6 months" />
        <StatCard icon={Target} label="This week" value={formatPercent(weekScore(days, thisWeek, viewer.today))} hint={`Last 30 days: ${formatPercent(last30)}`} tone="primary" />
        <StatCard icon={CircleCheckBig} label="Habits completed" value={totalDone.toLocaleString("en-US")} hint="Last 6 months" />
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Daily completion</CardTitle>
            <CardDescription>Share of each day&apos;s habits you finished.</CardDescription>
          </div>
          <SegmentedLinks
            items={[
              { href: "/progress?range=7", label: "7 days", active: range === 7 },
              { href: "/progress", label: "30 days", active: range === 30 },
            ]}
          />
        </CardHeader>
        <CardContent>
          <DailyChart data={dailyData} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly score</CardTitle>
            <CardDescription>Your average for each of the last 12 weeks.</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyChart data={weeklyData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>
              {earned} of {badges.length} earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 sm:grid-cols-2">
              {badges.map((badge) => {
                const Icon = achievementIcons[badge.icon];
                return (
                  <li
                    key={badge.id}
                    className={cn("flex items-center gap-3 rounded-lg border p-3", !badge.earned && "border-dashed opacity-60")}
                  >
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-full",
                        badge.earned ? "bg-warm/20 text-warm" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {badge.earned ? <Icon className="size-4.5" /> : <Lock className="size-4" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{badge.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{badge.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Last 6 months</CardTitle>
          <CardDescription>Each square is a day. Darker means more of that day&apos;s habits were done.</CardDescription>
        </CardHeader>
        <CardContent>
          <Heatmap days={heatmapDays} />
        </CardContent>
      </Card>

      {summaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>By habit</CardTitle>
            <CardDescription>Streaks and completion rate for each active habit.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="hidden grid-cols-[minmax(0,1fr)_6rem_6rem_6rem] gap-4 border-b px-6 pb-2 text-xs font-medium text-muted-foreground sm:grid">
              <span>Habit</span>
              <span className="text-right">Last 30 days</span>
              <span className="text-right">Current</span>
              <span className="text-right">Best</span>
            </div>
            <ul className="divide-y">
              {summaries.map((summary) => (
                <li
                  key={summary.habit.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-3 sm:grid-cols-[minmax(0,1fr)_6rem_6rem_6rem]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-primary">
                      <HabitIcon name={summary.habit.icon} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{summary.habit.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{describeSchedule(summary.habit.days)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium tabular-nums">{formatPercent(summary.rate30)}</p>
                    <div className="mt-1 ml-auto h-1 w-16 overflow-hidden rounded-full bg-muted sm:w-full">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${summary.rate30 ?? 0}%` }} />
                    </div>
                  </div>
                  <p className="hidden text-right text-sm tabular-nums sm:block">{plural(summary.currentStreak, "day")}</p>
                  <p className="hidden text-right text-sm text-muted-foreground tabular-nums sm:block">
                    {plural(summary.bestStreak, "day")}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
