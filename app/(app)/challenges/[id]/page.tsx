import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, CalendarDays, Crown, Users } from "lucide-react";
import { InviteButtons, LeaveOrDeleteChallenge } from "@/components/app/challenge-actions";
import { ChallengeCheckButton } from "@/components/app/challenge-check-button";
import { PersonAvatar } from "@/components/app/person-avatar";
import { PageSkeleton } from "@/components/app/require-session";
import { StatCard } from "@/components/app/stat-card";
import { HabitIconTile } from "@/components/habit-icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getChallenge } from "@/lib/data/challenges";
import { getViewer } from "@/lib/data/core";
import { addDays, daysBetween, formatDay } from "@/lib/dates";
import { plural } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Challenge",
};

export default function ChallengePage(props: PageProps<"/challenges/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ChallengeContent params={props.params} />
    </Suspense>
  );
}

async function ChallengeContent({ params }: { params: PageProps<"/challenges/[id]">["params"] }) {
  const viewer = await getViewer();
  const { id } = await params;
  const challenge = await getChallenge(viewer, id);
  if (!challenge) notFound();

  const yesterday = addDays(viewer.today, -1);
  const joined = challenge.participants.filter((participant) => participant.status === "JOINED");
  const invited = challenge.participants.filter((participant) => participant.status === "INVITED");
  const me = challenge.participants.find((participant) => participant.isYou);
  const isCreator = challenge.creatorId === viewer.id;
  const canCheckIn = challenge.myStatus === "JOINED" && challenge.status === "active";
  const statusLabel = { upcoming: "Upcoming", active: "Active", finished: "Finished" }[challenge.status];

  return (
    <div className="space-y-8">
      <Link href="/challenges" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Challenges
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <HabitIconTile name={challenge.icon} className="size-12" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{challenge.title}</h1>
              <Badge variant="secondary">{statusLabel}</Badge>
            </div>
            <p className="mt-1 text-muted-foreground">
              {formatDay(challenge.startDate, { month: "long", day: "numeric" })} –{" "}
              {formatDay(challenge.endDate, { month: "long", day: "numeric" })} · created by{" "}
              {isCreator ? "you" : challenge.creatorName}
            </p>
            {challenge.description && <p className="mt-3 max-w-xl text-sm">{challenge.description}</p>}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          {challenge.myStatus === "INVITED" ? (
            <InviteButtons challengeId={challenge.id} />
          ) : (
            <LeaveOrDeleteChallenge challengeId={challenge.id} isCreator={isCreator} />
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={CalendarDays}
          label="Progress"
          value={challenge.status === "upcoming" ? "Not started" : `Day ${challenge.elapsedDays} of ${challenge.totalDays}`}
          hint={
            challenge.status === "upcoming"
              ? `Starts in ${plural(daysBetween(viewer.today, challenge.startDate), "day")}`
              : challenge.status === "active"
                ? `${plural(challenge.totalDays - challenge.elapsedDays, "day")} left`
                : "Finished"
          }
          tone="primary"
        />
        <StatCard
          icon={Crown}
          label="Your check-ins"
          value={`${me?.done ?? 0} / ${challenge.elapsedDays || challenge.totalDays}`}
          hint={me?.status === "JOINED" ? "Days checked in so far" : "Join to start checking in"}
          tone="warm"
        />
        <StatCard icon={Users} label="People" value={joined.length} hint={invited.length ? `${invited.length} invited` : "All joined"} />
      </div>

      {canCheckIn && (
        <Card>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{challenge.doneToday ? "You're done for today" : "Did you stick to it today?"}</p>
              <p className="text-sm text-muted-foreground">Check in once a day. Forgot yesterday? You can still log it.</p>
            </div>
            <div className="flex gap-2">
              {yesterday >= challenge.startDate && (
                <ChallengeCheckButton challengeId={challenge.id} day={yesterday} done={challenge.doneYesterday} label="Yesterday" size="lg" />
              )}
              <ChallengeCheckButton challengeId={challenge.id} day={viewer.today} done={challenge.doneToday} label="Check in today" size="lg" />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Standings</CardTitle>
          <CardDescription>Ranked by days checked in.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <ol className="divide-y">
            {joined.map((participant, position) => {
              const days = Math.max(challenge.elapsedDays, 1);
              const rate = Math.round((participant.done / days) * 100);
              return (
                <li key={participant.person.id} className={cn("flex items-center gap-3 px-6 py-3", participant.isYou && "bg-accent/60")}>
                  <span className="grid w-5 place-items-center text-sm font-semibold text-muted-foreground tabular-nums">
                    {position === 0 && participant.done > 0 ? <Crown className="size-4 text-warm" /> : position + 1}
                  </span>
                  <PersonAvatar name={participant.person.name} isYou={participant.isYou} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {participant.person.name}
                      {participant.isYou && " (you)"}
                    </p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", participant.isYou ? "bg-primary" : "bg-foreground/25")}
                        style={{ width: `${Math.min(rate, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-20 text-right text-sm tabular-nums">
                    <span className="font-semibold">{participant.done}</span>
                    <span className="text-muted-foreground"> / {challenge.elapsedDays || challenge.totalDays}</span>
                  </span>
                </li>
              );
            })}
            {invited.map((participant) => (
              <li key={participant.person.id} className="flex items-center gap-3 px-6 py-3 opacity-60">
                <span className="w-5" />
                <PersonAvatar name={participant.person.name} size="sm" />
                <p className="min-w-0 flex-1 truncate text-sm">{participant.person.name}</p>
                <Badge variant="outline">Invited</Badge>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Day by day</CardTitle>
          <CardDescription>Each square is a day of the challenge.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="no-scrollbar overflow-x-auto">
            <table className="border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="sr-only">Person</th>
                  {challenge.allDays.map((day, index) => (
                    <th key={day} className="w-4 text-[10px] font-normal text-muted-foreground" title={formatDay(day, { month: "short", day: "numeric" })}>
                      {index === 0 || (index + 1) % 7 === 0 ? index + 1 : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {joined.map((participant) => (
                  <tr key={participant.person.id}>
                    <th className="pr-3 text-left text-xs font-medium whitespace-nowrap">
                      {participant.isYou ? "You" : participant.person.name.split(" ")[0]}
                    </th>
                    {challenge.allDays.map((day) => {
                      const done = participant.days.has(day);
                      const future = day > viewer.today;
                      return (
                        <td key={day}>
                          <span
                            title={`${formatDay(day, { weekday: "short", month: "short", day: "numeric" })}: ${done ? "done" : future ? "upcoming" : "missed"}`}
                            className={cn(
                              "block size-4 rounded-[4px]",
                              done ? "bg-primary" : future ? "border border-dashed border-foreground/25" : "bg-muted",
                            )}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
