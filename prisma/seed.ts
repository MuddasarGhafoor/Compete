/**
 * Test data for development: `pnpm db:seed`
 *
 * Creates the Dev User plus 5 fake friends with ~9 weeks of habits and check-ins, friendships,
 * pending requests and challenges (active, invited, upcoming and finished).
 *
 * - Re-runnable: it first deletes the Dev User (id "dev-user") and every user whose email ends
 *   in "@compete.test", with all their data. Real accounts are never touched.
 * - Switch between these users with dev login (account menu → "Switch test user").
 * - They can also sign in normally with their email and the test password below.
 *
 * Test password for every seeded user: compete123
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../lib/generated/prisma/client";
import { addDays, dayIn, toDbDate, weekdayIndex, type DateStr } from "../lib/dates";

const TEST_PASSWORD = "compete123";
const TIMEZONE = process.env.SEED_TIMEZONE ?? "Asia/Karachi";
const HISTORY_DAYS = 63;

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL?.replace("sslmode=require", "sslmode=verify-full") }),
});

// Small deterministic random generator, so every seed run looks the same.
let state = 20261125;
function random() {
  state = (state * 1103515245 + 12345) % 2147483648;
  return state / 2147483648;
}

const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [0, 1, 2, 3, 4];

type SeedHabit = { name: string; icon: string; days: number[]; target?: number; unit?: string; isPrivate?: boolean; archivedDaysAgo?: number };
type SeedUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  /** Chance of doing each scheduled habit on a given day */
  consistency: number;
  /** Recent days (before today) forced to 100%, to give a visible streak */
  streakDays: number;
  /** How many of today's habits are already done */
  doneToday: number;
  habits: SeedHabit[];
};

const users: SeedUser[] = [
  {
    id: "dev-user",
    name: "Dev User",
    email: "dev@compete.local",
    username: "dev",
    consistency: 0.78,
    streakDays: 4,
    doneToday: 2,
    habits: [
      { name: "Morning workout", icon: "dumbbell", days: WEEKDAYS },
      { name: "Read 20 pages", icon: "book-open", days: EVERY_DAY },
      { name: "Drink water", icon: "droplets", days: EVERY_DAY, target: 8, unit: "glasses" },
      { name: "Meditate 10 minutes", icon: "brain", days: EVERY_DAY },
      { name: "No phone after 10 PM", icon: "smartphone", days: EVERY_DAY, isPrivate: true },
      { name: "Learn Spanish", icon: "languages", days: [0, 2, 4], archivedDaysAgo: 20 },
    ],
  },
  {
    id: "seed-alex",
    name: "Alex Rivera",
    email: "alex@compete.test",
    username: "alex",
    consistency: 0.92,
    streakDays: 12,
    doneToday: 5,
    habits: [
      { name: "Run 5 km", icon: "footprints", days: [0, 2, 4, 6] },
      { name: "Read before bed", icon: "book-open", days: EVERY_DAY },
      { name: "Cold shower", icon: "sparkles", days: EVERY_DAY },
      { name: "Sleep by 11 PM", icon: "bed", days: EVERY_DAY },
      { name: "Journal", icon: "pen-line", days: EVERY_DAY, isPrivate: true },
    ],
  },
  {
    id: "seed-sam",
    name: "Sam Chen",
    email: "sam@compete.test",
    username: "sam_chen",
    consistency: 0.8,
    streakDays: 2,
    doneToday: 2,
    habits: [
      { name: "Gym", icon: "dumbbell", days: WEEKDAYS },
      { name: "Code for an hour", icon: "code", days: WEEKDAYS },
      { name: "Walk", icon: "footprints", days: EVERY_DAY, target: 30, unit: "minutes" },
      { name: "Vitamins", icon: "pill", days: EVERY_DAY },
    ],
  },
  {
    id: "seed-maya",
    name: "Maya Patel",
    email: "maya@compete.test",
    username: "maya",
    consistency: 0.7,
    streakDays: 1,
    doneToday: 1,
    habits: [
      { name: "Yoga", icon: "heart", days: EVERY_DAY },
      { name: "Practice guitar", icon: "music", days: [1, 3, 5] },
      { name: "Drink water", icon: "droplets", days: EVERY_DAY, target: 8, unit: "glasses" },
      { name: "Gratitude list", icon: "smile", days: EVERY_DAY, isPrivate: true },
    ],
  },
  {
    id: "seed-jordan",
    name: "Jordan Lee",
    email: "jordan@compete.test",
    username: "jordan",
    consistency: 0.55,
    streakDays: 0,
    doneToday: 0,
    habits: [
      { name: "Read the news", icon: "book-open", days: EVERY_DAY },
      { name: "Bike to work", icon: "bike", days: WEEKDAYS },
      { name: "Budget check", icon: "wallet", days: [6] },
    ],
  },
  {
    id: "seed-riley",
    name: "Riley Brooks",
    email: "riley@compete.test",
    username: "riley",
    consistency: 0.65,
    streakDays: 3,
    doneToday: 1,
    habits: [
      { name: "Meditate", icon: "brain", days: EVERY_DAY },
      { name: "Learn French", icon: "languages", days: WEEKDAYS },
      { name: "Walk the dog", icon: "footprints", days: EVERY_DAY },
    ],
  },
];

const friendships: { from: string; to: string; status: "ACCEPTED" | "PENDING" }[] = [
  { from: "seed-alex", to: "dev-user", status: "ACCEPTED" },
  { from: "dev-user", to: "seed-sam", status: "ACCEPTED" },
  { from: "seed-maya", to: "dev-user", status: "ACCEPTED" },
  { from: "seed-jordan", to: "dev-user", status: "PENDING" }, // incoming request for the Dev User
  { from: "dev-user", to: "seed-riley", status: "PENDING" }, // sent by the Dev User
  { from: "seed-alex", to: "seed-sam", status: "ACCEPTED" },
  { from: "seed-alex", to: "seed-maya", status: "ACCEPTED" },
  { from: "seed-sam", to: "seed-maya", status: "ACCEPTED" },
  { from: "seed-maya", to: "seed-riley", status: "ACCEPTED" },
  { from: "seed-jordan", to: "seed-riley", status: "ACCEPTED" },
];

/** A plausible time of day on `day` (never in the future). */
function timeOn(day: DateStr, today: DateStr): Date {
  const hour = 7 + Math.floor(random() * 14);
  const at = new Date(`${day}T${String(hour).padStart(2, "0")}:${String(Math.floor(random() * 60)).padStart(2, "0")}:00+05:00`);
  if (day === today) return new Date(Date.now() - Math.floor(random() * 5 * 3_600_000) - 60_000);
  return at;
}

async function main() {
  const today = dayIn(TIMEZONE);
  const createdAt = new Date(Date.now() - (HISTORY_DAYS + 7) * 86_400_000);
  console.log(`Seeding test data (timezone ${TIMEZONE}, today ${today})…`);

  // 1. Clear previous test data (cascades to habits, check-ins, friendships, challenges…)
  const removed = await prisma.user.deleteMany({
    where: { OR: [{ id: "dev-user" }, { email: { endsWith: "@compete.test" } }] },
  });
  console.log(`  removed ${removed.count} old test users`);

  // 2. Users with a password, so they can also sign in normally
  const passwordHash = await hashPassword(TEST_PASSWORD);
  for (const user of users) {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        timezone: TIMEZONE,
        emailVerified: true,
        createdAt,
        accounts: {
          create: { id: `${user.id}-credential`, accountId: user.id, providerId: "credential", password: passwordHash },
        },
      },
    });
  }

  // 3. Habits and check-ins
  let checkInCount = 0;
  for (const user of users) {
    const habits = [];
    for (const [order, habit] of user.habits.entries()) {
      habits.push({
        seed: habit,
        row: await prisma.habit.create({
          data: {
            userId: user.id,
            name: habit.name,
            icon: habit.icon,
            days: habit.days,
            target: habit.target ?? 1,
            unit: habit.unit ?? null,
            isPrivate: habit.isPrivate ?? false,
            sortOrder: order,
            createdAt,
            archivedAt: habit.archivedDaysAgo ? toDbDate(addDays(today, -habit.archivedDaysAgo)) : null,
          },
        }),
      });
    }

    const rows: { habitId: string; userId: string; date: Date; value: number; createdAt: Date; updatedAt: Date }[] = [];
    for (let back = HISTORY_DAYS; back >= 0; back -= 1) {
      const day = addDays(today, -back);
      const scheduled = habits.filter(
        ({ seed }) => seed.days.includes(weekdayIndex(day)) && (!seed.archivedDaysAgo || back > seed.archivedDaysAgo),
      );
      scheduled.forEach(({ seed, row }, index) => {
        const target = seed.target ?? 1;
        let done: boolean;
        if (back === 0) done = index < user.doneToday;
        else if (back <= user.streakDays) done = true;
        else done = random() < user.consistency;

        let value = done ? target : 0;
        if (!done && target > 1 && random() < 0.6) value = 1 + Math.floor(random() * (target - 1)); // partly done
        if (value === 0) return;
        const at = timeOn(day, today);
        rows.push({ habitId: row.id, userId: user.id, date: toDbDate(day), value, createdAt: at, updatedAt: at });
      });
    }
    await prisma.checkIn.createMany({ data: rows });
    checkInCount += rows.length;
  }
  console.log(`  created ${users.length} users and ${checkInCount} check-ins`);

  // 4. Friendships
  for (const link of friendships) {
    await prisma.friendship.create({
      data: {
        requesterId: link.from,
        addresseeId: link.to,
        status: link.status,
        createdAt: new Date(Date.now() - (link.status === "PENDING" ? 2 : 40) * 86_400_000),
        respondedAt: link.status === "ACCEPTED" ? new Date(Date.now() - 39 * 86_400_000) : null,
      },
    });
  }
  console.log(`  created ${friendships.length} friendships and requests`);

  // 5. Challenges
  type SeedChallenge = {
    title: string;
    description: string;
    icon: string;
    creatorId: string;
    startOffset: number; // days from today (negative = already started)
    length: number;
    joined: string[];
    invited?: string[];
    /** Share of elapsed days each participant checked in */
    rate?: Record<string, number>;
  };
  const challenges: SeedChallenge[] = [
    {
      title: "No sugar for 14 days",
      description: "No sweets, soda or desserts. Fruit is fine.",
      icon: "apple",
      creatorId: "seed-alex",
      startOffset: -6,
      length: 14,
      joined: ["seed-alex", "dev-user", "seed-sam", "seed-maya"],
      rate: { "seed-alex": 1, "dev-user": 0.7, "seed-sam": 0.85, "seed-maya": 0.5 },
    },
    {
      title: "Cold shower week",
      description: "At least 30 seconds of cold water every morning.",
      icon: "droplets",
      creatorId: "seed-maya",
      startOffset: -2,
      length: 7,
      joined: ["seed-maya", "seed-sam"],
      invited: ["dev-user"], // shows as an invite for the Dev User
      rate: { "seed-maya": 1, "seed-sam": 0.5 },
    },
    {
      title: "Walk 10,000 steps",
      description: "Every day, any pace. Treadmills count.",
      icon: "footprints",
      creatorId: "dev-user",
      startOffset: 3,
      length: 21,
      joined: ["dev-user", "seed-sam"],
      invited: ["seed-alex"],
    },
    {
      title: "Read every day",
      description: "At least 15 minutes of a real book.",
      icon: "book-open",
      creatorId: "seed-sam",
      startOffset: -20,
      length: 14,
      joined: ["seed-sam", "dev-user", "seed-alex"],
      rate: { "seed-sam": 0.85, "dev-user": 0.86, "seed-alex": 1 },
    },
  ];

  for (const challenge of challenges) {
    const startDate = addDays(today, challenge.startOffset);
    const endDate = addDays(startDate, challenge.length - 1);
    const created = await prisma.challenge.create({
      data: {
        title: challenge.title,
        description: challenge.description,
        icon: challenge.icon,
        creatorId: challenge.creatorId,
        startDate: toDbDate(startDate),
        endDate: toDbDate(endDate),
        createdAt: new Date(Date.now() - (Math.abs(challenge.startOffset) + 2) * 86_400_000),
        participants: {
          create: [
            ...challenge.joined.map((userId) => ({ userId, status: "JOINED" as const, joinedAt: new Date() })),
            ...(challenge.invited ?? []).map((userId) => ({ userId, status: "INVITED" as const })),
          ],
        },
      },
    });

    const lastDay = endDate < today ? endDate : addDays(today, -1); // leave today open for testing
    const checkIns: { challengeId: string; userId: string; date: Date }[] = [];
    for (const userId of challenge.joined) {
      const rate = challenge.rate?.[userId] ?? 0;
      for (let day = startDate; day <= lastDay; day = addDays(day, 1)) {
        if (random() < rate) checkIns.push({ challengeId: created.id, userId, date: toDbDate(day) });
      }
    }
    if (checkIns.length) await prisma.challengeCheckIn.createMany({ data: checkIns });
  }
  console.log(`  created ${challenges.length} challenges`);

  console.log(`Done. Sign in as any test user with dev login, or with their email and the password "${TEST_PASSWORD}".`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
