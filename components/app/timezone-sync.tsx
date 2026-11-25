"use client";

import { useEffect } from "react";
import { setTimezone } from "@/app/actions/profile";

/**
 * On first visit, saves the browser's timezone so "today" matches the user's clock.
 * Never overrides a timezone the user picked in Settings. Renders nothing.
 */
export function TimezoneSync({ current }: { current: string | null }) {
  useEffect(() => {
    if (current) return;
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected) void setTimezone(detected, true);
  }, [current]);

  return null;
}
