import "./globals.css";
import { Geist } from "next/font/google";
import { Navbar } from "@/features/shared";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});


export const metadata: Metadata = {
  title: "AnimeX",
  description: "AnimeX is a platform for watching anime",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased dark bg-black`}
      >
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
