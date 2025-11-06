import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Anime List',
  description: 'Browse and discover anime by trending, popularity, top-rated, and seasonal releases. Filter by genre, format, and status.',
  keywords: ['anime list', 'browse anime', 'anime catalog', 'anime filter', 'anime search'],
  openGraph: {
    title: 'Anime List',
    description: 'Browse and discover anime by trending, popularity, top-rated, and seasonal releases.',
    type: 'website',
    url: '/anime',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anime List',
    description: 'Browse and discover anime by trending, popularity, top-rated, and seasonal releases.',
  },
}

export default function AnimeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

