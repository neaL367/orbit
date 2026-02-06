import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { RouteScrollToTop } from "@/components/shared/route-scroll-to-top";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer, Header } from "@/components/layout";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { QueryProviders } from "@/lib/providers";
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
  metadataBase: new URL('https://animex-index.vercel.app'),
  title: {
    default: 'AnimeX — Index',
    template: '%s | AnimeX',
  },
  description: 'Precision anime discovery archive. Registry for high-fidelity animation broadcasts, seasonal trackers, and deep database exploration.',
  keywords: ['anime', 'anime archive', 'anime index', 'anime discovery', 'seasonal anime', 'anime schedule', 'broadcast registry'],
  authors: [{ name: 'AnimeX' }],
  creator: 'AnimeX',
  publisher: 'AnimeX',
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
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://animex-index.vercel.app',
    siteName: 'AnimeX',
    title: 'AnimeX — Index',
    description: 'Precision anime discovery archive. Registry for high-fidelity animation broadcasts.',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'AnimeX Index',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AnimeX — Index',
    description: 'Precision anime discovery archive. Registry for high-fidelity animation broadcasts.',
    images: ['/opengraph-image.png'],
  },
};


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          'antialiased font-sans bg-background text-foreground'
        )}
      >
        <QueryProviders>
          <Suspense fallback={null}>
            <RouteScrollToTop />
          </Suspense>
          <Analytics />
          <Header />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'AnimeX',
                url: 'https://animex-index.vercel.app',
                potentialAction: {
                  '@type': 'SearchAction',
                  target: 'https://animex-index.vercel.app/anime?search={search_term_string}',
                  'query-input': 'required name=search_term_string',
                },
              }),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'AnimeX',
                url: 'https://animex-index.vercel.app',
                logo: 'https://animex-index.vercel.app/logo.png',
              }),
            }}
          />
          <main className="min-h-screen pt-24 pb-20 relative px-6 md:px-12 lg:px-24">
            <div className="max-w-[1400px] mx-auto">
              {children}
            </div>
          </main>
          <Footer />
          <ScrollToTop />
        </QueryProviders>
      </body>
    </html>
  );
}
