import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AnimeDetailContent } from '@/features/anime-detail'
import { AnimeByIdQuery } from '@/queries/media/anime-by-id'
import { getAnimeTitle } from '@/features/shared'
import { executeGraphQL } from '@/lib/graphql'
import type { Media, AnimeByIdQuery as AnimeByIdQueryType } from '@/graphql/graphql'

async function getAnimeData(animeId: number): Promise<Media | null> {
  const result = await executeGraphQL<AnimeByIdQueryType>(
    String(AnimeByIdQuery),
    { id: animeId }
  )

  if (result.errors || !result.data?.Media) {
    return null
  }

  return result.data.Media as Media
}

export async function generateMetadata({ params }: { params: Promise<{ animeId: string }> }): Promise<Metadata> {
  const { animeId } = await params
  const id = parseInt(animeId, 10)

  if (isNaN(id)) {
    return {
      title: 'Anime Not Found',
      description: 'The requested anime could not be found.',
    }
  }

  const anime = await getAnimeData(id)

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

  const coverImage = anime.coverImage?.extraLarge || anime.coverImage?.large || anime.bannerImage

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
      images: coverImage ? [{ url: coverImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description,
      images: coverImage ? [coverImage] : undefined,
    },
  }
}

export default function AnimeDetailPage({ params }: { params: Promise<{ animeId: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12 lg:py-16">
          <div className="animate-pulse">
            <div className="h-96 bg-zinc-900 rounded-lg mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-1">
                <div className="h-64 bg-zinc-900 rounded-lg" />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="h-32 bg-zinc-900 rounded-lg" />
                <div className="h-32 bg-zinc-900 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <AnimeDetailContent params={params} />
    </Suspense>
  )
}
