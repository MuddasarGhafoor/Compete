"use server";

import { refresh } from "next/cache";
import { getViewer, toHabitLite } from "@/lib/data/core";
import { addDays, isValidDay, toDbDate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { isScheduledOn } from "@/lib/stats";
import { fail, ok, type ActionResult } from "@/lib/validation";

/**
 * Sets how much of a habit was done on a day (0 removes the check-in).
 * Only today and yesterday (in the user's timezone) can be changed.
 */
export async function setCheckIn(habitId: string, day: string, value: number): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!isValidDay(day) || (day !== viewer.today && day !== addDays(viewer.today, -1))) {
    return fail("You can only check in for today or yesterday.");
  }

  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId: viewer.id } });
  if (!habit) return fail("That habit doesn't exist.");
  if (!isScheduledOn(toHabitLite(habit, viewer.tz), day)) return fail("That habit isn't scheduled for this day.");

  const amount = Math.max(0, Math.min(Math.round(Number(value) || 0), 10_000));
  const date = toDbDate(day);

  if (amount === 0) {
    await prisma.checkIn.deleteMany({ where: { habitId, date } });
  } else {
    await prisma.checkIn.upsert({
      where: { habitId_date: { habitId, date } },
      create: { habitId, userId: viewer.id, date, value: amount },
      update: { value: amount },
    });
  }

  refresh();
  return ok();
}
