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

type ChallengeRow = {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  startDate: Date;
  endDate: Date;
  creatorId: string;
  creatorName: string;
};
type ParticipantRow = PersonRef & { challengeId: string; status: "INVITED" | "JOINED" };
type ChallengeCheckInRow = { challengeId: string; userId: string; date: Date };

/**
 * Challenges the viewer is in (optionally just one), loaded with three small queries in
 * parallel: challenges, participants and check-ins.
 */
async function loadChallenges(viewer: Viewer, onlyId?: string): Promise<ChallengeView[]> {
  const me = viewer.id;
  const id = onlyId ?? null;
  const [challenges, participants, checkIns] = await Promise.all([
    prisma.$queryRaw<ChallengeRow[]>`
      select c.id, c.title, c.description, c.icon, c."startDate", c."endDate", c."creatorId", u.name as "creatorName"
      from challenge c join "user" u on u.id = c."creatorId"
      where c.id in (select "challengeId" from challenge_participant where "userId" = ${me})
        and (${id}::text is null or c.id = ${id})
      order by c."startDate" desc`,
    prisma.$queryRaw<ParticipantRow[]>`
      select p."challengeId", p.status, u.id, u.name, u.username, u.timezone
      from challenge_participant p join "user" u on u.id = p."userId"
      where p."challengeId" in (select "challengeId" from challenge_participant where "userId" = ${me})
        and (${id}::text is null or p."challengeId" = ${id})
      order by p."createdAt"`,
    prisma.$queryRaw<ChallengeCheckInRow[]>`
      select "challengeId", "userId", date from challenge_check_in
      where "challengeId" in (select "challengeId" from challenge_participant where "userId" = ${me})
        and (${id}::text is null or "challengeId" = ${id})`,
  ]);

  return challenges.map((row) =>
    toView(
      row,
      participants.filter((participant) => participant.challengeId === row.id),
      checkIns.filter((checkIn) => checkIn.challengeId === row.id),
      viewer,
    ),
  );
}

function toView(
  row: ChallengeRow,
  participantRows: ParticipantRow[],
  checkInRows: ChallengeCheckInRow[],
  viewer: Viewer,
): ChallengeView {
  const startDate = fromDbDate(row.startDate);
  const endDate = fromDbDate(row.endDate);
  const today = viewer.today;
  const status: ChallengeStatus = today < startDate ? "upcoming" : today > endDate ? "finished" : "active";
  const totalDays = daysBetween(startDate, endDate) + 1;
  const elapsedDays =
    status === "upcoming" ? 0 : status === "finished" ? totalDays : daysBetween(startDate, today) + 1;

  const daysByUser = new Map<string, Set<DateStr>>();
  for (const checkIn of checkInRows) {
    const set = daysByUser.get(checkIn.userId) ?? new Set<DateStr>();
    set.add(fromDbDate(checkIn.date));
    daysByUser.set(checkIn.userId, set);
  }

  const participants: ChallengeParticipantView[] = participantRows
    .map((participant) => {
      const days = daysByUser.get(participant.id) ?? new Set<DateStr>();
      return {
        person: { id: participant.id, name: participant.name, username: participant.username, timezone: participant.timezone },
        status: participant.status,
        isYou: participant.id === viewer.id,
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
    creatorName: row.creatorName,
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
export function getChallenges(viewer: Viewer): Promise<ChallengeView[]> {
  return loadChallenges(viewer);
}

/** One challenge, only if the viewer is a participant or invited. */
export async function getChallenge(viewer: Viewer, id: string): Promise<ChallengeView | null> {
  const [challenge] = await loadChallenges(viewer, id);
  return challenge ?? null;
}

/** Finished challenges where the viewer checked in on at least 80% of the days. */
export function countFinishedChallenges(challenges: ChallengeView[]): number {
  return challenges.filter((challenge) => {
    if (challenge.status !== "finished" || challenge.myStatus !== "JOINED") return false;
    const mine = challenge.participants.find((participant) => participant.isYou);
    return (mine?.done ?? 0) >= Math.ceil(challenge.totalDays * 0.8);
  }).length;
}
