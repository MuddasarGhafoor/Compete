import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Flame, Lock, Swords, Target, Trophy } from "lucide-react";
import { AddFriendButton } from "@/components/app/friend-actions";
import { PersonAvatar } from "@/components/app/person-avatar";
import { PageSkeleton } from "@/components/app/require-session";
import { StatCard } from "@/components/app/stat-card";
import { WeekStrip } from "@/components/app/week-strip";
import { ComparisonChart } from "@/components/charts/comparison-chart";
import { HabitIcon } from "@/components/habit-icon";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getViewer, loadUserActivity } from "@/lib/data/core";
import { areFriends, getStandings } from "@/lib/data/social";
import { addDays, dayIn, dayRange, describeSchedule, formatDay, safeTimeZone, startOfWeek } from "@/lib/dates";
import { formatPercent, plural } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { dailyStats, indexCheckIns, isScheduledOn, valueOn } from "@/lib/stats";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Friend",
};

export default function FriendProfilePage(props: PageProps<"/friends/[username]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <FriendProfile params={props.params} />
    </Suspense>
  );
}

async function FriendProfile({ params }: { params: PageProps<"/friends/[username]">["params"] }) {
  const viewer = await getViewer();
  const { username } = await params;
  const person = await prisma.user.findUnique({
    where: { username: decodeURIComponent(username).toLowerCase() },
    select: { id: true, name: true, username: true, timezone: true },
  });
  if (!person) notFound();
  if (person.id === viewer.id) redirect("/progress");

  const back = (
    <Link href="/friends" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" />
      Friends
    </Link>
  );

  if (!(await areFriends(viewer.id, person.id))) {
    return (
      <div className="space-y-6">
        {back}
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <PersonAvatar name={person.name} size="lg" />
            <h1 className="mt-4 text-xl font-semibold">{person.name}</h1>
            <p className="text-sm text-muted-foreground">@{person.username}</p>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              You&apos;re not friends yet. Once they accept your request, you&apos;ll see each other&apos;s progress here.
            </p>
            <div className="mt-6">
              <AddFriendButton userId={person.id} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const theirTz = safeTimeZone(person.timezone);
  const theirToday = dayIn(theirTz);
  const weekStart = startOfWeek(viewer.today);
  const from = addDays(theirToday, -30);
  const [standings, activity] = await Promise.all([
    getStandings(viewer, weekStart, [person.id]),
    loadUserActivity(person.id, theirTz, from, theirToday),
  ]);
  const me = standings.find((entry) => entry.person.isYou);
  const them = standings.find((entry) => entry.person.id === person.id);

  const index = indexCheckIns(activity.checkIns);
  const days = dailyStats(activity.habits, index, from, theirToday);
  const byDate = new Map(days.map((day) => [day.date, day.percent]));
  const todayHabits = activity.habits.filter((habit) => isScheduledOn(habit, theirToday));
  const activeHabits = activity.habits.filter((habit) => !habit.archivedDay);

  const weekDays = dayRange(weekStart, addDays(weekStart, 6)).map((date) => ({
    date,
    percent: byDate.get(date) ?? null,
    isToday: date === theirToday,
    isFuture: date > theirToday,
  }));

  const chartData = dayRange(weekStart, addDays(weekStart, 6)).map((date, position) => ({
    label: formatDay(date, { weekday: "short" }),
    full: formatDay(date, { weekday: "long", month: "short", day: "numeric" }),
    you: me?.daily[position]?.percent ?? null,
    them: them?.daily[position]?.percent ?? null,
  }));

  const leader =
    (me?.score ?? -1) === (them?.score ?? -1)
      ? "You're tied this week."
      : (me?.score ?? -1) > (them?.score ?? -1)
        ? "You're ahead this week."
        : `${person.name.split(" ")[0]} is ahead this week.`;

  return (
    <div className="space-y-8">
      {back}

      <div className="flex items-center gap-4">
        <PersonAvatar name={person.name} size="lg" />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">{person.name}</h1>
          <p className="text-muted-foreground">@{person.username}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Target} label="Today" value={formatPercent(byDate.get(theirToday) ?? null)} tone="primary" />
        <StatCard icon={Flame} label="Current streak" value={plural(them?.streak ?? 0, "day")} tone="warm" />
        <StatCard icon={Trophy} label="This week" value={formatPercent(them?.score)} hint={`You: ${formatPercent(me?.score)}`} />
      </div>

      <WeekStrip days={weekDays} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Swords className="size-4 text-primary" />
              Head to head
            </CardTitle>
            <CardDescription>{leader}</CardDescription>
          </CardHeader>
          <CardContent>
            <ComparisonChart
              series={[
                { key: "you", label: "You", isYou: true },
                { key: "them", label: person.name.split(" ")[0], isYou: false },
              ]}
              data={chartData}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Their habits</CardTitle>
            <CardDescription>{plural(activeHabits.length, "active habit")}. Private ones stay hidden.</CardDescription>
          </CardHeader>
          <CardContent>
            {activeHabits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No habits yet.</p>
            ) : (
              <ul className="space-y-3">
                {activeHabits.map((habit) => {
                  const scheduledToday = todayHabits.some((item) => item.id === habit.id);
                  const done = scheduledToday && valueOn(index, habit.id, theirToday) >= habit.target;
                  return (
                    <li key={habit.id} className="flex items-center gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-primary">
                        {habit.isPrivate ? <Lock className="size-4 text-muted-foreground" /> : <HabitIcon name={habit.icon} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={cn("truncate text-sm font-medium", habit.isPrivate && "text-muted-foreground")}>
                          {habit.isPrivate ? "Private habit" : habit.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{describeSchedule(habit.days)}</p>
                      </div>
                      {scheduledToday && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            done ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                          )}
                        >
                          {done ? "Done today" : "Not yet"}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
