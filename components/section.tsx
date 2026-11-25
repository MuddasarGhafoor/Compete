import { Container } from "@/components/container";
import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  title?: string;
  intro?: string;
  className?: string;
  children: React.ReactNode;
};

/** A landing page section with the same width, padding and heading style everywhere. */
export function Section({ id, title, intro, className, children }: SectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-16 border-t", className)}>
      <Container className="py-16 sm:py-24">
        {title && <SectionHeading title={title} intro={intro} />}
        <div className={cn(title && "mt-12")}>{children}</div>
      </Container>
    </section>
  );
}

export function SectionHeading({ title, intro }: { title: string; intro?: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-3xl font-medium tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {intro && <p className="mt-4 text-pretty text-muted-foreground">{intro}</p>}
    </div>
  );
}
