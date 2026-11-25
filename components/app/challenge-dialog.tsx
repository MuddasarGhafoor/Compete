"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createChallenge } from "@/app/actions/challenges";
import {
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
  FormSection,
  formDialogContent,
} from "@/components/app/form-dialog";
import { AccountAvatar } from "@/components/user-menu";
import { IconPicker } from "@/components/icon-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

/** Choice chips (start day, length). */
function Chip({
  selected,
  onClick,
  children,
  hint,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex flex-col items-start rounded-lg border px-3 py-2 text-left text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        selected ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary" : "hover:bg-muted",
      )}
    >
      <span className="font-medium">{children}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </button>
  );
}

export function ChallengeDialog({ today, friends, trigger }: ChallengeDialogProps) {
  const router = useRouter();
  const nextMonday = addDays(today, 7 - weekdayIndex(today));
  const starts = [
    { label: "Today", value: today },
    { label: "Tomorrow", value: addDays(today, 1) },
    { label: "Next Monday", value: nextMonday },
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

  const endDate = addDays(startDate, durationDays - 1);
  const shortDate = (day: string) => formatDay(day, { weekday: "short", month: "short", day: "numeric" });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) reset();
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent className={formDialogContent}>
        <FormDialogHeader
          title="New challenge"
          description="Everyone tracks the same thing, once a day, for a set number of days."
        />

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <FormDialogBody>
            <FormSection label="Title and icon" htmlFor="challenge-title">
              <div className="flex gap-2">
                <IconPicker value={icon} onChange={setIcon} />
                <Input
                  id="challenge-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="No sugar for two weeks"
                  maxLength={60}
                  required
                  autoFocus
                  className="h-10 flex-1"
                />
              </div>
            </FormSection>

            <FormSection label="Rules" hint="Optional. What counts as a day done?" htmlFor="challenge-description">
              <Textarea
                id="challenge-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="No sweets, soda or desserts. Fruit is fine."
                maxLength={200}
                rows={3}
                className="resize-none"
              />
            </FormSection>

            <FormSection label="Starts">
              <div className="grid grid-cols-3 gap-2">
                {starts.map((start) => (
                  <Chip
                    key={start.value}
                    selected={startDate === start.value}
                    onClick={() => setStartDate(start.value)}
                    hint={formatDay(start.value, { month: "short", day: "numeric" })}
                  >
                    {start.label}
                  </Chip>
                ))}
              </div>
            </FormSection>

            <FormSection label="Length" hint={`Runs ${shortDate(startDate)} to ${shortDate(endDate)}.`}>
              <div className="grid grid-cols-4 gap-2">
                {durations.map((days) => (
                  <Chip key={days} selected={durationDays === days} onClick={() => setDurationDays(days)}>
                    {days} days
                  </Chip>
                ))}
              </div>
            </FormSection>

            <FormSection
              label="Invite friends"
              hint={friends.length ? `${inviteeIds.length} selected. They'll get an invite to accept.` : undefined}
            >
              {friends.length === 0 ? (
                <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
                  Add friends first to invite them. You can also go solo.
                </p>
              ) : (
                <ul className="max-h-52 divide-y overflow-y-auto rounded-xl border">
                  {friends.map((friend) => {
                    const checked = inviteeIds.includes(friend.id);
                    return (
                      <li key={friend.id}>
                        <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) =>
                              setInviteeIds((current) =>
                                value ? [...current, friend.id] : current.filter((id) => id !== friend.id),
                              )
                            }
                          />
                          <AccountAvatar name={friend.name} className="size-7 text-xs" />
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">{friend.name}</span>
                          {friend.username && <span className="text-xs text-muted-foreground">@{friend.username}</span>}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </FormSection>
          </FormDialogBody>

          <FormDialogFooter error={error} pending={pending} submitLabel="Create challenge" />
        </form>
      </DialogContent>
    </Dialog>
  );
}
