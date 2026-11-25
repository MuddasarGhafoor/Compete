import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        {/* `isolate` keeps popups (menus, selects, tooltips) stacking above the page. */}
        <div className="isolate flex min-h-dvh flex-col">
          <TooltipProvider>{children}</TooltipProvider>
        </div>
      </body>
    </html>
  );
}
