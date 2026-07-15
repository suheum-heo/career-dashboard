import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar, MobileHeader } from "@/components/layout/sidebar";
import { NavigationProgress } from "@/components/navigation-progress";
import { LocaleProvider } from "@/components/locale-provider";
import { getLocale } from "@/i18n/server";
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
  title: "CareerTrack — Job Application Dashboard",
  description:
    "Track internship and full-time applications with analytics, calendar, and pipeline insights.",
  applicationName: "CareerTrack",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#007AFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0A84FF" },
  ],
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", sizes: "any" },
      { url: "/favicon.svg?v=3", type: "image/svg+xml" },
      { url: "/icon.png?v=3", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon?v=3", type: "image/png", sizes: "180x180" }],
    shortcut: "/favicon.ico?v=3",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale === "ko" ? "ko" : "en"} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LocaleProvider locale={locale}>
            <TooltipProvider>
              <Suspense fallback={null}>
                <NavigationProgress />
              </Suspense>
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex min-w-0 flex-1 flex-col">
                  <MobileHeader />
                  <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    <div className="mx-auto w-full max-w-7xl">{children}</div>
                  </main>
                </div>
              </div>
              <Toaster richColors position="top-right" />
            </TooltipProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
