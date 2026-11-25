type PageHeaderProps = {
  title: string;
  description?: React.ReactNode;
  /** Small label next to the title, e.g. a "Phase 2" badge. */
  badge?: React.ReactNode;
  /** Buttons on the right (below the title on phones). */
  actions?: React.ReactNode;
};

/** The title row at the top of every app page. */
export function PageHeader({ title, description, badge, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          {badge}
        </div>
        {description && <p className="mt-1.5 text-pretty text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
