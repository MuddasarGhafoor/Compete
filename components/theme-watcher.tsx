"use client";

import { useEffect } from "react";
import { applyTheme, getSavedTheme, getSystemTheme } from "@/lib/theme";

/**
 * Keeps the page in sync when the visitor hasn't picked a theme and the OS switches
 * between light and dark, or when the theme is changed in another tab. Renders nothing.
 */
export function ThemeWatcher() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => applyTheme(getSavedTheme() ?? getSystemTheme());
    const onSystemChange = () => {
      if (!getSavedTheme()) sync();
    };

    media.addEventListener("change", onSystemChange);
    window.addEventListener("storage", sync);
    return () => {
      media.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return null;
}
