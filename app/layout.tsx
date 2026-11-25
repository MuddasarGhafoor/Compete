import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { ThemeWatcher } from "@/components/theme-watcher";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { themeScript } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Serif for large headlines (`font-display`).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Compete",
    template: "%s · Compete",
  },
  description:
    "Track your daily routines, connect with friends, and compete to see who performs best.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      // The theme script below adds `.dark` before React loads, so the class differs from the server HTML.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        {/* Applies the saved light/dark theme before the first paint (no flash). */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full font-sans">
        <ThemeWatcher />
        {/* `isolate` keeps popups (menus, selects, tooltips) stacking above the page. */}
        <div className="isolate flex min-h-dvh flex-col">
          <TooltipProvider>{children}</TooltipProvider>
        </div>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
