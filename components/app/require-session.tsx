import { requireUser } from "@/lib/session";

/**
 * Renders its children only for signed-in visitors (others go to /sign-in).
 * Reads the session, so wrap it in <Suspense> (see PageSkeleton).
 */
export async function RequireSession({ children }: { children: React.ReactNode }) {
  await requireUser();
  return children;
}

/** Loading placeholder for an app page while the session is read. */
export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-8" aria-hidden>
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-md bg-muted" />
        <div className="h-4 w-72 rounded bg-muted" />
      </div>
      <div className="h-64 rounded-xl bg-muted" />
    </div>
  );
}
