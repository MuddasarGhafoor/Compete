"use client";

import { useState, useTransition } from "react";
import { CircleAlert, Loader2, LocateFixed, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { changePassword, deleteAccount, setTimezone, updateProfile } from "@/app/actions/profile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ActionResult } from "@/lib/validation";

function useFormAction() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const run = (action: () => Promise<ActionResult>, onSuccess?: () => void) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.message) toast.success(result.message);
      onSuccess?.();
    });
  };
  return { error, pending, run };
}

function FormError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <Alert variant="destructive">
      <CircleAlert />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}

function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
      {children}
    </Button>
  );
}

export function ProfileForm({ name, username }: { name: string; username: string | null }) {
  const [values, setValues] = useState({ name, username: username ?? "" });
  const { error, pending, run } = useFormAction();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        run(() => updateProfile(values));
      }}
      className="space-y-4 py-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="profile-name">Name</Label>
          <Input
            id="profile-name"
            value={values.name}
            onChange={(event) => setValues({ ...values, name: event.target.value })}
            maxLength={50}
            required
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-username">Username</Label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">@</span>
            <Input
              id="profile-username"
              value={values.username}
              onChange={(event) => setValues({ ...values, username: event.target.value })}
              placeholder="alex_runs"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={21}
              required
              className="h-10 pl-7"
            />
          </div>
          <p className="text-xs text-muted-foreground">Friends find you by this. Lowercase letters, numbers and _.</p>
        </div>
      </div>
      <FormError error={error} />
      <div className="flex justify-end">
        <SubmitButton pending={pending}>Save profile</SubmitButton>
      </div>
    </form>
  );
}

export function TimezoneForm({ timezone, zones }: { timezone: string | null; zones: string[] }) {
  const [value, setValue] = useState(timezone ?? "UTC");
  const { error, pending, run } = useFormAction();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        run(() => setTimezone(value));
      }}
      className="space-y-4 py-4"
    >
      <div className="space-y-2">
        <Label>Timezone</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={value} onValueChange={(next) => next && setValue(next)}>
            <SelectTrigger className="h-10 w-full sm:max-w-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {zones.map((zone) => (
                <SelectItem key={zone} value={zone}>
                  {zone.replaceAll("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-10"
            onClick={() => setValue(Intl.DateTimeFormat().resolvedOptions().timeZone)}
          >
            <LocateFixed data-icon="inline-start" />
            Detect from this device
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Decides when your day starts and ends, so check-ins land on the right date.</p>
      </div>
      <FormError error={error} />
      <div className="flex justify-end">
        <SubmitButton pending={pending}>Save timezone</SubmitButton>
      </div>
    </form>
  );
}

export function PasswordForm({ disabled }: { disabled?: boolean }) {
  const [values, setValues] = useState({ currentPassword: "", newPassword: "" });
  const { error, pending, run } = useFormAction();

  if (disabled) {
    return <p className="py-4 text-sm text-muted-foreground">The dev login user has no password.</p>;
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        run(() => changePassword(values), () => setValues({ currentPassword: "", newPassword: "" }));
      }}
      className="space-y-4 py-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="current-password">Current password</Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={values.currentPassword}
            onChange={(event) => setValues({ ...values, currentPassword: event.target.value })}
            required
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={values.newPassword}
            onChange={(event) => setValues({ ...values, newPassword: event.target.value })}
            required
            className="h-10"
          />
        </div>
      </div>
      <FormError error={error} />
      <div className="flex justify-end">
        <SubmitButton pending={pending}>Change password</SubmitButton>
      </div>
    </form>
  );
}

export function DeleteAccountButton({ isDevUser }: { isDevUser?: boolean }) {
  const [password, setPassword] = useState("");
  const { error, pending, run } = useFormAction();

  return (
    <AlertDialog onOpenChange={() => setPassword("")}>
      <AlertDialogTrigger render={<Button variant="destructive" size="lg" />}>
        <Trash2 data-icon="inline-start" />
        Delete account
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            run(() => deleteAccount({ password }));
          }}
          className="grid gap-4"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              Your habits, check-ins, friends and challenges are deleted for good. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!isDevUser && (
            <div className="space-y-2">
              <Label htmlFor="delete-password">Enter your password to confirm</Label>
              <Input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="h-10"
              />
            </div>
          )}
          <FormError error={error} />
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
              Delete forever
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
