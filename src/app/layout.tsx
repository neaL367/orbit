import type React from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { ViewTransitions } from "next-view-transitions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orbit",
  description: "A comprehensive database and resource for anime enthusiasts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body className={geistSans.className}>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex justify-center mx-3.5">{children}</main>
          </div>
        </body>
      </html>
    </ViewTransitions>
  );
}
