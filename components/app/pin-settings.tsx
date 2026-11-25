"use client";

import { useState, useTransition } from "react";
import { KeyRound, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { lockApp, removePin } from "@/app/actions/lock";
import { PinDialog } from "@/components/pin-dialog";
import { Button } from "@/components/ui/button";

/** Set, change or remove the 4-digit PIN used to unlock the app. */
export function PinSettings({ hasPin }: { hasPin: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
          <KeyRound className="size-4" />
        </span>
        <div>
          <p className="text-sm font-medium">{hasPin ? "PIN is set" : "No PIN yet"}</p>
          <p className="text-sm text-muted-foreground">
            {hasPin
              ? "Lock closes the app; your PIN opens it again. 5 wrong tries sign you out."
              : "Set a 4-digit PIN to lock the app without signing out."}
          </p>
        </div>
      </div>
      {/* Buttons sit under the text, lined up with it */}
      <div className="flex flex-wrap gap-2 sm:pl-12">
        <Button variant="outline" size="lg" onClick={() => setOpen(true)}>
          <KeyRound data-icon="inline-start" />
          {hasPin ? "Change PIN" : "Set PIN"}
        </Button>
        {hasPin && (
          <>
            <Button
              variant="outline"
              size="lg"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await lockApp();
                  if (result && !result.ok) toast.error(result.error);
                })
              }
            >
              <Lock data-icon="inline-start" />
              Lock now
            </Button>
            <Button
              variant="ghost"
              size="lg"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await removePin();
                  if (!result.ok) toast.error(result.error);
                  else toast.success(result.message ?? "PIN removed");
                })
              }
            >
              <Trash2 data-icon="inline-start" />
              Remove
            </Button>
          </>
        )}
      </div>
      <PinDialog open={open} onOpenChange={setOpen} mode="create" />
    </div>
  );
}
