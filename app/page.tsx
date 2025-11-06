import type { Metadata } from 'next'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

export const metadata: Metadata = {
  title: 'Discover Trending Anime',
  description: 'Discover trending anime, popular series, top-rated shows, and seasonal releases. Explore the best anime content with AnimeX.',
  keywords: ['anime', 'trending anime', 'popular anime', 'anime streaming', 'anime list'],
  openGraph: {
    title: 'Discover Trending Anime',
    description: 'Discover trending anime, popular series, top-rated shows, and seasonal releases.',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discover Trending Anime',
    description: 'Discover trending anime, popular series, top-rated shows, and seasonal releases.',
  },
}

const HomePageContent = dynamic(
  () => import('../features/home').then((mod) => ({ default: mod.HomePageContent })),
  { ssr: true }
)

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-2/3 bg-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  )
}
