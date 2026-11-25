import {
  CalendarCheck,
  ChartColumn,
  ListChecks,
  Swords,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shown in the sidebar with a "Soon" tag; not in the phone tab bar. */
  soon?: boolean;
};

/** Main sections of the signed-in app, in sidebar order. */
export const appNavItems: NavItem[] = [
  { href: "/today", label: "Today", icon: CalendarCheck },
  { href: "/habits", label: "Habits", icon: ListChecks },
  { href: "/progress", label: "Progress", icon: ChartColumn },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/challenges", label: "Challenges", icon: Swords },
];

/** The five items in the phone bottom tab bar (Challenges is in the account menu on phones). */
export const tabBarItems = appNavItems.filter((item) => item.href !== "/challenges");

