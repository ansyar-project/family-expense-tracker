import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Family Expense Tracker",
  description:
    "Track your family's income and expenses easily. Visualize spending, set budgets, and stay on top of your finances.",
  keywords: [
    "expense tracker",
    "family budget",
    "personal finance",
    "income tracking",
    "spending analysis",
    "budget app",
    "money management",
  ],
  authors: [{ name: "Ansyar" }],
  creator: "Ansyar",
  openGraph: {
    title: "Family Expense Tracker",
    description:
      "Track your family's income and expenses easily. Visualize spending, set budgets, and stay on top of your finances.",
    url: "https://family-expense-tracker.ansyar-world.top",
    siteName: "Family Expense Tracker",
    type: "website",
    locale: "en_US",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
