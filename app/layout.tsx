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
