import type React from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ViewTransitions } from "next-view-transitions";
// import Footer from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orbit",
  description:
    "Discover and explore anime with detailed information and recommendations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning className="dark">
        <body className={geistSans.className}>
          <div className="flex min-h-screen flex-col items-center">
            <Header />
            <main className="w-full">{children}</main>
            {/* <Footer /> */}
          </div>
        </body>
      </html>
    </ViewTransitions>
  );
}
