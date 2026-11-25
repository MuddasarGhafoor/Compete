import {
  Apple,
  Bed,
  Bike,
  BookOpen,
  Brain,
  CircleCheck,
  Code,
  Coffee,
  Droplets,
  Dumbbell,
  Flame,
  Footprints,
  Heart,
  Languages,
  Leaf,
  Moon,
  Mountain,
  Music,
  PenLine,
  Pill,
  Salad,
  Smartphone,
  Smile,
  Sparkles,
  Sun,
  Swords,
  Target,
  Timer,
  Trophy,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** The icons people can pick for habits and challenges (key stored in the database). */
export const habitIcons = {
  "circle-check": CircleCheck,
  dumbbell: Dumbbell,
  footprints: Footprints,
  bike: Bike,
  mountain: Mountain,
  "book-open": BookOpen,
  "pen-line": PenLine,
  languages: Languages,
  code: Code,
  brain: Brain,
  droplets: Droplets,
  apple: Apple,
  salad: Salad,
  coffee: Coffee,
  pill: Pill,
  bed: Bed,
  moon: Moon,
  sun: Sun,
  smartphone: Smartphone,
  timer: Timer,
  heart: Heart,
  smile: Smile,
  leaf: Leaf,
  music: Music,
  wallet: Wallet,
  sparkles: Sparkles,
  flame: Flame,
  target: Target,
  trophy: Trophy,
  swords: Swords,
} satisfies Record<string, LucideIcon>;

export type HabitIconName = keyof typeof habitIcons;

export const habitIconNames = Object.keys(habitIcons) as HabitIconName[];

export function isHabitIconName(value: string): value is HabitIconName {
  return value in habitIcons;
}

export function HabitIcon({ name, className }: { name: string; className?: string }) {
  const Icon = isHabitIconName(name) ? habitIcons[name] : CircleCheck;
  return <Icon className={cn("size-4", className)} />;
}

/** The icon in a soft rounded tile, as used in lists. */
export function HabitIconTile({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-lg border bg-card text-primary",
        className,
      )}
    >
      <HabitIcon name={name} className="size-5" />
    </span>
  );
}
