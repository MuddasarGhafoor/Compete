import type { Metadata } from "next";
import { Suspense } from "react";
import { Flame, ListChecks, Lock, Plus } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { HabitFormDialog } from "@/components/app/habit-form-dialog";
import { HabitRowActions } from "@/components/app/habit-row-actions";
import { PageHeader } from "@/components/app/page-header";
import { PageSkeleton } from "@/components/app/require-session";
import { HabitIconTile } from "@/components/habit-icon";
import { Button } from "@/components/ui/button";
import { getViewer, loadUserActivity } from "@/lib/data/core";
import { addDays, describeSchedule, formatDay } from "@/lib/dates";
import { formatPercent, plural } from "@/lib/format";
import { habitSummary, indexCheckIns, type HabitSummary } from "@/lib/stats";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Habits",
};

export default function HabitsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HabitsContent />
    </Suspense>
  );
}

async function HabitsContent() {
  const viewer = await getViewer();
  const from = addDays(viewer.today, -120);
  const activity = await loadUserActivity(viewer.id, viewer.tz, from, viewer.today);
  const index = indexCheckIns(activity.checkIns);
  const summaries = activity.habits.map((habit) => habitSummary(habit, index, from, viewer.today));
  const active = summaries.filter((summary) => !summary.habit.archivedDay);
  const archived = summaries.filter((summary) => summary.habit.archivedDay);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Habits"
        description="The routine you're building: what you track, and on which days."
        actions={
          <HabitFormDialog
            trigger={
              <Button size="lg" className="h-10 px-4">
                <Plus data-icon="inline-start" />
                Add habit
              </Button>
            }
          />
        }
      />

      {active.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No habits yet"
          description="Add the few things you want to do more often. Pick the days they apply, and whether friends can see them."
        >
          <HabitFormDialog
            trigger={
              <Button size="lg" className="h-10 px-4">
                <Plus data-icon="inline-start" />
                Add your first habit
              </Button>
            }
          />
        </EmptyState>
      ) : (
        <section>
          <p className="mb-3 text-sm text-muted-foreground">{plural(active.length, "active habit")}</p>
          <ul className="divide-y rounded-xl border bg-card">
            {active.map((summary, position) => (
              <HabitRow
                key={summary.habit.id}
                summary={summary}
                today={viewer.today}
                isFirst={position === 0}
                isLast={position === active.length - 1}
              />
            ))}
          </ul>
        </section>
      )}

      {archived.length > 0 && (
        <section>
          <h2 className="text-base font-semibold">Archived</h2>
          <p className="mt-1 mb-3 text-sm text-muted-foreground">
            Archived habits stop counting from the day you archived them. Their history stays in your stats.
          </p>
          <ul className="divide-y rounded-xl border bg-card">
            {archived.map((summary) => (
              <HabitRow key={summary.habit.id} summary={summary} today={viewer.today} archived />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function HabitRow({
  summary,
  today,
  archived = false,
  isFirst = false,
  isLast = false,
}: {
  summary: HabitSummary;
  today: string;
  archived?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const { habit } = summary;
  const goal = habit.target > 1 ? `${habit.target} ${habit.unit ?? ""} a day`.trim() : null;

  return (
    <li className={cn("flex items-center gap-4 p-4 sm:px-5", archived && "opacity-70")}>
      <HabitIconTile name={habit.icon} />

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 font-medium">
          <span className="truncate">{habit.name}</span>
          {habit.isPrivate && <Lock className="size-3.5 shrink-0 text-muted-foreground" aria-label="Hidden from friends" />}
        </p>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {archived && habit.archivedDay
            ? `Archived ${formatDay(habit.archivedDay, { month: "short", day: "numeric" })}`
            : [describeSchedule(habit.days), goal].filter(Boolean).join(" · ")}
        </p>
      </div>

      {/* Last 14 scheduled days */}
      <div className="hidden items-center gap-1 md:flex" aria-label="Recent days">
        {summary.recent.map((day) => (
          <span
            key={day.date}
            title={`${formatDay(day.date, { weekday: "short", month: "short", day: "numeric" })}: ${day.done ? "done" : day.date === today ? "not yet" : "missed"}`}
            className={cn(
              "size-2.5 rounded-full",
              day.done ? "bg-primary" : day.date === today ? "border border-primary/50" : "bg-muted-foreground/20",
            )}
          />
        ))}
      </div>

      <div className="hidden w-28 shrink-0 text-right sm:block">
        <p className="flex items-center justify-end gap-1 text-sm font-medium tabular-nums">
          <Flame className="size-3.5 text-warm" />
          {plural(summary.currentStreak, "day")}
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">{formatPercent(summary.rate30)} last 30 days</p>
      </div>

      <HabitRowActions
        habit={{
          id: habit.id,
          name: habit.name,
          icon: habit.icon,
          days: habit.days,
          target: habit.target,
          unit: habit.unit ?? "",
          isPrivate: habit.isPrivate,
        }}
        archived={archived}
        isFirst={isFirst}
        isLast={isLast}
      />
    </li>
  );
}
