import type { Metadata } from "next";
import { Suspense } from "react";
import { signOut } from "@/app/actions/auth";
import { Logo } from "@/components/logo";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Today",
};

export default function TodayPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-10">
      <Logo />

      {/* Reads the session, so it streams in behind a Suspense boundary. */}
      <Suspense fallback={<TodaySkeleton />}>
        <TodayContent />
      </Suspense>
    </main>
  );
}

async function TodayContent() {
  const user = await requireUser();

  return (
    <>
      <header className="mt-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">Welcome back</p>
          <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            Sign out
          </button>
        </form>
      </header>

      <section className="mt-8 rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <p className="text-3xl" aria-hidden>
          🌱
        </p>
        <p className="mt-3 font-semibold">No habits yet</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Adding habits is the next feature we&apos;ll build.
        </p>
      </section>
    </>
  );
}

function TodaySkeleton() {
  return (
    <div className="mt-8 animate-pulse space-y-8" aria-hidden>
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-7 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="h-40 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
