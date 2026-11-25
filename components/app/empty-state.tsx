import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: React.ReactNode;
  /** Optional button or link under the text. */
  children?: React.ReactNode;
  className?: string;
};

/** A friendly placeholder for pages or sections with nothing to show yet. */
export function EmptyState({ icon: Icon, title, description, children, className }: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className={cn("flex flex-col items-center px-6 py-14 text-center")}>
        <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-6" />
        </span>
        <h2 className="mt-4 text-lg font-semibold">{title}</h2>
        <p className="mt-1 max-w-md text-sm text-pretty text-muted-foreground">{description}</p>
        {children && <div className="mt-6">{children}</div>}
      </CardContent>
    </Card>
  );
}
