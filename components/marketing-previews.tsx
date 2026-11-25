import { Circle, CircleCheck, Crown, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

// Static, illustrative previews of the app used on the landing and auth pages.

type Person = { name: string; initials: string; score: number; isYou?: boolean };

const sampleHabits = [
  { name: "Morning workout", done: true },
  { name: "Read 20 pages", done: true },
  { name: "Drink 8 glasses of water", done: true },
  { name: "No phone after 10 PM", done: false },
];

const todayBoard: Person[] = [
  { name: "Alex", initials: "AL", score: 92 },
  { name: "You", initials: "YO", score: 75, isYou: true },
  { name: "Sam", initials: "SA", score: 68 },
];

const weeklyBoard: Person[] = [
  { name: "Alex", initials: "AL", score: 92 },
  { name: "You", initials: "YO", score: 87, isYou: true },
  { name: "Sam", initials: "SA", score: 74 },
  { name: "Jordan", initials: "JO", score: 69 },
  { name: "Riley", initials: "RI", score: 51 },
];

const cardClass = "rounded-xl border bg-card p-5 shadow-sm sm:p-6";

type TodayPreviewProps = {
  className?: string;
  /** Hide the mini leaderboard (used on the auth pages). */
  compact?: boolean;
};

export function TodayPreview({ className, compact = false }: TodayPreviewProps) {
  const done = sampleHabits.filter((habit) => habit.done).length;
  const percent = Math.round((done / sampleHabits.length) * 100);

  return (
    <div role="img" aria-label="Example of the Today page" className={cn(cardClass, className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Today</p>
          <p className="mt-0.5 font-semibold">
            {done} of {sampleHabits.length} habits done
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
          <Flame className="size-3.5 text-amber-600 dark:text-amber-400" />
          12-day streak
        </span>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>

      <ul className="mt-4 -mx-2">
        {sampleHabits.map((habit) => (
          <li key={habit.name} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm">
            {habit.done ? (
              <CircleCheck className="size-5 shrink-0 text-primary" />
            ) : (
              <Circle className="size-5 shrink-0 text-muted-foreground/40" />
            )}
            <span className={cn(habit.done && "text-muted-foreground line-through decoration-muted-foreground/40")}>
              {habit.name}
            </span>
          </li>
        ))}
      </ul>

      {!compact && (
        <div className="mt-4 border-t pt-4">
          <p className="text-xs font-medium text-muted-foreground">This week</p>
          <LeaderboardRows people={todayBoard} className="mt-3" />
        </div>
      )}
    </div>
  );
}

export function LeaderboardPreview({ className }: { className?: string }) {
  return (
    <div role="img" aria-label="Example weekly leaderboard" className={cn(cardClass, className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">This week</p>
        <span className="text-xs text-muted-foreground">Resets Monday</span>
      </div>
      <LeaderboardRows people={weeklyBoard} className="mt-5 space-y-4" />
    </div>
  );
}

function LeaderboardRows({ people, className }: { people: Person[]; className?: string }) {
  return (
    <ol className={cn("space-y-3", className)}>
      {people.map((person, index) => (
        <li key={person.name} className="flex items-center gap-3 text-sm">
          <span className="grid w-4 place-items-center text-xs text-muted-foreground tabular-nums">
            {index === 0 ? <Crown className="size-3.5 text-amber-600 dark:text-amber-400" /> : index + 1}
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
            <span
              className={cn("block h-full rounded-full", person.isYou ? "bg-primary" : "bg-foreground/20")}
              style={{ width: `${person.score}%` }}
            />
          </span>
          <span className="w-9 text-right text-xs font-medium tabular-nums">{person.score}%</span>
        </li>
      ))}
    </ol>
  );
}
