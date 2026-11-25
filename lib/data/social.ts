import "server-only";
import { prisma } from "@/lib/prisma";
import { addDays, dayIn, dayRange, fromDbDate, safeTimeZone, toDbDate, type DateStr } from "@/lib/dates";
import { currentStreak, dailyStats, indexCheckIns, weekScore } from "@/lib/stats";
import { toActivity, type ActivityData, type HabitRow, type Viewer } from "./core";

export type PersonRef = {
  id: string;
  name: string;
  username: string | null;
  timezone: string | null;
};

const personSelect = { id: true, name: true, username: true, timezone: true } as const;

export type ActivityItem = {
  id: string;
  person: PersonRef;
  /** null for private habits */
  habitName: string | null;
  icon: string;
  at: Date;
};

export type Friend = PersonRef & { friendshipId: string; activity: ActivityData };

/** How far back friends' check-ins are loaded (enough for this week, last week and streaks). */
export function friendsFrom(today: DateStr): DateStr {
  return addDays(today, -35);
}

type FriendshipRow = {
  id: string;
  status: "PENDING" | "ACCEPTED";
  requesterId: string;
  createdAt: Date;
  userId: string;
  name: string;
  username: string | null;
  timezone: string | null;
};
type FriendHabitRow = HabitRow & { userId: string };
type FriendCheckInRow = { userId: string; habitId: string; date: Date; value: number; updatedAt: Date };

/**
 * Friends (with their habits and check-ins since `from`), pending requests and the friends'
 * activity feed. Three small queries that run in parallel: the friend list is resolved inside
 * the database, so nothing waits on anything else.
 */
export async function getSocial(viewer: Viewer, from: DateStr) {
  const me = viewer.id;
  const [links, habits, checkIns] = await Promise.all([
    prisma.$queryRaw<FriendshipRow[]>`
      select f.id, f.status, f."requesterId", f."createdAt",
             u.id as "userId", u.name, u.username, u.timezone
      from friendship f
      join "user" u on u.id = case when f."requesterId" = ${me} then f."addresseeId" else f."requesterId" end
      where ${me} in (f."requesterId", f."addresseeId")
      order by f."createdAt" desc`,
    prisma.$queryRaw<FriendHabitRow[]>`
      select id, "userId", name, icon, days, target, unit, "isPrivate", "createdAt", "archivedAt"
      from habit
      where "userId" in (
        select case when "requesterId" = ${me} then "addresseeId" else "requesterId" end
        from friendship where status = 'ACCEPTED' and ${me} in ("requesterId", "addresseeId"))
      order by "sortOrder", "createdAt"`,
    prisma.$queryRaw<FriendCheckInRow[]>`
      select "userId", "habitId", date, value, "updatedAt"
      from check_in
      where date >= ${toDbDate(from)} and "userId" in (
        select case when "requesterId" = ${me} then "addresseeId" else "requesterId" end
        from friendship where status = 'ACCEPTED' and ${me} in ("requesterId", "addresseeId"))`,
  ]);

  const habitsByUser = new Map<string, FriendHabitRow[]>();
  for (const habit of habits) habitsByUser.set(habit.userId, [...(habitsByUser.get(habit.userId) ?? []), habit]);
  const checkInsByUser = new Map<string, FriendCheckInRow[]>();
  for (const row of checkIns) checkInsByUser.set(row.userId, [...(checkInsByUser.get(row.userId) ?? []), row]);

  const friends: Friend[] = [];
  const incoming: { id: string; person: PersonRef; createdAt: Date }[] = [];
  const outgoing: { id: string; person: PersonRef; createdAt: Date }[] = [];

  for (const link of links) {
    const person: PersonRef = { id: link.userId, name: link.name, username: link.username, timezone: link.timezone };
    if (link.status === "ACCEPTED") {
      friends.push({
        ...person,
        friendshipId: link.id,
        activity: toActivity(
          habitsByUser.get(person.id) ?? [],
          checkInsByUser.get(person.id) ?? [],
          safeTimeZone(person.timezone),
        ),
      });
    } else if (link.requesterId === me) {
      outgoing.push({ id: link.id, person, createdAt: link.createdAt });
    } else {
      incoming.push({ id: link.id, person, createdAt: link.createdAt });
    }
  }
  friends.sort((a, b) => a.name.localeCompare(b.name));

  return { friends, incoming, outgoing, feed: buildFeed(friends, habits, checkIns, viewer.today) };
}

/** Friends' recently completed habits (private habit names hidden), newest first. */
function buildFeed(
  friends: Friend[],
  habits: FriendHabitRow[],
  checkIns: FriendCheckInRow[],
  today: DateStr,
  limit = 8,
): ActivityItem[] {
  const people = new Map(friends.map((friend) => [friend.id, friend]));
  const habitById = new Map(habits.map((habit) => [habit.id, habit]));
  const since = Date.now() - 3 * 86_400_000;
  const sinceDay = addDays(today, -2);

  return checkIns
    .flatMap((row) => {
      const habit = habitById.get(row.habitId);
      const friend = people.get(row.userId);
      const day = fromDbDate(row.date);
      if (!habit || !friend || row.value < habit.target || row.updatedAt.getTime() < since || day < sinceDay) return [];
      return [
        {
          id: `${row.habitId}-${day}`,
          person: { id: friend.id, name: friend.name, username: friend.username, timezone: friend.timezone },
          habitName: habit.isPrivate ? null : habit.name,
          icon: habit.isPrivate ? "circle-check" : habit.icon,
          at: row.updatedAt,
        },
      ];
    })
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, limit);
}

export type PersonWeek = {
  person: PersonRef & { isYou: boolean };
  score: number | null;
  previousScore: number | null;
  streak: number;
  /** One entry per day of the week (null = nothing scheduled or still in the future) */
  daily: { date: DateStr; percent: number | null }[];
};

/** One person's week (score, previous week, streak, daily %) from loaded activity. */
export function personWeek(
  person: PersonRef & { isYou: boolean },
  activity: ActivityData,
  from: DateStr,
  weekStart: DateStr,
): PersonWeek {
  const today = dayIn(safeTimeZone(person.timezone));
  const days = dailyStats(activity.habits, indexCheckIns(activity.checkIns), from, today);
  const byDate = new Map(days.map((day) => [day.date, day.percent]));
  return {
    person,
    score: weekScore(days, weekStart, today),
    previousScore: weekScore(days, addDays(weekStart, -7), today),
    streak: currentStreak(days, today),
    daily: dayRange(weekStart, addDays(weekStart, 6)).map((date) => ({ date, percent: byDate.get(date) ?? null })),
  };
}

/**
 * Weekly standings for the viewer and their friends (pure: uses already-loaded activity).
 * Each person is scored in their own timezone.
 */
export function buildStandings(
  viewer: Viewer,
  ownActivity: ActivityData,
  ownFrom: DateStr,
  friends: Friend[],
  friendsFromDay: DateStr,
  weekStart: DateStr,
): PersonWeek[] {
  const standings = [
    personWeek(
      { id: viewer.id, name: viewer.name, username: viewer.username, timezone: viewer.tz, isYou: true },
      ownActivity,
      ownFrom,
      weekStart,
    ),
    ...friends.map((friend) => personWeek({ ...friend, isYou: false }, friend.activity, friendsFromDay, weekStart)),
  ];
  return standings.sort(
    (a, b) => (b.score ?? -1) - (a.score ?? -1) || b.streak - a.streak || a.person.name.localeCompare(b.person.name),
  );
}

/** Accepted friends only (lightweight, e.g. for invite lists). One query. */
export async function getFriendList(userId: string): Promise<PersonRef[]> {
  return prisma.$queryRaw<PersonRef[]>`
    select u.id, u.name, u.username, u.timezone
    from friendship f
    join "user" u on u.id = case when f."requesterId" = ${userId} then f."addresseeId" else f."requesterId" end
    where f.status = 'ACCEPTED' and ${userId} in (f."requesterId", f."addresseeId")
    order by u.name`;
}

export async function getFriendIds(userId: string): Promise<string[]> {
  const rows = await prisma.friendship.findMany({
    where: { status: "ACCEPTED", OR: [{ requesterId: userId }, { addresseeId: userId }] },
    select: { requesterId: true, addresseeId: true },
  });
  return rows.map((row) => (row.requesterId === userId ? row.addresseeId : row.requesterId));
}

/**
 * Someone's profile by username, with their activity since `from` and whether they're the
 * viewer's friend. Three queries in parallel (looked up by username inside the database).
 */
export async function getProfile(viewer: Viewer, username: string, from: DateStr) {
  const [people, habits, checkIns] = await Promise.all([
    prisma.$queryRaw<(PersonRef & { friendshipId: string | null })[]>`
      select u.id, u.name, u.username, u.timezone,
        (select f.id from friendship f
          where f.status = 'ACCEPTED'
            and ((f."requesterId" = u.id and f."addresseeId" = ${viewer.id})
              or (f."addresseeId" = u.id and f."requesterId" = ${viewer.id}))
          limit 1) as "friendshipId"
      from "user" u where u.username = ${username}`,
    prisma.$queryRaw<HabitRow[]>`
      select id, name, icon, days, target, unit, "isPrivate", "createdAt", "archivedAt"
      from habit where "userId" = (select id from "user" where username = ${username})
      order by "sortOrder", "createdAt"`,
    prisma.$queryRaw<{ habitId: string; date: Date; value: number }[]>`
      select "habitId", date, value from check_in
      where "userId" = (select id from "user" where username = ${username}) and date >= ${toDbDate(from)}`,
  ]);
  const row = people[0];
  if (!row) return null;
  const isFriend = Boolean(row.friendshipId);
  return {
    person: { id: row.id, name: row.name, username: row.username, timezone: row.timezone } satisfies PersonRef,
    isFriend,
    // Only share activity with friends.
    activity: isFriend ? toActivity(habits, checkIns, safeTimeZone(row.timezone)) : { habits: [], checkIns: [] },
  };
}

/** Users matching a search, with how they relate to the viewer (one query). */
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
    select: { id: true, status: true, requesterId: true, addresseeId: true },
  });

  return people.map((person) => {
    const link = links.find((row) => row.requesterId === person.id || row.addresseeId === person.id);
    let relation: "none" | "friends" | "sent" | "received" = "none";
    if (link?.status === "ACCEPTED") relation = "friends";
    else if (link) relation = link.requesterId === viewerId ? "sent" : "received";
    return { ...person, relation, friendshipId: link?.id ?? null };
  });
}
