"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { isHabitIconName } from "@/components/habit-icon";
import { getViewer } from "@/lib/data/core";
import { getFriendIds } from "@/lib/data/social";
import { addDays, daysBetween, fromDbDate, isValidDay, toDbDate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { fail, ok, type ActionResult } from "@/lib/validation";

export type ChallengeInput = {
  title: string;
  description: string;
  icon: string;
  startDate: string;
  durationDays: number;
  inviteeIds: string[];
};

export async function createChallenge(input: ChallengeInput): Promise<ActionResult & { id?: string }> {
  const viewer = await getViewer();

  const title = input.title.trim();
  if (title.length < 3 || title.length > 60) return fail("Give the challenge a title (3–60 characters).");
  const description = input.description.trim().slice(0, 200) || null;
  if (!isHabitIconName(input.icon)) return fail("Pick an icon.");
  if (!isValidDay(input.startDate)) return fail("Pick a start date.");
  if (input.startDate < viewer.today) return fail("The start date can't be in the past.");
  if (daysBetween(viewer.today, input.startDate) > 60) return fail("Start within the next 60 days.");

  const duration = Math.round(Number(input.durationDays));
  if (!Number.isFinite(duration) || duration < 3 || duration > 90) return fail("Challenges last 3 to 90 days.");

  const friendIds = new Set(await getFriendIds(viewer.id));
  const invitees = [...new Set(input.inviteeIds)].filter((id) => friendIds.has(id));

  const challenge = await prisma.challenge.create({
    data: {
      title,
      description,
      icon: input.icon,
      startDate: toDbDate(input.startDate),
      endDate: toDbDate(addDays(input.startDate, duration - 1)),
      creatorId: viewer.id,
      participants: {
        create: [
          { userId: viewer.id, status: "JOINED", joinedAt: new Date() },
          ...invitees.map((userId) => ({ userId, status: "INVITED" as const })),
        ],
      },
    },
  });

  refresh();
  return { ok: true, message: "Challenge created", id: challenge.id };
}

export async function respondToInvite(challengeId: string, accept: boolean): Promise<ActionResult> {
  const viewer = await getViewer();
  const invite = await prisma.challengeParticipant.findFirst({
    where: { challengeId, userId: viewer.id, status: "INVITED" },
  });
  if (!invite) return fail("That invite is no longer available.");

  if (accept) {
    await prisma.challengeParticipant.update({
      where: { id: invite.id },
      data: { status: "JOINED", joinedAt: new Date() },
    });
  } else {
    await prisma.challengeParticipant.delete({ where: { id: invite.id } });
  }
  refresh();
  return ok(accept ? "You joined the challenge" : "Invite declined");
}

/** Check in (or undo) for today or yesterday, within the challenge dates. */
export async function toggleChallengeCheckIn(challengeId: string, day: string): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!isValidDay(day) || (day !== viewer.today && day !== addDays(viewer.today, -1))) {
    return fail("You can only check in for today or yesterday.");
  }

  const participant = await prisma.challengeParticipant.findFirst({
    where: { challengeId, userId: viewer.id, status: "JOINED" },
    include: { challenge: { select: { startDate: true, endDate: true } } },
  });
  if (!participant) return fail("Join the challenge first.");
  if (day < fromDbDate(participant.challenge.startDate) || day > fromDbDate(participant.challenge.endDate)) {
    return fail("That day isn't part of the challenge.");
  }

  const date = toDbDate(day);
  const existing = await prisma.challengeCheckIn.findUnique({
    where: { challengeId_userId_date: { challengeId, userId: viewer.id, date } },
  });
  if (existing) await prisma.challengeCheckIn.delete({ where: { id: existing.id } });
  else await prisma.challengeCheckIn.create({ data: { challengeId, userId: viewer.id, date } });

  refresh();
  return ok();
}

export async function leaveChallenge(challengeId: string): Promise<ActionResult> {
  const viewer = await getViewer();
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId }, select: { creatorId: true } });
  if (!challenge) return fail("That challenge doesn't exist.");
  if (challenge.creatorId === viewer.id) return fail("You created this challenge. Delete it instead.");

  await prisma.challengeCheckIn.deleteMany({ where: { challengeId, userId: viewer.id } });
  await prisma.challengeParticipant.deleteMany({ where: { challengeId, userId: viewer.id } });
  refresh();
  redirect("/challenges");
}

export async function deleteChallenge(challengeId: string): Promise<ActionResult> {
  const viewer = await getViewer();
  const challenge = await prisma.challenge.findFirst({ where: { id: challengeId, creatorId: viewer.id } });
  if (!challenge) return fail("Only the creator can delete a challenge.");

  await prisma.challenge.delete({ where: { id: challengeId } });
  redirect("/challenges");
}
