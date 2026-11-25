import "server-only";
import { prisma } from "@/lib/prisma";
import { addDays, dayIn, dayRange, safeTimeZone, type DateStr } from "@/lib/dates";
import { currentStreak, dailyStats, indexCheckIns, weekScore } from "@/lib/stats";
import { loadActivity, type Viewer } from "./core";

export type PersonRef = {
  id: string;
  name: string;
  username: string | null;
  timezone: string | null;
};

const personSelect = { id: true, name: true, username: true, timezone: true } as const;

/** Accepted friends plus pending requests in both directions. */
export async function getFriendships(userId: string) {
  const rows = await prisma.friendship.findMany({
    where: { OR: [{ requesterId: userId }, { addresseeId: userId }] },
    include: { requester: { select: personSelect }, addressee: { select: personSelect } },
    orderBy: { createdAt: "desc" },
  });

  const friends: (PersonRef & { friendshipId: string })[] = [];
  const incoming: { id: string; person: PersonRef; createdAt: Date }[] = [];
  const outgoing: { id: string; person: PersonRef; createdAt: Date }[] = [];

  for (const row of rows) {
    const other = row.requesterId === userId ? row.addressee : row.requester;
    if (row.status === "ACCEPTED") friends.push({ ...other, friendshipId: row.id });
    else if (row.addresseeId === userId) incoming.push({ id: row.id, person: other, createdAt: row.createdAt });
    else outgoing.push({ id: row.id, person: other, createdAt: row.createdAt });
  }

  friends.sort((a, b) => a.name.localeCompare(b.name));
  return { friends, incoming, outgoing };
}

export async function getFriendIds(userId: string): Promise<string[]> {
  const rows = await prisma.friendship.findMany({
    where: { status: "ACCEPTED", OR: [{ requesterId: userId }, { addresseeId: userId }] },
    select: { requesterId: true, addresseeId: true },
  });
  return rows.map((row) => (row.requesterId === userId ? row.addresseeId : row.requesterId));
}

export async function areFriends(a: string, b: string): Promise<boolean> {
  const row = await prisma.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: a, addresseeId: b },
        { requesterId: b, addresseeId: a },
      ],
    },
    select: { id: true },
  });
  return Boolean(row);
}

export type PersonWeek = {
  person: PersonRef & { isYou: boolean };
  score: number | null;
  previousScore: number | null;
  streak: number;
  /** One entry per day of the week (null = nothing scheduled or still in the future) */
  daily: { date: DateStr; percent: number | null }[];
};

/**
 * Weekly standings for the viewer and their friends. Each person is scored in their own
 * timezone ("today" differs per person), for the week starting `weekStart`.
 */
export async function getStandings(viewer: Viewer, weekStart: DateStr, extraIds: string[] = []) {
  const friendIds = await getFriendIds(viewer.id);
  const ids = [...new Set([viewer.id, ...friendIds, ...extraIds])];
  const people = await prisma.user.findMany({ where: { id: { in: ids } }, select: personSelect });

  const timezones = new Map(people.map((person) => [person.id, safeTimeZone(person.timezone)]));
  const weekEnd = addDays(weekStart, 6);
  const from = addDays([weekStart, viewer.today].sort()[0], -90);
  const latest = addDays(viewer.today, 1); // covers people a timezone ahead
  const activity = await loadActivity(timezones, from, latest > weekEnd ? latest : weekEnd);

  const standings: PersonWeek[] = people.map((person) => {
    const tz = timezones.get(person.id) ?? "UTC";
    const today = dayIn(tz);
    const data = activity.get(person.id) ?? { habits: [], checkIns: [] };
    const days = dailyStats(data.habits, indexCheckIns(data.checkIns), from, today);
    const byDate = new Map(days.map((day) => [day.date, day.percent]));
    return {
      person: { ...person, isYou: person.id === viewer.id },
      score: weekScore(days, weekStart, today),
      previousScore: weekScore(days, addDays(weekStart, -7), today),
      streak: currentStreak(days, today),
      daily: dayRange(weekStart, weekEnd).map((date) => ({ date, percent: byDate.get(date) ?? null })),
    };
  });

  standings.sort(
    (a, b) => (b.score ?? -1) - (a.score ?? -1) || b.streak - a.streak || a.person.name.localeCompare(b.person.name),
  );
  return standings;
}

export type ActivityItem = {
  id: string;
  person: PersonRef;
  /** null for private habits */
  habitName: string | null;
  icon: string;
  at: Date;
};

/** Friends' recent completed habits (private habit names hidden). */
export async function getFriendActivity(friendIds: string[], limit = 10): Promise<ActivityItem[]> {
  if (friendIds.length === 0) return [];
  const since = new Date(Date.now() - 3 * 86_400_000);
  const rows = await prisma.checkIn.findMany({
    where: { userId: { in: friendIds }, updatedAt: { gte: since } },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      habit: { select: { name: true, icon: true, isPrivate: true, target: true } },
      user: { select: personSelect },
    },
  });
  return rows
    .filter((row) => row.value >= row.habit.target)
    .slice(0, limit)
    .map((row) => ({
      id: row.id,
      person: row.user,
      habitName: row.habit.isPrivate ? null : row.habit.name,
      icon: row.habit.isPrivate ? "circle-check" : row.habit.icon,
      at: row.updatedAt,
    }));
}

/** Users matching a search, with how they relate to the viewer. */
export async function searchPeople(viewerId: string, query: string) {
  const term = query.trim().replace(/^@/, "");
  if (term.length < 2) return [];
  const people = await prisma.user.findMany({
    where: {
      id: { not: viewerId },
      OR: [
        { username: { contains: term, mode: "insensitive" } },
        { name: { contains: term, mode: "insensitive" } },
      ],
    },
    select: personSelect,
    take: 10,
    orderBy: { name: "asc" },
  });
  if (people.length === 0) return [];

  const links = await prisma.friendship.findMany({
    where: {
      OR: [
        { requesterId: viewerId, addresseeId: { in: people.map((person) => person.id) } },
        { addresseeId: viewerId, requesterId: { in: people.map((person) => person.id) } },
      ],
    },
  });

  return people.map((person) => {
    const link = links.find((row) => row.requesterId === person.id || row.addresseeId === person.id);
    let relation: "none" | "friends" | "sent" | "received" = "none";
    if (link?.status === "ACCEPTED") relation = "friends";
    else if (link) relation = link.requesterId === viewerId ? "sent" : "received";
    return { ...person, relation, friendshipId: link?.id ?? null };
  });
}
