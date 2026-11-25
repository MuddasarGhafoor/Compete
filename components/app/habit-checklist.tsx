"use client";

import { useOptimistic, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Lock, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { setCheckIn } from "@/app/actions/check-ins";
import { HabitIcon } from "@/components/habit-icon";
import { MotionProvider } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ChecklistItem = {
  id: string;
  name: string;
  icon: string;
  target: number;
  unit: string | null;
  isPrivate: boolean;
  value: number;
};

type HabitChecklistProps = {
  items: ChecklistItem[];
  /** The day being edited ("YYYY-MM-DD"). */
  day: string;
};

/** Today's (or yesterday's) habits. Changes show instantly and save in the background. */
export function HabitChecklist({ items, day }: HabitChecklistProps) {
  const [, startTransition] = useTransition();
  const [values, setOptimisticValue] = useOptimistic(
    new Map(items.map((item) => [item.id, item.value])),
    (current, change: { id: string; value: number }) => new Map(current).set(change.id, change.value),
  );

  function save(item: ChecklistItem, value: number) {
    const next = Math.max(0, value);
    startTransition(async () => {
      setOptimisticValue({ id: item.id, value: next });
      const result = await setCheckIn(item.id, day, next);
      if (!result.ok) toast.error(result.error);
    });
  }

  const doneCount = items.filter((item) => (values.get(item.id) ?? 0) >= item.target).length;
  const percent = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  return (
    <MotionProvider>
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
          <div>
            <p className="font-semibold">
              {doneCount} of {items.length} done
            </p>
            <p className="text-sm text-muted-foreground">
              {percent === 100 ? "Day complete. Nice work." : "Tap a habit to check it off."}
            </p>
          </div>
          <span className="text-2xl font-semibold tracking-tight tabular-nums">{percent}%</span>
        </div>
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={false}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <ul className="divide-y">
          {items.map((item) => {
            const value = values.get(item.id) ?? 0;
            const done = value >= item.target;
            const counts = item.target > 1;

            return (
              <li key={item.id} className="flex items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-5">
                <button
                  type="button"
                  onClick={() => save(item, done ? 0 : item.target)}
                  aria-pressed={done}
                  aria-label={done ? `Mark "${item.name}" as not done` : `Mark "${item.name}" as done`}
                  className={cn(
                    "relative grid size-9 shrink-0 place-items-center rounded-full border-2 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input text-transparent hover:border-primary/60",
                  )}
                >
                  <AnimatePresence initial={false}>
                    {done && (
                      <motion.span
                        key="check"
                        initial={{ scale: 0.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.3, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 28 }}
                      >
                        <Check className="size-4.5" strokeWidth={3} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>

                <button
                  type="button"
                  onClick={() => (counts ? save(item, value + 1) : save(item, done ? 0 : 1))}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-md py-1 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                    <HabitIcon name={item.icon} />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "flex items-center gap-1.5 font-medium transition-colors",
                        done && "text-muted-foreground line-through decoration-muted-foreground/50",
                      )}
                    >
                      <span className="truncate">{item.name}</span>
                      {item.isPrivate && <Lock className="size-3 shrink-0 text-muted-foreground" aria-label="Private" />}
                    </span>
                    {counts && (
                      <span className="mt-1 flex items-center gap-2">
                        <span className="h-1 w-20 overflow-hidden rounded-full bg-muted">
                          <span
                            className="block h-full rounded-full bg-primary transition-[width] duration-300"
                            style={{ width: `${Math.min(100, (value / item.target) * 100)}%` }}
                          />
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {value} / {item.target} {item.unit}
                        </span>
                      </span>
                    )}
                  </span>
                </button>

                {counts && (
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => save(item, value - 1)}
                      disabled={value === 0}
                      aria-label={`Less ${item.unit ?? ""}`.trim()}
                    >
                      <Minus />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => save(item, value + 1)}
                      aria-label={`More ${item.unit ?? ""}`.trim()}
                    >
                      <Plus />
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </MotionProvider>
  );
}
