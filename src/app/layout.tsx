import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "ALH Academy - Tuition Checkout & Tikkie Payment",
  description:
    "Official payment portal for ALH Academy courses. Secure checkout with instant MongoDB payment tracking and Tikkie / iDEAL integration.",
  keywords: ["ALH Academy", "Tikkie", "iDEAL", "MongoDB", "Tuition Payment", "Next.js"],
  authors: [{ name: "ALH Academy" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 dark:bg-slate-950">
        {children}
      </body>
    </html>
  );
}
