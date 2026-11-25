"use client";

import { useTransition } from "react";
import { Check, LogOut, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { deleteChallenge, leaveChallenge, respondToInvite } from "@/app/actions/challenges";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/validation";

function useAction() {
  const [pending, startTransition] = useTransition();
  const run = (action: () => Promise<ActionResult>) =>
    startTransition(async () => {
      const result = await action();
      // Leave/delete redirect on success, so a returned result is either an error or a message.
      if (result && !result.ok) toast.error(result.error);
      else if (result?.message) toast.success(result.message);
    });
  return { pending, run };
}

export function InviteButtons({ challengeId }: { challengeId: string }) {
  const { pending, run } = useAction();
  return (
    <div className="flex shrink-0 gap-1.5">
      <Button size="sm" disabled={pending} onClick={() => run(() => respondToInvite(challengeId, true))}>
        <Check data-icon="inline-start" />
        Join
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => run(() => respondToInvite(challengeId, false))}
        aria-label="Decline invite"
      >
        <X />
      </Button>
    </div>
  );
}

export function LeaveOrDeleteChallenge({ challengeId, isCreator }: { challengeId: string; isCreator: boolean }) {
  const { pending, run } = useAction();
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" size="lg" />}>
        {isCreator ? <Trash2 data-icon="inline-start" /> : <LogOut data-icon="inline-start" />}
        {isCreator ? "Delete" : "Leave"}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isCreator ? "Delete this challenge?" : "Leave this challenge?"}</AlertDialogTitle>
          <AlertDialogDescription>
            {isCreator
              ? "It's removed for everyone, along with all check-ins. This can't be undone."
              : "Your check-ins for this challenge are removed. You'd need a new invite to rejoin."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={() => run(() => (isCreator ? deleteChallenge(challengeId) : leaveChallenge(challengeId)))}
          >
            {isCreator ? "Delete challenge" : "Leave challenge"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
