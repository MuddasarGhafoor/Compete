import type { Metadata } from "next";
import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { PageHeader } from "@/components/app/page-header";
import { PageSkeleton } from "@/components/app/require-session";
import { DeleteAccountButton, PasswordForm, ProfileForm, TimezoneForm } from "@/components/app/settings-forms";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getViewer } from "@/lib/data/core";

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
  const viewer = await getViewer();
  const zones = Intl.supportedValuesOf("timeZone");
  if (viewer.timezone && !zones.includes(viewer.timezone)) zones.unshift(viewer.timezone);

  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader title="Settings" description={`Signed in as ${viewer.email}.`} />

      <SettingsSection title="Profile" description="How you appear to friends.">
        <ProfileForm name={viewer.name} username={viewer.username} />
      </SettingsSection>

      <SettingsSection title="Time" description={`Today is ${viewer.today} in ${viewer.tz.replaceAll("_", " ")}.`}>
        <TimezoneForm timezone={viewer.timezone} zones={zones} />
      </SettingsSection>

      <SettingsSection title="Appearance">
        <Row title="Theme" description="Switch between light and dark mode.">
          <ThemeToggle />
        </Row>
      </SettingsSection>

      <SettingsSection title="Password">
        <PasswordForm disabled={viewer.isDevUser} />
      </SettingsSection>

      <SettingsSection title="Account">
        <Row title="Sign out" description="Sign out of Compete on this device.">
          <form action={signOut}>
            <Button type="submit" variant="outline" size="lg">
              <LogOut data-icon="inline-start" />
              Sign out
            </Button>
          </form>
        </Row>
        <Row title="Delete account" description="Permanently delete your account and everything in it.">
          <DeleteAccountButton isDevUser={viewer.isDevUser} />
        </Row>
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
      <Card className="mt-3 py-0">
        <CardContent className="divide-y">{children}</CardContent>
      </Card>
    </section>
  );
}

function Row({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
