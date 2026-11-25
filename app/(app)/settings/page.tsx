import type { Metadata } from "next";
import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { PageHeader } from "@/components/app/page-header";
import { PageSkeleton } from "@/components/app/require-session";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent() {
  const user = await requireUser();

  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader title="Settings" description="Your account and preferences." />

      <SettingsSection title="Profile" description="Editing your name, username and timezone comes later.">
        <SettingsRow label="Name" value={user.name} />
        <SettingsRow label="Email" value={user.email} />
      </SettingsSection>

      <SettingsSection title="Appearance">
        <div className="flex items-center justify-between gap-4 py-4">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-sm text-muted-foreground">Switch between light and dark mode.</p>
          </div>
          <ThemeToggle />
        </div>
      </SettingsSection>

      <SettingsSection title="Account">
        <div className="flex items-center justify-between gap-4 py-4">
          <div>
            <p className="text-sm font-medium">Sign out</p>
            <p className="text-sm text-muted-foreground">Sign out of Compete on this device.</p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="lg">
              <LogOut data-icon="inline-start" />
              Sign out
            </Button>
          </form>
        </div>
      </SettingsSection>
    </div>
  );
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <Card className="mt-3">
        <CardContent className="divide-y py-0">{children}</CardContent>
      </Card>
    </section>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium">{label}</p>
      <p className="truncate text-sm text-muted-foreground">{value}</p>
    </div>
  );
}
