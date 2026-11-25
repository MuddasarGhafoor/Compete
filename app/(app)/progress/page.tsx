import type { Metadata } from "next";
import { Suspense } from "react";
import { ChartColumn } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { PageSkeleton, RequireSession } from "@/components/app/require-session";

export const metadata: Metadata = {
  title: "Progress",
};

export default function ProgressPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <RequireSession>
        <div className="space-y-8">
          <PageHeader
            title="Progress"
            description="How consistent you've been, day by day and week by week."
          />
          <EmptyState
            icon={ChartColumn}
            title="Your stats start with your first check-in"
            description="Daily and weekly charts, a calendar heatmap and per-habit streaks will show up here once you've tracked a few days."
          />
        </div>
      </RequireSession>
    </Suspense>
  );
}
