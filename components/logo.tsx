import Link from "next/link";
import { cn } from "@/lib/utils";

type Tone = "default" | "light";

/**
 * The Compete mark: two arcs racing around a ring (you in green, a friend in ochre)
 * around a check mark for a habit done. Colors come from theme tokens, so it adapts
 * to dark mode. Use tone="light" on the dark brand panel.
 */
export function LogoMark({ className, tone = "default" }: { className?: string; tone?: Tone }) {
  const light = tone === "light";

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("size-8", className)}
    >
      {/* You: the leading arc (35° to 235°) */}
      <path
        d="M22.31 6.99A11 11 0 1 1 6.99 22.31"
        strokeWidth="4.5"
        className={light ? "stroke-[oklch(0.78_0.08_158)]" : "stroke-primary"}
      />
      {/* A friend, close behind (280° to 350°) */}
      <path d="M5.17 14.09A11 11 0 0 1 14.09 5.17" strokeWidth="4.5" className="stroke-warm" />
      {/* Done */}
      <path
        d="m11.5 16.25 3 3 6-6.5"
        strokeWidth="2.6"
        className={light ? "stroke-panel-foreground" : "stroke-foreground"}
      />
    </svg>
  );
}

type LogoProps = {
  className?: string;
  tone?: Tone;
  /** Show only the mark on small phones (the name stays readable by screen readers). */
  compactOnMobile?: boolean;
};

export function Logo({ className, tone = "default", compactOnMobile = false }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <LogoMark tone={tone} />
      <span
        className={cn(
          "text-lg font-semibold tracking-tight",
          tone === "light" && "text-panel-foreground",
          compactOnMobile && "max-sm:sr-only",
        )}
      >
        Compete
      </span>
    </Link>
  );
}
