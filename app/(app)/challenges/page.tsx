import type { Metadata } from "next";
import { Suspense } from "react";
import { Swords } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { PageSkeleton, RequireSession } from "@/components/app/require-session";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Challenges",
};

export default function ChallengesPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <RequireSession>
        <div className="space-y-8">
          <PageHeader
            title="Challenges"
            badge={<Badge variant="secondary">Phase 3</Badge>}
            description="Everyone tracks the same habit for a set time."
          />
          <EmptyState
            icon={Swords}
            title="Challenges come later"
            description="Pick one habit and a time frame, like no sugar for 14 days, invite friends, and see who sticks with it."
          />
        </div>
      </RequireSession>
    </Suspense>
  );
}
