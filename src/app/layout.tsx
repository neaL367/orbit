import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Footer, Header } from "@/components/layout";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://animex-index.vercel.app`),
  title: {
    default: 'AnimeX — Index',
    template: '%s | AnimeX',
  },
  description: 'Precision anime discovery archive.',
  keywords: ['anime', 'archive', 'index', 'discovery'],
  authors: [{ name: 'AnimeX' }],
  creator: 'AnimeX',
  publisher: 'AnimeX',
};

import { Suspense } from "react";
import { RouteScrollToTop } from "@/components/shared/route-scroll-to-top";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          'antialiased font-sans bg-background text-foreground'
        )}
      >
        <Suspense fallback={null}>
          <RouteScrollToTop />
        </Suspense>
        <Analytics />
        <Header />
        <main className="min-h-screen pt-24 pb-20 relative px-6 md:px-12 lg:px-24">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  );
}
