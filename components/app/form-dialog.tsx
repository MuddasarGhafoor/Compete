"use client";

import { CircleAlert, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/*
 * Shared layout for form dialogs: fixed header, scrolling body, fixed footer.
 * Use inside <DialogContent className={formDialogContent}>.
 */
export const formDialogContent = "flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg";

export function FormDialogHeader({ title, description }: { title: string; description: string }) {
  return (
    <DialogHeader className="border-b px-6 pt-6 pb-4">
      <DialogTitle className="text-lg">{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </DialogHeader>
  );
}

/** Scrolling area with even spacing between sections. */
export function FormDialogBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5", className)}>{children}</div>;
}

/** One labelled section of a form dialog. */
export function FormSection({
  label,
  hint,
  htmlFor,
  aside,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  /** Small controls on the right of the label (e.g. presets). */
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2.5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <label htmlFor={htmlFor} className="text-sm font-medium">
            {label}
          </label>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function FormDialogFooter({
  error,
  pending,
  submitLabel,
}: {
  error: string | null;
  pending: boolean;
  submitLabel: string;
}) {
  return (
    <div className="space-y-3 border-t bg-muted/40 px-6 py-4">
      {error && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <DialogClose render={<Button type="button" variant="outline" size="lg" />}>Cancel</DialogClose>
        <Button type="submit" size="lg" disabled={pending}>
          {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
