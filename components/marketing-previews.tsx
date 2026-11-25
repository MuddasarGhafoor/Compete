import { Circle, CircleCheck, Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

// Static, illustrative previews of the app used on the landing and auth pages.

const sampleHabits = [
  { name: "Morning workout", done: true },
  { name: "Read 20 pages", done: true },
  { name: "Drink 8 glasses of water", done: true },
  { name: "No phone after 10 PM", done: false },
];

const sampleLeaderboard = [
  { name: "Alex", initials: "AL", score: 92 },
  { name: "You", initials: "YO", score: 75, isYou: true },
  { name: "Sam", initials: "SA", score: 68 },
];

export function TodayPreview({ className }: { className?: string }) {
  const done = sampleHabits.filter((habit) => habit.done).length;
  const percent = Math.round((done / sampleHabits.length) * 100);

  return (
    <div
      role="img"
      aria-label="Example of the Today page with habits and a weekly leaderboard"
      className={cn(
        "rounded-2xl border bg-card p-5 shadow-xl shadow-zinc-950/5 ring-1 ring-foreground/5 sm:p-6",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Today
          </p>
          <p className="mt-1 text-lg font-semibold">
            {done} of {sampleHabits.length} habits done
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
          <Flame className="size-3.5" />
          12-day streak
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>

      <ul className="mt-5 space-y-1">
        {sampleHabits.map((habit) => (
          <li
            key={habit.name}
            className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm"
          >
            {habit.done ? (
              <CircleCheck className="size-5 shrink-0 text-primary" />
            ) : (
              <Circle className="size-5 shrink-0 text-muted-foreground/50" />
            )}
            <span className={cn(habit.done && "text-muted-foreground line-through")}>
              {habit.name}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 border-t pt-5">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Trophy className="size-4 text-amber-500" />
          This week
        </p>
        <LeaderboardRows className="mt-3" />
      </div>
    </div>
  );
}

/** Dark, glassy leaderboard card for the auth pages' brand panel. */
export function LeaderboardPreview() {
  return (
    <div
      role="img"
      aria-label="Example weekly leaderboard"
      className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur"
    >
      <p className="flex items-center gap-2 text-sm font-medium text-white">
        <Trophy className="size-4 text-amber-400" />
        This week&apos;s leaderboard
      </p>
      <LeaderboardRows tone="dark" className="mt-4" />
    </div>
  );
}

function LeaderboardRows({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "dark";
}) {
  const dark = tone === "dark";

  return (
    <ol className={cn("space-y-3", className)}>
      {sampleLeaderboard.map((person, index) => (
        <li key={person.name} className="flex items-center gap-3 text-sm">
          <span className={cn("w-4 text-xs tabular-nums", dark ? "text-zinc-500" : "text-muted-foreground")}>
            {index + 1}
          </span>
          <span
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold",
              person.isYou
                ? "bg-emerald-500 text-white"
                : dark
                  ? "bg-white/10 text-zinc-200"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {person.initials}
          </span>
          <span className={cn("w-12 font-medium", dark && "text-zinc-100")}>{person.name}</span>
          <span className={cn("h-1.5 flex-1 overflow-hidden rounded-full", dark ? "bg-white/10" : "bg-muted")}>
            <span
              className={cn("block h-full rounded-full", person.isYou ? "bg-emerald-500" : dark ? "bg-zinc-500" : "bg-zinc-400 dark:bg-zinc-500")}
              style={{ width: `${person.score}%` }}
            />
          </span>
          <span className={cn("w-9 text-right text-xs font-semibold tabular-nums", dark ? "text-zinc-300" : "text-foreground")}>
            {person.score}%
          </span>
        </li>
      ))}
    </ol>
  );
}
