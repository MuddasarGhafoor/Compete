/**
 * Scoring rules (pure functions, safe on server and client):
 *   - Daily %   = habits done ÷ habits scheduled that day. A habit is done when value >= target.
 *   - Weekly %  = average of the daily %s, Monday to Sunday, for finished days.
 *                 Today counts once it reaches 100% (or when it's over).
 *                 Days with nothing scheduled don't count.
 *   - Streak    = consecutive days at 100%. Days with nothing scheduled are skipped,
 *                 and today doesn't break a streak while it's still in progress.
 *   - A habit only counts from the day it was created until the day it was archived.
 */
import { addDays, dayRange, startOfWeek, weekdayIndex, type DateStr } from "./dates";

export type HabitLite = {
  id: string;
  name: string;
  icon: string;
  days: number[];
  target: number;
  unit: string | null;
  isPrivate: boolean;
  createdDay: DateStr;
  archivedDay: DateStr | null;
};

export type CheckInLite = { habitId: string; date: DateStr; value: number };

export type DayStat = {
  date: DateStr;
  scheduled: number;
  done: number;
  /** null when nothing was scheduled */
  percent: number | null;
};

export function isScheduledOn(habit: HabitLite, day: DateStr): boolean {
  return (
    day >= habit.createdDay &&
    (!habit.archivedDay || day < habit.archivedDay) &&
    habit.days.includes(weekdayIndex(day))
  );
}

const checkKey = (habitId: string, day: DateStr) => `${habitId}|${day}`;

export type CheckInIndex = Map<string, number>;

export function indexCheckIns(checkIns: CheckInLite[]): CheckInIndex {
  return new Map(checkIns.map((checkIn) => [checkKey(checkIn.habitId, checkIn.date), checkIn.value]));
}

export function valueOn(index: CheckInIndex, habitId: string, day: DateStr): number {
  return index.get(checkKey(habitId, day)) ?? 0;
}

export function dailyStats(
  habits: HabitLite[],
  index: CheckInIndex,
  from: DateStr,
  to: DateStr,
): DayStat[] {
  return dayRange(from, to).map((date) => {
    let scheduled = 0;
    let done = 0;
    for (const habit of habits) {
      if (!isScheduledOn(habit, date)) continue;
      scheduled += 1;
      if (valueOn(index, habit.id, date) >= habit.target) done += 1;
    }
    return { date, scheduled, done, percent: scheduled ? Math.round((done / scheduled) * 100) : null };
  });
}

/** Days must be in ascending order. */
export function currentStreak(days: DayStat[], today: DateStr): number {
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i -= 1) {
    const day = days[i];
    if (day.date > today || day.percent === null) continue;
    if (day.percent === 100) streak += 1;
    else if (day.date !== today) break;
  }
  return streak;
}

export function bestStreak(days: DayStat[], today: DateStr): number {
  let best = 0;
  let run = 0;
  for (const day of days) {
    if (day.date > today || day.percent === null) continue;
    if (day.percent === 100) {
      run += 1;
      best = Math.max(best, run);
    } else if (day.date !== today) {
      run = 0;
    }
  }
  return best;
}

export function averagePercent(days: DayStat[]): number | null {
  const values = days.flatMap((day) => (day.percent === null ? [] : [day.percent]));
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
}

/**
 * Weekly score for the week starting `weekStart`: the average of finished days.
 * Today only counts once it's at 100%, so checking off a habit can never lower your score
 * (and people in different timezones are compared fairly mid-day).
 */
export function weekScore(days: DayStat[], weekStart: DateStr, today: DateStr): number | null {
  const weekEnd = addDays(weekStart, 6);
  return averagePercent(
    days.filter(
      (day) =>
        day.date >= weekStart &&
        day.date <= weekEnd &&
        (day.date < today || (day.date === today && day.percent === 100)),
    ),
  );
}

export type HabitSummary = {
  habit: HabitLite;
  currentStreak: number;
  bestStreak: number;
  /** % of scheduled days done in the last 30 days (null if never scheduled) */
  rate30: number | null;
  /** Done (true) / missed (false) for each scheduled day of the last 14 days */
  recent: { date: DateStr; done: boolean }[];
};

export function habitSummary(habit: HabitLite, index: CheckInIndex, from: DateStr, today: DateStr): HabitSummary {
  const scheduledDays = dayRange(from, today).filter((day) => isScheduledOn(habit, day));
  const done = (day: DateStr) => valueOn(index, habit.id, day) >= habit.target;

  let current = 0;
  for (let i = scheduledDays.length - 1; i >= 0; i -= 1) {
    const day = scheduledDays[i];
    if (done(day)) current += 1;
    else if (day !== today) break;
  }

  let best = 0;
  let run = 0;
  for (const day of scheduledDays) {
    if (done(day)) {
      run += 1;
      best = Math.max(best, run);
    } else if (day !== today) {
      run = 0;
    }
  }

  const last30 = scheduledDays.filter((day) => day > addDays(today, -30) && day < today);
  const last30Done = last30.filter(done).length;
  const recentFrom = addDays(today, -13);

  return {
    habit,
    currentStreak: current,
    bestStreak: best,
    rate30: last30.length ? Math.round((last30Done / last30.length) * 100) : null,
    recent: scheduledDays.filter((day) => day >= recentFrom).map((day) => ({ date: day, done: done(day) })),
  };
}

/** Weeks (Monday start) in which every scheduled day was at 100%. Only finished weeks count. */
export function perfectWeeks(days: DayStat[], today: DateStr): number {
  const byWeek = new Map<DateStr, DayStat[]>();
  for (const day of days) {
    const week = startOfWeek(day.date);
    byWeek.set(week, [...(byWeek.get(week) ?? []), day]);
  }
  let count = 0;
  for (const [week, weekDays] of byWeek) {
    if (addDays(week, 6) >= today || weekDays.length < 7) continue;
    const scheduled = weekDays.filter((day) => day.percent !== null);
    if (scheduled.length > 0 && scheduled.every((day) => day.percent === 100)) count += 1;
  }
  return count;
}

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: "sparkles" | "flame" | "calendar-check" | "trophy" | "medal" | "target";
  earned: boolean;
};

export function achievements(input: {
  totalDone: number;
  bestStreak: number;
  perfectWeeks: number;
  challengesFinished: number;
}): Achievement[] {
  return [
    { id: "first", title: "First step", description: "Complete your first habit", icon: "sparkles", earned: input.totalDone >= 1 },
    { id: "streak-3", title: "On a roll", description: "Reach a 3-day streak", icon: "flame", earned: input.bestStreak >= 3 },
    { id: "streak-7", title: "Full week", description: "Reach a 7-day streak", icon: "flame", earned: input.bestStreak >= 7 },
    { id: "streak-30", title: "Unstoppable", description: "Reach a 30-day streak", icon: "flame", earned: input.bestStreak >= 30 },
    { id: "perfect-week", title: "Perfect week", description: "Finish a week at 100%", icon: "calendar-check", earned: input.perfectWeeks >= 1 },
    { id: "hundred", title: "Century", description: "Complete 100 habits", icon: "medal", earned: input.totalDone >= 100 },
    { id: "challenge", title: "Challenger", description: "Finish a challenge", icon: "trophy", earned: input.challengesFinished >= 1 },
  ];
}
