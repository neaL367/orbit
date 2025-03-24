import type React from "react";
import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
// import { Footer } from "@/components/footer";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AniTrack - Anime Database",
  description: "A comprehensive database and resource for anime enthusiasts",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geistMono.className}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex justify-center">{children}</main>
          {/* <Footer /> */}
        </div>
      </body>
    </html>
  );
}
