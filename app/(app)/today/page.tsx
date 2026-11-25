import type { Metadata } from "next";
import { Suspense } from "react";
import { Flame, ListPlus, Target, Trophy, type LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Today",
};

export default function TodayPage() {
  return (
    // Reads the session, so it streams in behind a Suspense boundary.
    <Suspense fallback={<TodaySkeleton />}>
      <TodayContent />
    </Suspense>
  );
}

async function TodayContent() {
  const user = await requireUser();
  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <PageHeader title="Today" description={`Welcome back, ${firstName}.`} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Target} label="Today's progress" value="0%" hint="No habits scheduled yet" />
        <StatCard icon={Flame} label="Current streak" value="0 days" hint="Finish a day to start one" />
        <StatCard icon={Trophy} label="This week" value="—" hint="Leaderboard arrives in Phase 2" />
      </div>

      <EmptyState
        icon={ListPlus}
        title="No habits yet"
        description="Habits are the next feature we're building. Once they're in, your daily routine shows up here, ready to check off."
      />
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
        <div className="h-8 w-40 rounded-md bg-muted" />
        <div className="h-4 w-56 rounded bg-muted" />
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
