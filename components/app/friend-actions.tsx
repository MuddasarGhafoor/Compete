"use client";

import { useState, useTransition } from "react";
import { Check, Copy, UserMinus, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { removeFriendship, respondToFriendRequest, sendFriendRequest } from "@/app/actions/friends";
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
      if (!result.ok) toast.error(result.error);
      else if (result.message) toast.success(result.message);
    });
  return { pending, run };
}

export function AddFriendButton({ userId, label = "Add friend" }: { userId: string; label?: string }) {
  const { pending, run } = useAction();
  return (
    <Button size="sm" disabled={pending} onClick={() => run(() => sendFriendRequest(userId))}>
      <UserPlus data-icon="inline-start" />
      {label}
    </Button>
  );
}

export function RespondButtons({ friendshipId }: { friendshipId: string }) {
  const { pending, run } = useAction();
  return (
    <div className="flex shrink-0 gap-1.5">
      <Button size="sm" disabled={pending} onClick={() => run(() => respondToFriendRequest(friendshipId, true))}>
        <Check data-icon="inline-start" />
        Accept
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => run(() => respondToFriendRequest(friendshipId, false))}
        aria-label="Decline request"
      >
        <X />
      </Button>
    </div>
  );
}

export function CancelRequestButton({ friendshipId }: { friendshipId: string }) {
  const { pending, run } = useAction();
  return (
    <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => removeFriendship(friendshipId))}>
      Cancel request
    </Button>
  );
}

export function RemoveFriendButton({ friendshipId, name }: { friendshipId: string; name: string }) {
  const { pending, run } = useAction();
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button size="icon-sm" variant="ghost" aria-label={`Remove ${name}`} title={`Remove ${name}`} />}
      >
        <UserMinus />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            You&apos;ll stop seeing each other on the leaderboard and in activity. You can add each other again later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending} onClick={() => run(() => removeFriendship(friendshipId))}>
            Remove friend
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error("Couldn't copy. Select the text and copy it instead.");
        }
      }}
    >
      {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
      {copied ? "Copied" : label}
    </Button>
  );
}
