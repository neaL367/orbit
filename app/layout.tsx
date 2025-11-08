import "./globals.css";
import { Inter } from "next/font/google";
import { Footer, Header } from "@/features/shared";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://orbit-eight-rosy.vercel.app`),
  title: {
    default: 'AnimeX - Discover Trending Anime',
    template: '%s | AnimeX',
  },
  description: 'Discover trending anime, popular series, top-rated shows, and seasonal releases. Explore the best anime content with AnimeX.',
  keywords: ['anime', 'trending anime', 'popular anime', 'anime streaming', 'anime list', 'anime database'],
  authors: [{ name: 'AnimeX' }],
  creator: 'AnimeX',
  publisher: 'AnimeX',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'AnimeX',
    title: 'AnimeX - Discover Trending Anime',
    description: 'Discover trending anime, popular series, top-rated shows, and seasonal releases.',

  },
  twitter: {
    title: 'AnimeX - Discover Trending Anime',
    description: 'Discover trending anime, popular series, top-rated shows, and seasonal releases.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={cn(inter.variable, 'antialiased dark bg-black')}
      >
        <Header />
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
