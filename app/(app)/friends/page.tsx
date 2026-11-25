import type { Metadata } from "next";
import { Suspense } from "react";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { PageSkeleton, RequireSession } from "@/components/app/require-session";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Friends",
};

export default function FriendsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <RequireSession>
        <div className="space-y-8">
          <PageHeader
            title="Friends"
            badge={<Badge variant="secondary">Phase 2</Badge>}
            description="The people you compete with."
          />
          <EmptyState
            icon={Users}
            title="Friends are coming soon"
            description="You'll be able to find people by username, send friend requests, and see each other on the weekly leaderboard."
          />
        </div>
      </RequireSession>
    </Suspense>
  );
}
