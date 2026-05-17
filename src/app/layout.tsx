import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import TurnstileVerification from "@/components/turnstile/TurnstileVerification";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beauty Queen - Crown Your Queen",
  description: "The premier online beauty queen platform. Vote for your favorite contestants and help them win the crown!",
  keywords: ["beauty", "voting", "contest", "pageant", "crown"],
  icons: {
    icon: "/queen-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="beauty-vote-theme"
        >
          <TurnstileVerification>
            {children}
          </TurnstileVerification>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
