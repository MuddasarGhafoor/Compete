"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CircleAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createChallenge } from "@/app/actions/challenges";
import { HabitIcon, habitIconNames } from "@/components/habit-icon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addDays, formatDay, weekdayIndex } from "@/lib/dates";
import { cn } from "@/lib/utils";

type Friend = { id: string; name: string; username: string | null };

type ChallengeDialogProps = {
  /** The viewer's today ("YYYY-MM-DD"). */
  today: string;
  friends: Friend[];
  trigger: React.ReactElement;
};

const durations = [7, 14, 21, 30];

/** Choice chips used for start day and length. */
function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        selected ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

export function ChallengeDialog({ today, friends, trigger }: ChallengeDialogProps) {
  const router = useRouter();
  const nextMonday = addDays(today, 7 - weekdayIndex(today));
  const starts = [
    { label: "Today", value: today },
    { label: "Tomorrow", value: addDays(today, 1) },
    { label: `Mon, ${formatDay(nextMonday, { month: "short", day: "numeric" })}`, value: nextMonday },
  ].filter((start, index, all) => all.findIndex((item) => item.value === start.value) === index);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("target");
  const [startDate, setStartDate] = useState(today);
  const [durationDays, setDurationDays] = useState(14);
  const [inviteeIds, setInviteeIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setTitle("");
    setDescription("");
    setIcon("target");
    setStartDate(today);
    setDurationDays(14);
    setInviteeIds([]);
    setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createChallenge({ title, description, icon, startDate, durationDays, inviteeIds });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success(result.message ?? "Challenge created");
      setOpen(false);
      if (result.id) router.push(`/challenges/${result.id}`);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) reset();
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New challenge</DialogTitle>
          <DialogDescription>Everyone tracks the same thing, once a day, for a set number of days.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="challenge-title">Title</Label>
            <Input
              id="challenge-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="No sugar for two weeks"
              maxLength={60}
              required
              autoFocus
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenge-description">Rules (optional)</Label>
            <Textarea
              id="challenge-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="No sweets, soda or desserts. Fruit is fine."
              maxLength={200}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10" role="radiogroup" aria-label="Icon">
              {habitIconNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  role="radio"
                  aria-checked={icon === name}
                  aria-label={name.replace("-", " ")}
                  onClick={() => setIcon(name)}
                  className={cn(
                    "grid aspect-square place-items-center rounded-lg border transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    icon === name
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <HabitIcon name={name} className="size-4.5" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Starts</Label>
              <div className="flex flex-wrap gap-2">
                {starts.map((start) => (
                  <Chip key={start.value} selected={startDate === start.value} onClick={() => setStartDate(start.value)}>
                    {start.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Length</Label>
              <div className="flex flex-wrap gap-2">
                {durations.map((days) => (
                  <Chip key={days} selected={durationDays === days} onClick={() => setDurationDays(days)}>
                    {days} days
                  </Chip>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Invite friends</Label>
            {friends.length === 0 ? (
              <p className="text-sm text-muted-foreground">Add friends first to invite them. You can also do it solo.</p>
            ) : (
              <ul className="max-h-48 divide-y overflow-y-auto rounded-lg border">
                {friends.map((friend) => {
                  const checked = inviteeIds.includes(friend.id);
                  return (
                    <li key={friend.id}>
                      <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/50">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) =>
                            setInviteeIds((current) =>
                              value ? [...current, friend.id] : current.filter((id) => id !== friend.id),
                            )
                          }
                        />
                        <span className="min-w-0 flex-1 truncate text-sm">{friend.name}</span>
                        {friend.username && <span className="text-xs text-muted-foreground">@{friend.username}</span>}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" size="lg" />}>Cancel</DialogClose>
            <Button type="submit" size="lg" disabled={pending}>
              {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
              Create challenge
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
