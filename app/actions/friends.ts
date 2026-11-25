"use server";

import { refresh } from "next/cache";
import { getViewer } from "@/lib/data/core";
import { prisma } from "@/lib/prisma";
import { fail, ok, type ActionResult } from "@/lib/validation";

export async function sendFriendRequest(userId: string): Promise<ActionResult> {
  const viewer = await getViewer();
  if (userId === viewer.id) return fail("You can't add yourself.");

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true } });
  if (!target) return fail("That person doesn't exist.");

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: viewer.id, addresseeId: userId },
        { requesterId: userId, addresseeId: viewer.id },
      ],
    },
  });

  if (existing?.status === "ACCEPTED") return fail("You're already friends.");
  if (existing && existing.requesterId === viewer.id) return fail("Request already sent.");
  if (existing) {
    // They already asked you: accept instead of creating a second request.
    await prisma.friendship.update({
      where: { id: existing.id },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    });
    refresh();
    return ok(`You and ${target.name} are now friends`);
  }

  await prisma.friendship.create({ data: { requesterId: viewer.id, addresseeId: userId } });
  refresh();
  return ok(`Friend request sent to ${target.name}`);
}

export async function respondToFriendRequest(friendshipId: string, accept: boolean): Promise<ActionResult> {
  const viewer = await getViewer();
  const request = await prisma.friendship.findFirst({
    where: { id: friendshipId, addresseeId: viewer.id, status: "PENDING" },
  });
  if (!request) return fail("That request is no longer available.");

  if (accept) {
    await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    });
  } else {
    await prisma.friendship.delete({ where: { id: friendshipId } });
  }
  refresh();
  return ok(accept ? "Friend request accepted" : "Friend request declined");
}

/** Cancels a request you sent, or removes a friend. */
export async function removeFriendship(friendshipId: string): Promise<ActionResult> {
  const viewer = await getViewer();
  const row = await prisma.friendship.findFirst({
    where: { id: friendshipId, OR: [{ requesterId: viewer.id }, { addresseeId: viewer.id }] },
  });
  if (!row) return fail("That connection doesn't exist.");

  await prisma.friendship.delete({ where: { id: friendshipId } });
  refresh();
  return ok(row.status === "ACCEPTED" ? "Friend removed" : "Request canceled");
}
