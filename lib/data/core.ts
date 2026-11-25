import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, type CurrentUser } from "@/lib/session";
import { dayIn, fromDbDate, safeTimeZone, toDbDate, type DateStr } from "@/lib/dates";
import type { CheckInLite, HabitLite } from "@/lib/stats";

/*
 * Performance notes: every page loads its data in ONE parallel wave of small queries.
 * Select only the columns that are used (results travel over the network, and on a slow or
 * distant link every extra kilobyte costs time). Avoid queries that wait on other queries.
 */

/** The signed-in user plus their timezone and today's date in it. */
export type Viewer = CurrentUser & { tz: string; today: DateStr };

/**
 * Use at the top of every app page / Server Action. Sends signed-out visitors to /sign-in and
 * locked sessions to the home page (where the PIN opens the app again).
 * With Cache Components, call it inside a <Suspense> boundary.
 */
export const getViewer = cache(async (): Promise<Viewer> => {
  const user = await requireUser();
  if (user.locked) redirect("/");
  const tz = safeTimeZone(user.timezone);
  return { ...user, tz, today: dayIn(tz) };
});

export type HabitRow = {
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

export type CheckInRow = { habitId: string; date: Date; value: number };

/** The habit columns the app needs. */
export const habitColumns = {
  id: true,
  name: true,
  icon: true,
  days: true,
  target: true,
  unit: true,
  isPrivate: true,
  createdAt: true,
  archivedAt: true,
} as const;

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

export function toActivity(habits: HabitRow[], checkIns: CheckInRow[], tz: string): ActivityData {
  return {
    habits: habits.map((habit) => toHabitLite(habit, tz)),
    checkIns: checkIns.map((checkIn) => ({
      habitId: checkIn.habitId,
      date: fromDbDate(checkIn.date),
      value: checkIn.value,
    })),
  };
}

/** One user's habits and check-ins from `from` onward (two small queries in parallel). */
export async function loadUserActivity(userId: string, tz: string, from: DateStr): Promise<ActivityData> {
  const [habits, checkIns] = await Promise.all([
    prisma.habit.findMany({
      where: { userId },
      select: habitColumns,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.checkIn.findMany({
      where: { userId, date: { gte: toDbDate(from) } },
      select: { habitId: true, date: true, value: true },
    }),
  ]);
  return toActivity(habits, checkIns, tz);
}
