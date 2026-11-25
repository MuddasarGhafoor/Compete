import type { Metadata } from "next";
import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { PageHeader } from "@/components/app/page-header";
import { PinSettings } from "@/components/app/pin-settings";
import { PageSkeleton } from "@/components/app/require-session";
import { DeleteAccountButton, PasswordForm, ProfileForm, TimezoneForm } from "@/components/app/settings-forms";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getViewer } from "@/lib/data/core";
import { formatDay } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

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
  const security = await prisma.user.findUnique({ where: { id: viewer.id }, select: { pinHash: true } });
  const zones = Intl.supportedValuesOf("timeZone");
  if (viewer.timezone && !zones.includes(viewer.timezone)) zones.unshift(viewer.timezone);

  return (
    <div className="space-y-10">
      <PageHeader title="Settings" description={`Signed in as ${viewer.email}.`} />

      <div className="divide-y border-t">
        <SettingsSection title="Profile" description="How you appear to friends. Your username is how they find you.">
          <ProfileForm name={viewer.name} username={viewer.username} />
        </SettingsSection>

        <SettingsSection
          title="Time"
          description={`It's ${formatDay(viewer.today, { weekday: "long", month: "long", day: "numeric" })} in ${viewer.tz.replaceAll("_", " ")}. Your timezone decides when each day starts.`}
        >
          <TimezoneForm timezone={viewer.timezone} zones={zones} />
        </SettingsSection>

        <SettingsSection title="App lock" description="Lock the app with a PIN instead of signing out. Handy on a shared device.">
          <PinSettings hasPin={Boolean(security?.pinHash)} />
        </SettingsSection>

        <SettingsSection title="Appearance" description="Light or dark. Until you choose, it follows your device.">
          <Row title="Theme" description="Switch between light and dark mode.">
            <ThemeToggle />
          </Row>
        </SettingsSection>

        <SettingsSection title="Password" description="Changing it signs you out on your other devices.">
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
    </div>
  );
}

/** Title and description on the left, the settings card on the right (stacks on phones). */
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
    <section className="grid gap-4 py-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-12">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-pretty text-muted-foreground">{description}</p>}
      </div>
      <Card className="py-0">
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
