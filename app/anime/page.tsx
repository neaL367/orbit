import { AnimeList } from '@/features/anime-list'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Anime List',
  description: 'Browse and discover anime. Explore trending, popular, top-rated, and seasonal anime. Search and filter by genre, format, status, and more.',
  keywords: ['anime list', 'browse anime', 'discover anime', 'trending anime', 'popular anime', 'top rated anime', 'seasonal anime', 'anime search'],
  openGraph: {
    title: 'Anime List | AnimeX',
    description: 'Browse and discover anime. Explore trending, popular, top-rated, and seasonal anime.',
    type: 'website',
    url: '/anime',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anime List | AnimeX',
    description: 'Browse and discover anime. Explore trending, popular, top-rated, and seasonal anime.',
  },
}

export default function AnimeListPage() {
  return <AnimeList />
}