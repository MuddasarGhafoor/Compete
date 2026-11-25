import { Container } from "@/components/container";
import { TodayPreview } from "@/components/marketing-previews";
import { SiteHeader } from "@/components/site-header";

// Same header and Container width as the rest of the site.

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />

      <main className="flex flex-1">
        <Container className="grid flex-1 gap-10 py-10 sm:py-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: brand panel (desktop only) */}
          <aside className="hidden rounded-xl border bg-secondary p-10 lg:flex lg:flex-col lg:justify-center xl:p-14">
            <div className="max-w-md">
              <h2 className="font-display text-4xl leading-tight font-medium tracking-tight text-balance">
                A little friendly competition goes a long way.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Track your habits, keep your streak, and see how you stack up against friends
                each week.
              </p>
            </div>
            <TodayPreview compact className="mt-10 max-w-sm" />
          </aside>

          {/* Right: the form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-sm">{children}</div>
          </div>
        </Container>
      </main>
    </>
  );
}
