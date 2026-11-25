"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Circle, CircleCheck, Crown, Flame, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * The hero's "video": a looping demo of a day in Compete.
 * Habits get checked off one by one, the progress bar fills, your weekly score climbs
 * past your friends, and the streak ticks up when the day is complete. Then it starts over.
 * It only runs while visible, and stays still for visitors who prefer reduced motion.
 */

const habits = ["Morning workout", "Read 20 pages", "Drink 8 glasses of water", "No phone after 10 PM"];

const STEP_MS = 1600;
const HOLD_STEPS = 2; // extra beats to linger on the finished day
const TOTAL_STEPS = habits.length + 1 + HOLD_STEPS;
const BASE_STREAK = 11;

// Your weekly score after checking off 0, 1, 2, 3 or 4 habits today.
const yourScoreByDone = [64, 71, 78, 86, 93];

type Person = { name: string; initials: string; score: number; isYou?: boolean };

const friends: Person[] = [
  { name: "Alex", initials: "AL", score: 92 },
  { name: "Sam", initials: "SA", score: 81 },
];

const spring = { type: "spring", stiffness: 500, damping: 30 } as const;

/** A number that slides when it changes. */
function RollingNumber({ value }: { value: number }) {
  return (
    <span className="relative inline-flex overflow-hidden tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function LiveTodayPreview({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const timer = setInterval(() => setStep((current) => (current + 1) % TOTAL_STEPS), STEP_MS);
    return () => clearInterval(timer);
  }, [inView, reduceMotion]);

  const done = Math.min(step, habits.length);
  const justChecked = step >= 1 && step <= habits.length ? step - 1 : -1;
  const dayComplete = done === habits.length;
  const percent = Math.round((done / habits.length) * 100);
  const streak = BASE_STREAK + (dayComplete ? 1 : 0);

  const leaderboard: Person[] = [
    ...friends,
    { name: "You", initials: "YO", score: yourScoreByDone[done], isYou: true },
  ].sort((a, b) => b.score - a.score);

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Animated example of the Today page: habits get checked off and you climb the weekly leaderboard"
      className={cn("rounded-xl border bg-card p-5 shadow-sm sm:p-6", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Today</p>
          <p className="mt-0.5 font-semibold">
            <RollingNumber value={done} /> of {habits.length} habits done
          </p>
        </div>
        <motion.span
          key={streak}
          initial={{ scale: dayComplete ? 0.85 : 1 }}
          animate={{ scale: 1 }}
          transition={spring}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-500",
            dayComplete ? "bg-warm/20" : "bg-secondary",
          )}
        >
          <Flame className="size-3.5 text-warm" />
          <span className="inline-flex">
            <RollingNumber value={streak} />
            -day streak
          </span>
        </motion.span>
      </div>

      {/* Progress */}
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Habits */}
      <ul className="mt-4 -mx-2">
        {habits.map((habit, index) => {
          const isDone = index < done;
          const isJustChecked = index === justChecked;

          return (
            <li
              key={habit}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors duration-500",
                isJustChecked && "bg-accent",
              )}
            >
              <span className="relative grid size-5 shrink-0 place-items-center">
                <AnimatePresence initial={false} mode="popLayout">
                  {isDone ? (
                    <motion.span
                      key="done"
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.3, opacity: 0 }}
                      transition={spring}
                    >
                      <CircleCheck className="size-5 text-primary" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="todo"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Circle className="size-5 text-muted-foreground/40" />
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Tap ripple on the habit that was just checked */}
                {isJustChecked && (
                  <motion.span
                    key={`ripple-${step}`}
                    aria-hidden
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    initial={{ scale: 0.8, opacity: 0.7 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                )}
              </span>

              <span className="relative">
                <span className={cn("transition-colors duration-300", isDone && "text-muted-foreground")}>
                  {habit}
                </span>
                {/* Strike-through that draws across */}
                <motion.span
                  aria-hidden
                  className="absolute top-1/2 left-0 h-px bg-muted-foreground/60"
                  initial={false}
                  animate={{ width: isDone ? "100%" : "0%" }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </span>
            </li>
          );
        })}
      </ul>

      {/* Day complete note */}
      <div className="h-9">
        <AnimatePresence>
          {dayComplete && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.4 }}
              className="mt-2 flex items-center gap-2 text-sm font-medium text-primary"
            >
              <PartyPopper className="size-4" />
              Day complete. You moved into first place.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Leaderboard */}
      <div className="mt-2 border-t pt-4">
        <p className="text-xs font-medium text-muted-foreground">This week</p>
        <ol className="mt-3 space-y-3">
          {leaderboard.map((person, index) => (
            <motion.li
              key={person.name}
              layout
              transition={spring}
              className="flex items-center gap-3 text-sm"
            >
              <span className="grid w-4 place-items-center text-xs text-muted-foreground tabular-nums">
                {index === 0 ? <Crown className="size-3.5 text-warm" /> : index + 1}
              </span>
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold",
                  person.isYou ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {person.initials}
              </span>
              <span className="w-14 truncate font-medium">{person.name}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.span
                  className={cn(
                    "block h-full rounded-full",
                    person.isYou ? "bg-primary" : "bg-foreground/20",
                  )}
                  initial={false}
                  animate={{ width: `${person.score}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </span>
              <span className="w-9 text-right text-xs font-medium">
                <RollingNumber value={person.score} />%
              </span>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  );
}
