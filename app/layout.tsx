import "./globals.css";
import { Geist } from "next/font/google";
import { Navbar } from "@/features/shared/navbar";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
        className={`${geistSans.className} antialiased dark bg-black`}
      >
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
