import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The Compete mark: a winner's podium on a tile.
 * Flat and monochrome: the tile uses the text color and the podium the page color,
 * so it flips automatically in dark mode.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect width="32" height="32" rx="8" className="fill-foreground" />
      <g className="fill-background">
        {/* 2nd place */}
        <path d="M7 24v-6.5A1.5 1.5 0 0 1 8.5 16H13v8H7Z" fillOpacity=".7" />
        {/* 1st place */}
        <path d="M13 24V10.5A1.5 1.5 0 0 1 14.5 9h3a1.5 1.5 0 0 1 1.5 1.5V24h-6Z" />
        {/* 3rd place */}
        <path d="M19 24v-5h4.5a1.5 1.5 0 0 1 1.5 1.5V24h-6Z" fillOpacity=".45" />
      </g>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <LogoMark />
      <span className="text-lg font-semibold tracking-tight">Compete</span>
    </Link>
  );
}
