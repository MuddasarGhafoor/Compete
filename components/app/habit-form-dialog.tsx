"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createHabit, updateHabit, type HabitInput } from "@/app/actions/habits";
import {
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
  FormSection,
  formDialogContent,
} from "@/components/app/form-dialog";
import { IconPicker } from "@/components/icon-picker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { WEEKDAY_SHORT } from "@/lib/dates";
import { cn } from "@/lib/utils";

export type EditableHabit = HabitInput & { id: string };

const EMPTY: HabitInput = {
  name: "",
  icon: "circle-check",
  days: [0, 1, 2, 3, 4, 5, 6],
  target: 1,
  unit: "",
  isPrivate: false,
};

const presets = [
  { label: "Every day", days: [0, 1, 2, 3, 4, 5, 6] },
  { label: "Weekdays", days: [0, 1, 2, 3, 4] },
  { label: "Weekends", days: [5, 6] },
];

type HabitFormDialogProps = {
  /** Pass a habit to edit it; leave out to create a new one. */
  habit?: EditableHabit;
  /** The button that opens the dialog. */
  trigger: React.ReactElement;
};

export function HabitFormDialog({ habit, trigger }: HabitFormDialogProps) {
  const initial = habit ? { ...habit, unit: habit.unit ?? "" } : EMPTY;
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<HabitInput>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const tracksNumber = values.target > 1;
  const sortedDays = [...values.days].sort().join();

  const update = (patch: Partial<HabitInput>) => setValues((current) => ({ ...current, ...patch }));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = habit ? await updateHabit(habit.id, values) : await createHabit(values);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success(result.message ?? "Saved");
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setValues(initial);
          setError(null);
        }
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent className={formDialogContent}>
        <FormDialogHeader
          title={habit ? "Edit habit" : "New habit"}
          description={habit ? "Changes also apply to past days." : "Something you want to do more often."}
        />

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <FormDialogBody>
            <FormSection label="Name and icon" htmlFor="habit-name">
              <div className="flex gap-2">
                <IconPicker value={values.icon} onChange={(icon) => update({ icon })} />
                <Input
                  id="habit-name"
                  value={values.name}
                  onChange={(event) => update({ name: event.target.value })}
                  placeholder="Read 20 pages"
                  maxLength={60}
                  required
                  autoFocus
                  className="h-10 flex-1"
                />
              </div>
            </FormSection>

            <FormSection
              label="Days"
              hint="Only scheduled days count toward your score."
              aside={
                <div className="flex gap-1">
                  {presets.map((preset) => (
                    <Button
                      key={preset.label}
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => update({ days: preset.days })}
                      className={cn(sortedDays === preset.days.join() && "bg-muted text-foreground")}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              }
            >
              <ToggleGroup
                multiple
                variant="outline"
                spacing={1}
                value={values.days.map(String)}
                onValueChange={(next) => update({ days: next.map(Number) })}
                className="grid w-full grid-cols-7"
                aria-label="Days of the week"
              >
                {WEEKDAY_SHORT.map((label, index) => (
                  <ToggleGroupItem
                    key={label}
                    value={String(index)}
                    className="h-10 w-full text-xs data-pressed:border-primary data-pressed:bg-primary data-pressed:text-primary-foreground"
                  >
                    {label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FormSection>

            <FormSection label="Options">
              <div className="divide-y rounded-xl border">
                <div className="space-y-4 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label htmlFor="habit-number">Track a number</Label>
                      <p className="mt-0.5 text-xs text-muted-foreground">Like 8 glasses of water or 30 minutes.</p>
                    </div>
                    <Switch
                      id="habit-number"
                      checked={tracksNumber}
                      onCheckedChange={(checked) => update({ target: checked ? Math.max(values.target, 8) : 1 })}
                    />
                  </div>
                  {tracksNumber && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="habit-target" className="text-xs text-muted-foreground">
                          Daily target
                        </Label>
                        <Input
                          id="habit-target"
                          type="number"
                          inputMode="numeric"
                          min={2}
                          max={1000}
                          value={values.target}
                          onChange={(event) => update({ target: Number(event.target.value) || 2 })}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="habit-unit" className="text-xs text-muted-foreground">
                          Unit (optional)
                        </Label>
                        <Input
                          id="habit-unit"
                          value={values.unit}
                          onChange={(event) => update({ unit: event.target.value })}
                          placeholder="glasses"
                          maxLength={20}
                          className="h-10"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <Label htmlFor="habit-private">Hide name from friends</Label>
                    <p className="mt-0.5 text-xs text-muted-foreground">It still counts toward your score.</p>
                  </div>
                  <Switch
                    id="habit-private"
                    checked={values.isPrivate}
                    onCheckedChange={(checked) => update({ isPrivate: checked })}
                  />
                </div>
              </div>
            </FormSection>
          </FormDialogBody>

          <FormDialogFooter error={error} pending={pending} submitLabel={habit ? "Save changes" : "Add habit"} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
