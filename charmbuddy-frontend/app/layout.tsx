import type { Metadata } from "next";
import AppProviders from "@/components/providers/AppProviders";
import { dmsans, fanlste, satoshi } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Charmbuddy",
  description: "Charmbuddy frontend",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${fanlste.variable} ${satoshi.variable} ${dmsans.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

