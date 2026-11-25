import "server-only";
import { prisma } from "@/lib/prisma";
import { addDays, daysBetween, dayRange, fromDbDate, type DateStr } from "@/lib/dates";
import type { Viewer } from "./core";
import type { PersonRef } from "./social";

export type ChallengeStatus = "upcoming" | "active" | "finished";

export type ChallengeParticipantView = {
  person: PersonRef;
  status: "INVITED" | "JOINED";
  isYou: boolean;
  /** Days checked in */
  done: number;
  days: Set<DateStr>;
};

export type ChallengeView = {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  startDate: DateStr;
  endDate: DateStr;
  creatorId: string;
  creatorName: string;
  status: ChallengeStatus;
  totalDays: number;
  /** Days that have started so far (0 if upcoming) */
  elapsedDays: number;
  myStatus: "INVITED" | "JOINED" | null;
  doneToday: boolean;
  doneYesterday: boolean;
  participants: ChallengeParticipantView[];
  allDays: DateStr[];
};

const include = {
  creator: { select: { name: true } },
  participants: {
    include: { user: { select: { id: true, name: true, username: true, timezone: true } } },
    orderBy: { createdAt: "asc" as const },
  },
  checkIns: { select: { userId: true, date: true } },
};

type ChallengeRow = Awaited<ReturnType<typeof prisma.challenge.findFirst<{ include: typeof include }>>>;

function toView(row: NonNullable<ChallengeRow>, viewer: Viewer): ChallengeView {
  const startDate = fromDbDate(row.startDate);
  const endDate = fromDbDate(row.endDate);
  const today = viewer.today;
  const status: ChallengeStatus = today < startDate ? "upcoming" : today > endDate ? "finished" : "active";
  const totalDays = daysBetween(startDate, endDate) + 1;
  const elapsedDays =
    status === "upcoming" ? 0 : status === "finished" ? totalDays : daysBetween(startDate, today) + 1;

  const daysByUser = new Map<string, Set<DateStr>>();
  for (const checkIn of row.checkIns) {
    const set = daysByUser.get(checkIn.userId) ?? new Set<DateStr>();
    set.add(fromDbDate(checkIn.date));
    daysByUser.set(checkIn.userId, set);
  }

  const participants: ChallengeParticipantView[] = row.participants
    .map((participant) => {
      const days = daysByUser.get(participant.userId) ?? new Set<DateStr>();
      return {
        person: participant.user,
        status: participant.status,
        isYou: participant.userId === viewer.id,
        done: days.size,
        days,
      };
    })
    .sort((a, b) => (a.status === b.status ? b.done - a.done : a.status === "JOINED" ? -1 : 1));

  const mine = participants.find((participant) => participant.isYou);
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    icon: row.icon,
    startDate,
    endDate,
    creatorId: row.creatorId,
    creatorName: row.creator.name,
    status,
    totalDays,
    elapsedDays,
    myStatus: mine?.status ?? null,
    doneToday: mine?.days.has(today) ?? false,
    doneYesterday: mine?.days.has(addDays(today, -1)) ?? false,
    participants,
    allDays: dayRange(startDate, endDate),
  };
}

/** Every challenge the viewer is in or invited to. */
export async function getChallenges(viewer: Viewer): Promise<ChallengeView[]> {
  const rows = await prisma.challenge.findMany({
    where: { participants: { some: { userId: viewer.id } } },
    include,
    orderBy: { startDate: "desc" },
  });
  return rows.map((row) => toView(row, viewer));
}

/** One challenge, only if the viewer is a participant or invited. */
export async function getChallenge(viewer: Viewer, id: string): Promise<ChallengeView | null> {
  const row = await prisma.challenge.findFirst({
    where: { id, participants: { some: { userId: viewer.id } } },
    include,
  });
  return row ? toView(row, viewer) : null;
}

/** Finished challenges where the viewer checked in on at least 80% of the days. */
export function countFinishedChallenges(challenges: ChallengeView[]): number {
  return challenges.filter((challenge) => {
    if (challenge.status !== "finished" || challenge.myStatus !== "JOINED") return false;
    const mine = challenge.participants.find((participant) => participant.isYou);
    return (mine?.done ?? 0) >= Math.ceil(challenge.totalDays * 0.8);
  }).length;
}
