import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus, Swords } from "lucide-react";
import { InviteButtons } from "@/components/app/challenge-actions";
import { ChallengeCheckButton } from "@/components/app/challenge-check-button";
import { ChallengeDialog } from "@/components/app/challenge-dialog";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { PersonAvatar } from "@/components/app/person-avatar";
import { PageSkeleton } from "@/components/app/require-session";
import { SegmentedLinks } from "@/components/app/segmented-links";
import { HabitIconTile } from "@/components/habit-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getChallenges, type ChallengeStatus, type ChallengeView } from "@/lib/data/challenges";
import { getViewer } from "@/lib/data/core";
import { getFriendships } from "@/lib/data/social";
import { daysBetween, formatDay } from "@/lib/dates";
import { plural } from "@/lib/format";

export const metadata: Metadata = {
  title: "Challenges",
};

const tabs: { status: ChallengeStatus; label: string }[] = [
  { status: "active", label: "Active" },
  { status: "upcoming", label: "Upcoming" },
  { status: "finished", label: "Finished" },
];

export default function ChallengesPage(props: PageProps<"/challenges">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ChallengesContent searchParams={props.searchParams} />
    </Suspense>
  );
}

async function ChallengesContent({ searchParams }: { searchParams: PageProps<"/challenges">["searchParams"] }) {
  const viewer = await getViewer();
  const { status: statusParam } = await searchParams;
  const status = tabs.find((tab) => tab.status === statusParam)?.status ?? "active";

  const [challenges, { friends }] = await Promise.all([getChallenges(viewer), getFriendships(viewer.id)]);
  const invites = challenges.filter((challenge) => challenge.myStatus === "INVITED" && challenge.status !== "finished");
  const joined = challenges.filter((challenge) => challenge.myStatus === "JOINED");
  const visible = joined.filter((challenge) => challenge.status === status);

  const newButton = (
    <ChallengeDialog
      today={viewer.today}
      friends={friends}
      trigger={
        <Button size="lg" className="h-10 px-4">
          <Plus data-icon="inline-start" />
          New challenge
        </Button>
      }
    />
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Challenges"
        description="Everyone tracks the same thing for a set number of days. Check in once a day."
        actions={newButton}
      />

      {invites.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Invites</h2>
          {invites.map((challenge) => (
            <Card key={challenge.id} size="sm">
              <CardContent className="flex items-center gap-4">
                <HabitIconTile name={challenge.icon} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{challenge.title}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    From {challenge.creatorName} · {dateRange(challenge)}
                  </p>
                </div>
                <InviteButtons challengeId={challenge.id} />
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      <div className="space-y-4">
        <SegmentedLinks
          items={tabs.map((tab) => ({
            href: tab.status === "active" ? "/challenges" : `/challenges?status=${tab.status}`,
            label: `${tab.label} (${joined.filter((challenge) => challenge.status === tab.status).length})`,
            active: tab.status === status,
          }))}
        />

        {visible.length === 0 ? (
          <EmptyState
            icon={Swords}
            title={status === "active" ? "No active challenges" : status === "upcoming" ? "Nothing coming up" : "No finished challenges yet"}
            description="Start one, like no sugar for 14 days or a walk every day this month, and invite friends to join."
          >
            {status !== "finished" && newButton}
          </EmptyState>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visible.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} today={viewer.today} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function dateRange(challenge: ChallengeView) {
  const start = formatDay(challenge.startDate, { month: "short", day: "numeric" });
  const end = formatDay(challenge.endDate, { month: "short", day: "numeric" });
  return `${start} – ${end}`;
}

function ChallengeCard({ challenge, today }: { challenge: ChallengeView; today: string }) {
  const me = challenge.participants.find((participant) => participant.isYou);
  const joinedCount = challenge.participants.filter((participant) => participant.status === "JOINED").length;
  const progress = Math.round((challenge.elapsedDays / challenge.totalDays) * 100);
  const leader = challenge.participants.find((participant) => participant.status === "JOINED");

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <HabitIconTile name={challenge.icon} />
          <div className="min-w-0 flex-1">
            <Link href={`/challenges/${challenge.id}`} className="font-medium hover:underline">
              {challenge.title}
            </Link>
            <p className="text-sm text-muted-foreground">{dateRange(challenge)}</p>
          </div>
          {challenge.status === "upcoming" && (
            <Badge variant="secondary">Starts in {plural(daysBetween(today, challenge.startDate), "day")}</Badge>
          )}
          {challenge.status === "finished" && leader && (
            <Badge variant="secondary">{leader.isYou ? "You won" : `${leader.person.name.split(" ")[0]} won`}</Badge>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {challenge.status === "upcoming" ? "Not started" : `Day ${challenge.elapsedDays} of ${challenge.totalDays}`}
            </span>
            <span className="tabular-nums">
              You: {me?.done ?? 0} of {challenge.elapsedDays || challenge.totalDays} days
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {challenge.participants.slice(0, 4).map((participant) => (
                <PersonAvatar
                  key={participant.person.id}
                  name={participant.person.name}
                  isYou={participant.isYou}
                  size="sm"
                  className="ring-2 ring-card"
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{plural(joinedCount, "person", "people")}</span>
          </div>
          {challenge.status === "active" && (
            <ChallengeCheckButton challengeId={challenge.id} day={today} done={challenge.doneToday} label="Check in today" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
