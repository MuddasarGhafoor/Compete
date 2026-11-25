import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/session";

const features = [
  { icon: "✅", title: "Track your routine", text: "Check off your daily habits in seconds." },
  { icon: "🔥", title: "Keep your streaks", text: "See how many days in a row you stay on track." },
  { icon: "🏆", title: "Compete with friends", text: "A weekly leaderboard shows who's most consistent." },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-10">
      <Logo />

      <section className="flex flex-1 flex-col justify-center gap-10 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Build your routine.
            <br />
            <span className="text-emerald-600 dark:text-emerald-400">Beat your friends.</span>
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Track your daily habits, keep your streaks alive, and see who&apos;s the most
            consistent this week.
          </p>
        </div>

        <ul className="space-y-4">
          {features.map((feature) => (
            <li key={feature.title} className="flex gap-4">
              <span className="text-2xl" aria-hidden>
                {feature.icon}
              </span>
              <div>
                <p className="font-semibold">{feature.title}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{feature.text}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Reads the session cookie, so it streams in behind a Suspense boundary. */}
        <Suspense fallback={<GuestActions />}>
          <HomeActions />
        </Suspense>
      </section>
    </main>
  );
}

async function HomeActions() {
  const user = await getCurrentUser();
  if (!user) return <GuestActions />;

  return (
    <Link href="/today" className={primaryButton}>
      Continue as {user.name}
    </Link>
  );
}

function GuestActions() {
  return (
    <div className="flex flex-col gap-3">
      <Link href="/sign-up" className={primaryButton}>
        Get started
      </Link>
      <Link
        href="/sign-in"
        className="rounded-xl border border-zinc-300 px-4 py-3 text-center font-semibold transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        Sign in
      </Link>
    </div>
  );
}

const primaryButton =
  "rounded-xl bg-emerald-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-emerald-700";
