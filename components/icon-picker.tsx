"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { HabitIcon, habitIconNames } from "@/components/habit-icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type IconPickerProps = {
  value: string;
  onChange: (icon: string) => void;
};

/** A compact icon button that opens a grid of icons to choose from. */
export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Choose an icon"
        className="flex h-10 shrink-0 items-center gap-1 rounded-lg border bg-card pr-2 pl-2.5 text-primary outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted"
      >
        <HabitIcon name={value} className="size-5" />
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3">
        <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">Choose an icon</p>
        <div className="grid grid-cols-6 gap-1" role="radiogroup" aria-label="Icon">
          {habitIconNames.map((name) => {
            const selected = value === name;
            return (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={name.replace("-", " ")}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
                className={cn(
                  "grid size-10 place-items-center rounded-lg transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  selected ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <HabitIcon name={name} className="size-[18px]" />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
