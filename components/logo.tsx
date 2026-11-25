import Link from "next/link";
import { useId } from "react";
import { cn } from "@/lib/utils";

/** The Compete mark: a winner's podium on an emerald tile. */
export function LogoMark({ className }: { className?: string }) {
  // Unique gradient id, so several logos on one page don't clash.
  const gradientId = useId();

  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={cn("size-8", className)}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${gradientId})`} />
      {/* 2nd place */}
      <path d="M7 24v-6.5A1.5 1.5 0 0 1 8.5 16H13v8H7Z" fill="#fff" fillOpacity=".7" />
      {/* 1st place */}
      <path d="M13 24V10.5A1.5 1.5 0 0 1 14.5 9h3a1.5 1.5 0 0 1 1.5 1.5V24h-6Z" fill="#fff" />
      {/* 3rd place */}
      <path d="M19 24v-5h4.5a1.5 1.5 0 0 1 1.5 1.5V24h-6Z" fill="#fff" fillOpacity=".5" />
    </svg>
  );
}

type LogoProps = {
  className?: string;
  /** Use "light" on dark backgrounds. */
  tone?: "default" | "light";
};

export function Logo({ className, tone = "default" }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <LogoMark />
      <span
        className={cn(
          "text-lg font-semibold tracking-tight",
          tone === "light" ? "text-white" : "text-foreground",
        )}
      >
        Compete
      </span>
    </Link>
  );
}
