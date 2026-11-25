import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { requireUser, type CurrentUser } from "@/lib/session";
import { dayIn, fromDbDate, safeTimeZone, toDbDate, type DateStr } from "@/lib/dates";
import type { CheckInLite, HabitLite } from "@/lib/stats";

/** The signed-in user plus their timezone and today's date in it. */
export type Viewer = CurrentUser & { tz: string; today: DateStr };

/**
 * Use at the top of every app page / Server Action. Redirects signed-out visitors.
 * With Cache Components, call it inside a <Suspense> boundary.
 */
export const getViewer = cache(async (): Promise<Viewer> => {
  const user = await requireUser();
  const tz = safeTimeZone(user.timezone);
  return { ...user, tz, today: dayIn(tz) };
});

type HabitRow = {
  id: string;
  name: string;
  icon: string;
  days: number[];
  target: number;
  unit: string | null;
  isPrivate: boolean;
  createdAt: Date;
  archivedAt: Date | null;
};

export function toHabitLite(row: HabitRow, tz: string): HabitLite {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    days: row.days,
    target: row.target,
    unit: row.unit,
    isPrivate: row.isPrivate,
    createdDay: dayIn(tz, row.createdAt),
    archivedDay: row.archivedAt ? dayIn(tz, row.archivedAt) : null,
  };
}

export type ActivityData = { habits: HabitLite[]; checkIns: CheckInLite[] };

/**
 * Habits and check-ins for one or more users between two days.
 * `timezones` maps user id -> IANA timezone (for habit created/archived days).
 */
export async function loadActivity(
  timezones: Map<string, string>,
  from: DateStr,
  to: DateStr,
): Promise<Map<string, ActivityData>> {
  const userIds = [...timezones.keys()];
  const [habits, checkIns] = await Promise.all([
    prisma.habit.findMany({
      where: { userId: { in: userIds } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.checkIn.findMany({
      where: { userId: { in: userIds }, date: { gte: toDbDate(from), lte: toDbDate(to) } },
      select: { userId: true, habitId: true, date: true, value: true },
    }),
  ]);

  const result = new Map<string, ActivityData>(userIds.map((id) => [id, { habits: [], checkIns: [] }]));
  for (const habit of habits) {
    result.get(habit.userId)?.habits.push(toHabitLite(habit, timezones.get(habit.userId) ?? "UTC"));
  }
  for (const checkIn of checkIns) {
    result
      .get(checkIn.userId)
      ?.checkIns.push({ habitId: checkIn.habitId, date: fromDbDate(checkIn.date), value: checkIn.value });
  }
  return result;
}

/** One user's habits and check-ins (convenience wrapper). */
export async function loadUserActivity(userId: string, tz: string, from: DateStr, to: DateStr) {
  const data = await loadActivity(new Map([[userId, tz]]), from, to);
  return data.get(userId) ?? { habits: [], checkIns: [] };
}
