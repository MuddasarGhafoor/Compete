import type { Metadata } from "next";
import { Suspense } from "react";
import { Trophy } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { PageSkeleton, RequireSession } from "@/components/app/require-session";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Leaderboard",
};

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <RequireSession>
        <div className="space-y-8">
          <PageHeader
            title="Leaderboard"
            badge={<Badge variant="secondary">Phase 2</Badge>}
            description="You and your friends, ranked by this week's consistency."
          />
          <EmptyState
            icon={Trophy}
            title="The weekly leaderboard is coming"
            description="Once you've added friends, you'll see who's most consistent this week. It resets every Monday."
          />
        </div>
      </RequireSession>
    </Suspense>
  );
}
