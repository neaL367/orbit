import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AnimeDetail } from '@/features/anime/components/anime-detail/detail/detail'
import { getCachedAnime } from '@/lib/graphql/server-cache'
import { getAnimeTitle } from '@/lib/utils/anime-utils'
import type { Media } from '@/lib/graphql/types/graphql'
import { Loading } from '@/features/anime/components/anime-detail/detail/loading'

export async function generateMetadata({ params }: PageProps<'/anime/[animeId]'>): Promise<Metadata> {
  const { animeId } = await params
  const id = parseInt(animeId, 10)

  if (isNaN(id)) {
    return {
      title: 'Anime Not Found',
      description: 'The requested anime could not be found.',
    }
  }

  const result = await getCachedAnime(id)
  const anime = result.data?.Media as Media | undefined

  if (!anime) {
    return {
      title: 'Anime Not Found',
      description: 'The requested anime could not be found.',
    }
  }

  const title = getAnimeTitle(anime)
  const description = anime.description
    ? anime.description.replace(/<[^>]*>/g, '').substring(0, 160) + '...'
    : `Watch ${title} on AnimeX. ${anime.format || ''} anime${anime.startDate?.year ? ` from ${anime.startDate.year}` : ''}.`

  const bannerImage = anime.bannerImage

  return {
    title: title,
    description,
    keywords: [
      title,
      ...(anime.genres || []).filter((g): g is string => typeof g === 'string'),
      anime.format || '',
      anime.status || '',
    ].filter(Boolean) as string[],
    openGraph: {
      title: title,
      description,
      type: 'website',
      url: `/anime/${id}`,
      images: bannerImage ? [{ url: bannerImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description,
      images: bannerImage ? [{ url: bannerImage }] : undefined,
    },
  }
}

async function AnimeDetailPageContent({ params }: { params: Promise<{ animeId: string }> }) {
  const { animeId } = await params
  const id = parseInt(animeId, 10)
  const result = await getCachedAnime(id)

  // Pass the full result (including data) to the client component
  return <AnimeDetail animeId={animeId} initialData={result.data} />
}

export default function AnimeDetailPage({ params }: PageProps<'/anime/[animeId]'>) {
  return (
    <Suspense fallback={<Loading />}>
      <AnimeDetailPageContent params={params} />
    </Suspense>
  )
}
