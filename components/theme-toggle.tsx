"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAppliedTheme, setTheme, subscribeToTheme, type Theme } from "@/lib/theme";

/** One click switches between light and dark. */
export function ThemeToggle() {
  // "light" on the server; the real applied theme after hydration.
  const theme = useSyncExternalStore(subscribeToTheme, getAppliedTheme, () => "light" as Theme);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      // Static label, so the server HTML always matches.
      aria-label="Toggle light and dark mode"
      title="Toggle light and dark mode"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {/* The icon follows the applied theme via CSS, so it's right before hydration too. */}
      <Sun className="dark:hidden" />
      <Moon className="hidden dark:block" />
    </Button>
  );
}
