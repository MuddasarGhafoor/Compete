/**
 * Light / dark theme, applied as `.dark` on <html>.
 * Until the visitor clicks the toggle, it follows the system setting; after that their
 * choice is saved in localStorage. No dependencies; safe to import on the server
 * (browser APIs are only touched inside functions).
 */

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const CHANGE_EVENT = "theme-change";

/**
 * Inline script for <head>: applies the saved (or system) theme before the page paints,
 * so there's no flash of the wrong theme.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

/** The visitor's saved choice, or null if they haven't picked one yet. */
export function getSavedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

/** The theme currently on the page. */
export function getAppliedTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Applies a theme to <html>, briefly disabling transitions so colors switch cleanly. */
export function applyTheme(theme: Theme) {
  const noTransitions = document.createElement("style");
  noTransitions.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(noTransitions);

  document.documentElement.classList.toggle("dark", theme === "dark");

  // Force a style recalculation, then re-enable transitions.
  void window.getComputedStyle(document.body).opacity;
  setTimeout(() => noTransitions.remove(), 0);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Saves and applies the visitor's choice. */
export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage blocked: still switch for this page view.
  }
  applyTheme(theme);
}

/** For useSyncExternalStore: re-read whenever the applied theme changes. */
export function subscribeToTheme(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}
