# Compete

A habit tracker with friendly competition. Track your daily routine, connect with friends, and see who is keeping their habits best each week.

> **Status:** in active development. Solo tracking, the social features, challenges and the extras are built and run locally. Reminders and deploying online are next (see [Roadmap](#roadmap)).

## Features

**Daily tracking**
- Today page with a Today / Yesterday switch, a week strip and a checklist that updates instantly.
- Habits are either done / not done, or a number target with an optional unit (e.g. 8 glasses).
- Each habit has an icon, a schedule (every day or chosen weekdays) and can be private.
- Only today and yesterday can be logged (for forgotten check-ins).

**Habits and progress**
- Habit list with 14-day dots, streaks and 30-day completion rate; add, edit, reorder, archive, restore or delete.
- Progress page: stat tiles, 7 / 30-day bar chart, 12-week trend, 6-month heatmap, achievements and a per-habit table.

**Competing with friends**
- Mutual friend requests (both people must accept), search by name or username.
- Weekly leaderboard (this week and last week, change from the week before, comparison chart). It resets every Monday.
- Friend profiles with a head-to-head chart. Private habits only show as "a private habit".
- Shared challenges: invite friends to track the same habit for a set period, with daily check-ins, standings and a day grid.
- Friends' activity feed on the Today page.

**Account**
- Email and password sign-in.
- App lock: lock the app with a PIN instead of signing out (handy on a shared device). Five wrong tries sign you out.
- Settings for profile and username, timezone (auto-detected; it decides when your day starts), app lock, theme, password and deleting the account.
- Light and dark mode (follows the system until you choose).
- Mobile-first: a sidebar on desktop, a top bar and bottom tab bar on phones.

### How scoring works

- **Daily score:** the share of the day's scheduled habits you completed.
- **Weekly score:** the average of the daily scores for finished days. Today only counts once it reaches 100%, so checking things off never lowers your score. Days with nothing scheduled don't count.
- **Streak:** consecutive days at 100% (days with nothing scheduled are skipped; today doesn't break a streak while it's in progress).

Scores, streaks and achievements are computed from check-ins, never stored. All rules live in [`lib/stats.ts`](lib/stats.ts).

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Cache Components, Turbopack), React 19, TypeScript
- [Tailwind CSS v4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) on Base UI, [lucide](https://lucide.dev) icons, [Motion](https://motion.dev) for animation, Recharts for charts
- PostgreSQL on [Neon](https://neon.com), accessed with [Prisma 7](https://www.prisma.io) through `@prisma/adapter-pg`
- [Better Auth](https://www.better-auth.com) for email and password sign-in
- pnpm

## Getting started

### Prerequisites

- Node.js 20.9 or newer
- pnpm (`corepack enable` sets it up)
- A PostgreSQL database. The project uses Neon, but any Postgres works.

### Setup

1. Install dependencies (this also generates the Prisma client):

   ```bash
   pnpm install
   ```

2. Create `.env` from the example and fill it in:

   ```bash
   cp .env.example .env
   ```

   | Variable | What it is |
   | --- | --- |
   | `DATABASE_URL` | Pooled connection string, used by the app |
   | `DATABASE_URL_UNPOOLED` | Direct connection string, used by Prisma migrations |
   | `BETTER_AUTH_SECRET` | A random secret, e.g. from `openssl rand -base64 32` |
   | `BETTER_AUTH_URL` | The app's URL, `http://localhost:3000` locally |
   | `DEV_LOGIN` | `"true"` to enable the one-click dev login (development only) |

   With Neon, the CLI can link a project and write the database variables for you:

   ```bash
   pnpm dlx neon@latest link
   pnpm dlx neon@latest env pull
   ```

3. Create the database tables:

   ```bash
   pnpm exec prisma migrate deploy
   ```

4. Optionally, add test users and data (see below):

   ```bash
   pnpm db:seed
   ```

5. Start the dev server and open [http://localhost:3000](http://localhost:3000):

   ```bash
   pnpm run dev
   ```

### Test data and dev login

`pnpm db:seed` creates a Dev User plus five test users (`@compete.test` emails) with habits, about nine weeks of check-ins, friendships, pending requests and challenges. It can be re-run at any time and only replaces those test users. Real accounts are never touched. The shared test password is in [`prisma/seed.ts`](prisma/seed.ts).

With `DEV_LOGIN="true"` and `pnpm run dev`, a wrench icon in the site header signs you in as the Dev User in one click, and the account menu gets a **Switch test user** option. Dev login never works in production builds.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm run dev` | Start the development server |
| `pnpm build` | Build for production |
| `pnpm start` | Run the production build |
| `pnpm lint` | Run ESLint |
| `pnpm db:migrate --name <change>` | Create and apply a migration after editing `prisma/schema.prisma` |
| `pnpm db:seed` | Recreate the test users and data |
| `pnpm db:studio` | Open Prisma Studio to browse the database |
| `pnpm clean` | Delete `.next` (fixes a stale Turbopack cache) |

## Project structure

```
app/
  (app)/          signed-in pages: today, habits, progress, leaderboard, friends, challenges, settings
  (auth)/         sign-in and sign-up
  actions/        Server Actions (habits, check-ins, friends, challenges, profile, app lock)
  api/auth/       Better Auth route
  faq/            FAQ page
  page.tsx        landing page
components/
  app/            app shell (sidebar, tab bar) and app UI
  ui/             shadcn/ui components
lib/
  data/           data loading (viewer and activity, friends and standings, challenges)
  stats.ts        scoring, streaks and achievements
  dates.ts        day handling in the user's timezone
  auth.ts         Better Auth setup (including the app lock)
  prisma.ts       database client
prisma/
  schema.prisma   database schema
  migrations/     migration history
  seed.ts         test data
proxy.ts          redirects signed-out visitors away from app pages
```

## Development notes

- Dates are `"YYYY-MM-DD"` strings in the user's own timezone. Weeks start on Monday.
- Mutations are Server Actions: they validate input, check ownership, and return a result that the UI shows as a toast.
- Pages read the session inside `<Suspense>` (required by Cache Components).
- Every page loads its data in one parallel wave of small queries, so it costs a single database round trip. Check-ins are loaded packed, one row per habit, to keep results small. `partialPrefetching` is off in `next.config.ts` because it made every page render, and query, twice.

## Roadmap

- [x] Solo tracking: habits, check-ins, progress
- [x] Social: friends, leaderboard, activity feed, privacy
- [x] Challenges
- [x] Extras: achievements, app lock, dark mode, test data
- [ ] Reminders (push or email notifications)
- [ ] Deploy online
- [ ] Google sign-in (maybe)
