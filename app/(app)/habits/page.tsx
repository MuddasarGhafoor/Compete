import type { Metadata } from "next";
import { Suspense } from "react";
import { ListChecks } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { PageSkeleton, RequireSession } from "@/components/app/require-session";

export const metadata: Metadata = {
  title: "Habits",
};

export default function HabitsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <RequireSession>
        <div className="space-y-8">
          <PageHeader
            title="Habits"
            description="The routine you're building: what you track, and on which days."
          />
          <EmptyState
            icon={ListChecks}
            title="Your habits will live here"
            description="Next step: add habits with an icon, pick the days they apply, and choose whether friends can see them."
          />
        </div>
      </RequireSession>
    </Suspense>
  );
}
