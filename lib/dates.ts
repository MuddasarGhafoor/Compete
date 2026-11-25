/**
 * Calendar-day helpers. Days are plain "YYYY-MM-DD" strings in the user's own timezone,
 * which avoids off-by-one bugs around midnight. Safe on server and client.
 */

export type DateStr = string;

export const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const WEEKDAY_LETTER = ["M", "T", "W", "T", "F", "S", "S"] as const;

/** Falls back to UTC if the timezone is missing or unknown. */
export function safeTimeZone(timeZone?: string | null): string {
  if (timeZone) {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone });
      return timeZone;
    } catch {
      // unknown zone
    }
  }
  return "UTC";
}

/** The calendar day an instant falls on in a timezone. */
export function dayIn(timeZone: string, instant: Date = new Date()): DateStr {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Midnight UTC for a day (how @db.Date columns are read and written). */
export function toDbDate(day: DateStr): Date {
  return new Date(`${day}T00:00:00.000Z`);
}

export function fromDbDate(date: Date): DateStr {
  return date.toISOString().slice(0, 10);
}

export function isValidDay(value: string): value is DateStr {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(toDbDate(value).getTime());
}

export function addDays(day: DateStr, amount: number): DateStr {
  const date = toDbDate(day);
  date.setUTCDate(date.getUTCDate() + amount);
  return fromDbDate(date);
}

/** 0 = Monday ... 6 = Sunday */
export function weekdayIndex(day: DateStr): number {
  return (toDbDate(day).getUTCDay() + 6) % 7;
}

/** The Monday of the week containing `day`. */
export function startOfWeek(day: DateStr): DateStr {
  return addDays(day, -weekdayIndex(day));
}

export function daysBetween(from: DateStr, to: DateStr): number {
  return Math.round((toDbDate(to).getTime() - toDbDate(from).getTime()) / 86_400_000);
}

/** Every day from `from` to `to`, inclusive. */
export function dayRange(from: DateStr, to: DateStr): DateStr[] {
  const days: DateStr[] = [];
  for (let day = from; day <= to; day = addDays(day, 1)) days.push(day);
  return days;
}

export function formatDay(day: DateStr, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(toDbDate(day));
}

/** "Mon, Wed, Fri", "Every day", "Weekdays" or "Weekends". */
export function describeSchedule(days: number[]): string {
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  const key = sorted.join(",");
  if (key === "0,1,2,3,4,5,6") return "Every day";
  if (key === "0,1,2,3,4") return "Weekdays";
  if (key === "5,6") return "Weekends";
  return sorted.map((day) => WEEKDAY_SHORT[day]).join(", ");
}

/** "2h ago", "yesterday", "3d ago" */
export function timeAgo(instant: Date, now: Date = new Date()): string {
  const seconds = Math.max(0, Math.round((now.getTime() - instant.getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}
