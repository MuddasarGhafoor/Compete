import type { Metadata } from "next";
import { Suspense } from "react";
import { Flame, ListPlus, Target, Trophy, type LucideIcon } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Container } from "@/components/container";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Today",
};

export default function TodayPage() {
  return (
    <>
      <AppHeader />
      <main className="flex-1">
        <Container className="py-10 sm:py-12">
          {/* Reads the session, so it streams in behind a Suspense boundary. */}
          <Suspense fallback={<TodaySkeleton />}>
            <TodayContent />
          </Suspense>
        </Container>
      </main>
    </>
  );
}

async function TodayContent() {
  const user = await requireUser();
  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Today</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome back, {firstName}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Target} label="Today's progress" value="0%" hint="No habits scheduled yet" />
        <StatCard icon={Flame} label="Current streak" value="0 days" hint="Finish a day to start one" />
        <StatCard icon={Trophy} label="This week" value="—" hint="Leaderboard arrives in Phase 2" />
      </div>

      <Card>
        <CardContent className="flex flex-col items-center px-6 py-12 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <ListPlus className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">No habits yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Habits are the next feature we&apos;re building. Once they&apos;re in, your daily
            routine shows up here, ready to check off.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card size="sm">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TodaySkeleton() {
  return (
    <div className="animate-pulse space-y-8" aria-hidden>
      <div className="space-y-2">
        <div className="h-4 w-16 rounded bg-muted" />
        <div className="h-8 w-64 rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div key={key} className="h-28 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-56 rounded-xl bg-muted" />
    </div>
  );
}
