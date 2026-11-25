"use server";

import { refresh } from "next/cache";
import { isHabitIconName } from "@/components/habit-icon";
import { getViewer } from "@/lib/data/core";
import { prisma } from "@/lib/prisma";
import { fail, ok, type ActionResult } from "@/lib/validation";

export type HabitInput = {
  name: string;
  icon: string;
  days: number[];
  target: number;
  unit: string;
  isPrivate: boolean;
};

function cleanInput(input: HabitInput): { data: Omit<HabitInput, "unit"> & { unit: string | null } } | { error: string } {
  const name = input.name.trim();
  if (name.length < 1 || name.length > 60) return { error: "Give the habit a name (up to 60 characters)." };
  if (!isHabitIconName(input.icon)) return { error: "Pick an icon." };

  const days = [...new Set(input.days)].filter((day) => Number.isInteger(day) && day >= 0 && day <= 6).sort();
  if (days.length === 0) return { error: "Pick at least one day." };

  const target = Math.round(Number(input.target));
  if (!Number.isFinite(target) || target < 1 || target > 1000) return { error: "The target must be between 1 and 1000." };

  const unit = input.unit.trim().slice(0, 20);
  return {
    data: { name, icon: input.icon, days, target, unit: target > 1 && unit ? unit : null, isPrivate: Boolean(input.isPrivate) },
  };
}

async function ownHabit(habitId: string, userId: string) {
  return prisma.habit.findFirst({ where: { id: habitId, userId }, select: { id: true, archivedAt: true } });
}

export async function createHabit(input: HabitInput): Promise<ActionResult> {
  const viewer = await getViewer();
  const cleaned = cleanInput(input);
  if ("error" in cleaned) return fail(cleaned.error);

  const count = await prisma.habit.count({ where: { userId: viewer.id, archivedAt: null } });
  if (count >= 50) return fail("You can have up to 50 active habits.");

  await prisma.habit.create({ data: { ...cleaned.data, userId: viewer.id, sortOrder: count } });
  refresh();
  return ok("Habit added");
}

export async function updateHabit(habitId: string, input: HabitInput): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!(await ownHabit(habitId, viewer.id))) return fail("That habit doesn't exist.");
  const cleaned = cleanInput(input);
  if ("error" in cleaned) return fail(cleaned.error);

  await prisma.habit.update({ where: { id: habitId }, data: cleaned.data });
  refresh();
  return ok("Habit saved");
}

export async function setHabitArchived(habitId: string, archived: boolean): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!(await ownHabit(habitId, viewer.id))) return fail("That habit doesn't exist.");

  await prisma.habit.update({ where: { id: habitId }, data: { archivedAt: archived ? new Date() : null } });
  refresh();
  return ok(archived ? "Habit archived" : "Habit restored");
}

export async function deleteHabit(habitId: string): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!(await ownHabit(habitId, viewer.id))) return fail("That habit doesn't exist.");

  // Check-ins are removed with it (onDelete: Cascade).
  await prisma.habit.delete({ where: { id: habitId } });
  refresh();
  return ok("Habit deleted");
}

/** Moves a habit one place up or down in the list. */
export async function moveHabit(habitId: string, direction: "up" | "down"): Promise<ActionResult> {
  const viewer = await getViewer();
  const habits = await prisma.habit.findMany({
    where: { userId: viewer.id, archivedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  const index = habits.findIndex((habit) => habit.id === habitId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= habits.length) return ok();

  const order = habits.map((habit) => habit.id);
  [order[index], order[swapWith]] = [order[swapWith], order[index]];
  await prisma.$transaction(
    order.map((id, sortOrder) => prisma.habit.update({ where: { id }, data: { sortOrder } })),
  );
  refresh();
  return ok();
}
