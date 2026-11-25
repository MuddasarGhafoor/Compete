"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
};

/** A form submit button that shows a spinner while its form's action runs. */
export function SubmitButton({ children, pendingText, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending} className={cn("h-10 w-full", className)}>
      {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
      {pending ? pendingText : children}
    </Button>
  );
}
