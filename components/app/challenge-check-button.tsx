"use client";

import { useOptimistic, useTransition } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { toggleChallengeCheckIn } from "@/app/actions/challenges";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChallengeCheckButtonProps = {
  challengeId: string;
  day: string;
  done: boolean;
  label?: string;
  /** Shown once checked in (says which day when there are two buttons) */
  doneLabel?: string;
  size?: "sm" | "lg";
};

/** "Check in" / "Done" toggle for a challenge day. */
export function ChallengeCheckButton({
  challengeId,
  day,
  done,
  label = "Check in",
  doneLabel = "Done",
  size = "sm",
}: ChallengeCheckButtonProps) {
  const [, startTransition] = useTransition();
  const [isDone, setDone] = useOptimistic(done);

  return (
    <Button
      type="button"
      size={size}
      variant={isDone ? "default" : "outline"}
      aria-pressed={isDone}
      onClick={() =>
        startTransition(async () => {
          setDone(!isDone);
          const result = await toggleChallengeCheckIn(challengeId, day);
          if (!result.ok) toast.error(result.error);
        })
      }
      className={cn("shrink-0", size === "lg" && "h-10 px-4")}
    >
      {isDone && <Check data-icon="inline-start" />}
      {isDone ? doneLabel : label}
    </Button>
  );
}
