"use client";

import { useTransition } from "react";
import { Archive, ArchiveRestore, ArrowDown, ArrowUp, Ellipsis, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteHabit, moveHabit, setHabitArchived } from "@/app/actions/habits";
import { HabitFormDialog, type EditableHabit } from "@/components/app/habit-form-dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ActionResult } from "@/lib/validation";

type HabitRowActionsProps = {
  habit: EditableHabit;
  archived: boolean;
  isFirst: boolean;
  isLast: boolean;
};

export function HabitRowActions({ habit, archived, isFirst, isLast }: HabitRowActionsProps) {
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<ActionResult>) =>
    startTransition(async () => {
      const result = await action();
      if (!result.ok) toast.error(result.error);
      else if (result.message) toast.success(result.message);
    });

  if (archived) {
    return (
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => run(() => setHabitArchived(habit.id, false))}
        >
          <ArchiveRestore data-icon="inline-start" />
          Restore
        </Button>
        <AlertDialog>
          <AlertDialogTrigger
            render={<Button variant="ghost" size="icon-sm" aria-label={`Delete ${habit.name}`} />}
          >
            <Trash2 />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &ldquo;{habit.name}&rdquo;?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the habit and all of its check-ins for good. Your past scores will change. This can&apos;t
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={() => run(() => deleteHabit(habit.id))}>
                Delete habit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-1">
      <HabitFormDialog
        habit={habit}
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label={`Edit ${habit.name}`}>
            <Pencil />
          </Button>
        }
      />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label={`More options for ${habit.name}`} />}
        >
          <Ellipsis />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem disabled={isFirst || pending} onClick={() => run(() => moveHabit(habit.id, "up"))}>
            <ArrowUp />
            Move up
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isLast || pending} onClick={() => run(() => moveHabit(habit.id, "down"))}>
            <ArrowDown />
            Move down
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={pending} onClick={() => run(() => setHabitArchived(habit.id, true))}>
            <Archive />
            Archive
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
