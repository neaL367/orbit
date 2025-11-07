import "./globals.css";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import { Navbar } from "@/features/shared";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});


export const metadata: Metadata = {
  metadataBase: new URL(`https://orbit-git-dev-mess-projects.vercel.app`),
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(geistSans.variable, 'antialiased dark bg-black')}
      >
        <Suspense fallback={
          <nav className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 shadow-lg">
            <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="text-xl font-bold text-white">AnimeX</div>
              </div>
            </div>
          </nav>
        }>
          <Navbar />
        </Suspense>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
