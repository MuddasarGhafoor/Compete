import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, CalendarOff, Crown, Flame, ListPlus, Plus, Target, Trophy, Users } from "lucide-react";
import { ChallengeCheckButton } from "@/components/app/challenge-check-button";
import { EmptyState } from "@/components/app/empty-state";
import { HabitChecklist } from "@/components/app/habit-checklist";
import { HabitFormDialog } from "@/components/app/habit-form-dialog";
import { PageHeader } from "@/components/app/page-header";
import { PersonAvatar } from "@/components/app/person-avatar";
import { SegmentedLinks } from "@/components/app/segmented-links";
import { StatCard } from "@/components/app/stat-card";
import { WeekStrip } from "@/components/app/week-strip";
import { HabitIcon } from "@/components/habit-icon";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getChallenges } from "@/lib/data/challenges";
import { getViewer, loadUserActivity } from "@/lib/data/core";
import { getFriendActivity, getFriendIds, getStandings } from "@/lib/data/social";
import { addDays, dayRange, formatDay, startOfWeek, timeAgo } from "@/lib/dates";
import { formatPercent, ordinal, plural } from "@/lib/format";
import { currentStreak, dailyStats, indexCheckIns, isScheduledOn, valueOn, weekScore } from "@/lib/stats";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Today",
};

export default function TodayPage(props: PageProps<"/today">) {
  return (
    // Reads the session, so it streams in behind a Suspense boundary.
    <Suspense fallback={<TodaySkeleton />}>
      <TodayContent searchParams={props.searchParams} />
    </Suspense>
  );
}

async function TodayContent({ searchParams }: { searchParams: PageProps<"/today">["searchParams"] }) {
  const viewer = await getViewer();
  const { day: dayParam } = await searchParams;
  const yesterday = addDays(viewer.today, -1);
  const isYesterday = dayParam === "yesterday";
  const day = isYesterday ? yesterday : viewer.today;

  const weekStart = startOfWeek(viewer.today);
  const from = addDays(viewer.today, -120);
  const [activity, standings, friendIds, challenges] = await Promise.all([
    loadUserActivity(viewer.id, viewer.tz, from, viewer.today),
    getStandings(viewer, weekStart),
    getFriendIds(viewer.id),
    getChallenges(viewer),
  ]);
  const feed = await getFriendActivity(friendIds, 6);

  const index = indexCheckIns(activity.checkIns);
  const days = dailyStats(activity.habits, index, from, viewer.today);
  const byDate = new Map(days.map((stat) => [stat.date, stat]));
  const selected = byDate.get(day);
  const streak = currentStreak(days, viewer.today);
  const score = weekScore(days, weekStart, viewer.today);
  const rank = standings.findIndex((entry) => entry.person.isYou) + 1;

  const activeHabits = activity.habits.filter((habit) => !habit.archivedDay);
  const scheduled = activity.habits.filter((habit) => isScheduledOn(habit, day));
  const unscheduledCount = activeHabits.length - scheduled.length;
  const items = scheduled.map((habit) => ({
    id: habit.id,
    name: habit.name,
    icon: habit.icon,
    target: habit.target,
    unit: habit.unit,
    isPrivate: habit.isPrivate,
    value: valueOn(index, habit.id, day),
  }));

  const weekDays = dayRange(weekStart, addDays(weekStart, 6)).map((date) => ({
    date,
    percent: byDate.get(date)?.percent ?? null,
    isToday: date === viewer.today,
    isFuture: date > viewer.today,
    isSelected: date === day,
    href: date === viewer.today ? "/today" : date === yesterday ? "/today?day=yesterday" : undefined,
  }));

  const activeChallenges = challenges.filter((challenge) => challenge.status === "active" && challenge.myStatus === "JOINED");
  const invites = challenges.filter((challenge) => challenge.myStatus === "INVITED");
  const firstName = viewer.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <PageHeader
        title={isYesterday ? "Yesterday" : `Hi, ${firstName}`}
        description={formatDay(day, { weekday: "long", month: "long", day: "numeric" })}
        actions={
          <SegmentedLinks
            items={[
              { href: "/today", label: "Today", active: !isYesterday },
              { href: "/today?day=yesterday", label: "Yesterday", active: isYesterday },
            ]}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Target}
          label={isYesterday ? "Yesterday" : "Today"}
          value={formatPercent(selected?.percent ?? null)}
          hint={selected?.scheduled ? `${selected.done} of ${selected.scheduled} habits done` : "Nothing scheduled"}
          tone="primary"
        />
        <StatCard
          icon={Flame}
          label="Current streak"
          value={plural(streak, "day")}
          hint={streak > 0 ? "Days in a row at 100%" : "Finish a full day to start one"}
          tone="warm"
        />
        <StatCard
          icon={Trophy}
          label="This week"
          value={formatPercent(score)}
          hint={standings.length > 1 ? `${ordinal(rank)} of ${standings.length} friends` : "Add friends to compete"}
        />
      </div>

      <WeekStrip days={weekDays} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-3">
          {activeHabits.length === 0 ? (
            <EmptyState
              icon={ListPlus}
              title="Add your first habit"
              description="Start with three to five things you want to do more often. You can change them any time."
            >
              <HabitFormDialog
                trigger={
                  <Button size="lg" className="h-10 px-4">
                    <Plus data-icon="inline-start" />
                    Add habit
                  </Button>
                }
              />
            </EmptyState>
          ) : items.length === 0 ? (
            <EmptyState
              icon={CalendarOff}
              title={isYesterday ? "Nothing was scheduled yesterday" : "Nothing scheduled today"}
              description="Enjoy the day off. Days with nothing scheduled don't affect your streak or score."
            >
              <Link href="/habits" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Manage habits
              </Link>
            </EmptyState>
          ) : (
            <>
              <HabitChecklist key={day} items={items} day={day} />
              <div className="flex items-center justify-between gap-4 px-1 text-sm text-muted-foreground">
                <span>{unscheduledCount > 0 ? `${plural(unscheduledCount, "habit")} not scheduled for this day` : ""}</span>
                <HabitFormDialog
                  trigger={
                    <Button variant="ghost" size="sm">
                      <Plus data-icon="inline-start" />
                      Add habit
                    </Button>
                  }
                />
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          {/* Mini leaderboard */}
          <Card size="sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">This week</CardTitle>
              <Link href="/leaderboard" className="text-xs font-medium text-primary hover:underline">
                Leaderboard
              </Link>
            </CardHeader>
            <CardContent>
              {standings.length > 1 ? (
                <ol className="space-y-3">
                  {standings.slice(0, 5).map((entry, position) => (
                    <li key={entry.person.id} className="flex items-center gap-3 text-sm">
                      <span className="grid w-4 place-items-center text-xs text-muted-foreground tabular-nums">
                        {position === 0 ? <Crown className="size-3.5 text-warm" /> : position + 1}
                      </span>
                      <PersonAvatar name={entry.person.name} isYou={entry.person.isYou} size="sm" />
                      <span className={cn("min-w-0 flex-1 truncate", entry.person.isYou && "font-medium")}>
                        {entry.person.isYou ? "You" : entry.person.name}
                      </span>
                      <span className="text-xs font-medium tabular-nums">{formatPercent(entry.score)}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">Compete is more fun with friends. Add someone to see who wins the week.</p>
                  <Link href="/friends" className={buttonVariants({ variant: "outline", size: "sm" })}>
                    <Users data-icon="inline-start" />
                    Find friends
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Challenges */}
          {(activeChallenges.length > 0 || invites.length > 0) && (
            <Card size="sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Challenges</CardTitle>
                <Link href="/challenges" className="text-xs font-medium text-primary hover:underline">
                  View all
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {invites.length > 0 && (
                  <Link
                    href="/challenges"
                    className="flex items-center justify-between rounded-lg bg-accent px-3 py-2 text-sm text-accent-foreground"
                  >
                    {plural(invites.length, "new invite")}
                    <ArrowRight className="size-4" />
                  </Link>
                )}
                {activeChallenges.map((challenge) => {
                  const doneOnDay = isYesterday ? challenge.doneYesterday : challenge.doneToday;
                  const inRange = day >= challenge.startDate && day <= challenge.endDate;
                  return (
                    <div key={challenge.id} className="flex items-center gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-primary">
                        <HabitIcon name={challenge.icon} />
                      </span>
                      <Link href={`/challenges/${challenge.id}`} className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{challenge.title}</span>
                        <span className="text-xs text-muted-foreground">
                          Day {challenge.elapsedDays} of {challenge.totalDays}
                        </span>
                      </Link>
                      {inRange && <ChallengeCheckButton key={day} challengeId={challenge.id} day={day} done={doneOnDay} />}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Friends' activity */}
          {feed.length > 0 && (
            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-sm">Friends&apos; activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {feed.map((item) => (
                    <li key={item.id} className="flex items-start gap-3 text-sm">
                      <PersonAvatar name={item.person.name} size="sm" />
                      <p className="min-w-0 flex-1 text-muted-foreground">
                        <span className="font-medium text-foreground">{item.person.name.split(" ")[0]}</span> completed{" "}
                        {item.habitName ? (
                          <span className="text-foreground">{item.habitName}</span>
                        ) : (
                          "a private habit"
                        )}
                        <span className="block text-xs">{timeAgo(item.at)}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function TodaySkeleton() {
  return (
    <div className="animate-pulse space-y-8" aria-hidden>
      <div className="space-y-2">
        <div className="h-8 w-40 rounded-md bg-muted" />
        <div className="h-4 w-56 rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div key={key} className="h-28 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-28 rounded-xl bg-muted" />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="h-72 rounded-xl bg-muted" />
        <div className="h-72 rounded-xl bg-muted" />
      </div>
    </div>
  );
}
