import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/layout/footer/footer";
import { Header } from "@/components/layout/header/header";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { QueryProviders } from "@/providers";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { BASE_URL } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
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
    url: BASE_URL,
    siteName: 'AnimeX',
    title: 'AnimeX — Index',
    description: 'Precision anime discovery archive. Registry for high-fidelity animation broadcasts.',
    images: [
      {
        url: `${BASE_URL}/opengraph-image.png`,
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
    images: [`${BASE_URL}/opengraph-image.png`],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(
        "dark custom-scrollbar font-sans antialiased",
        geistSans.variable,
        geistMono.variable
      )}
    >
      <body className="bg-background text-foreground relative min-h-dvh overflow-x-hidden">
        <QueryProviders>
          <Analytics />
          <a
            href="#main-content"
            className="pointer-events-none fixed left-4 top-4 z-[300] -translate-y-24 rounded-sm bg-primary px-4 py-2 font-mono text-xs font-bold uppercase tracking-wide text-primary-foreground opacity-0 transition-transform focus:pointer-events-auto focus:translate-y-0 focus:opacity-100 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-ring"
          >
            Skip to main content
          </a>
          <Header />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'AnimeX',
                url: BASE_URL,
                potentialAction: {
                  '@type': 'SearchAction',
                  target: `${BASE_URL}/anime?search={search_term_string}`,
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
                url: BASE_URL,
                logo: `${BASE_URL}/opengraph-image.png`, // Use OG image as logo fallback
              }),
            }}
          />
          <main id="main-content" className="scroll-mt-24 min-h-screen pb-20 relative px-6 md:px-12 lg:px-24">
            <div className="max-w-[1600px] mx-auto">
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
