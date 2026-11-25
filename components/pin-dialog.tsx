"use client";

import { useState, useTransition } from "react";
import { Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { setPin, unlockApp } from "@/app/actions/lock";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type PinDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "unlock" asks for the PIN; "create" asks for a new PIN twice. */
  mode: "unlock" | "create";
  /** For "create": lock the app as soon as the PIN is saved. */
  lockAfterCreate?: boolean;
};

function PinField({ value, onChange, disabled, onComplete }: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onComplete?: (value: string) => void;
}) {
  return (
    <InputOTP
      maxLength={4}
      pattern="^[0-9]*$"
      inputMode="numeric"
      autoFocus
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      disabled={disabled}
      containerClassName="justify-center"
      aria-label="4-digit PIN"
    >
      <InputOTPGroup className="gap-2.5">
        {[0, 1, 2, 3].map((index) => (
          <InputOTPSlot key={index} index={index} className="size-12 rounded-lg border text-lg first:rounded-lg last:rounded-lg" />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

export function PinDialog({ open, onOpenChange, mode, lockAfterCreate = false }: PinDialogProps) {
  const [pin, setPinValue] = useState("");
  const [first, setFirst] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setPinValue("");
    setFirst(null);
    setError(null);
  }

  function submitUnlock(value: string) {
    setError(null);
    startTransition(async () => {
      const result = await unlockApp(value);
      // Success redirects to /today; a returned result means the PIN was wrong.
      if (result && !result.ok) {
        setError(result.error);
        setPinValue("");
      }
    });
  }

  function submitCreate(value: string) {
    if (first === null) {
      setFirst(value);
      setPinValue("");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await setPin(first, value, lockAfterCreate);
      if (result && !result.ok) {
        setError(result.error);
        reset();
        return;
      }
      if (!lockAfterCreate) {
        toast.success("PIN saved");
        onOpenChange(false);
      }
    });
  }

  const creating = mode === "create";
  const title = creating ? (first === null ? "Create a PIN" : "Confirm your PIN") : "Enter your PIN";
  const description = creating
    ? first === null
      ? "Choose 4 digits. You'll use them to open the app after locking it."
      : "Enter the same 4 digits again."
    : "The app is locked. Enter your 4-digit PIN to open it.";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <span className="mb-2 grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <LockKeyhole className="size-5" />
          </span>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (pin.length === 4) (creating ? submitCreate : submitUnlock)(pin);
          }}
          className="space-y-4 py-2"
        >
          <PinField
            key={first === null ? "first" : "second"}
            value={pin}
            onChange={(value) => {
              setPinValue(value);
              setError(null);
            }}
            disabled={pending}
            onComplete={(value) => (creating ? submitCreate : submitUnlock)(value)}
          />
          <p className="min-h-5 text-center text-sm text-destructive" role="alert">
            {error}
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" size="lg" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={pending || pin.length < 4}>
              {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
              {creating ? (first === null ? "Next" : lockAfterCreate ? "Save and lock" : "Save PIN") : "Unlock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
