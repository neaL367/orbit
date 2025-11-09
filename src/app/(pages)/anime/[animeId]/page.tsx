import type { Metadata } from 'next'
import { AnimeDetail } from './_components/detail'
import { AnimeByIdQuery } from '@/services/graphql/queries/anime-by-id'
import { getAnimeTitle } from '@/lib/anime-utils'
import { executeGraphQL } from '@/services/graphql'
import type { Media, AnimeByIdQuery as AnimeByIdQueryType } from '@/lib/graphql/types/graphql'

async function getAnimeById(animeId: number): Promise<Media | null> {
  const result = await executeGraphQL<AnimeByIdQueryType>(
    String(AnimeByIdQuery),
    { id: animeId }
  )

  if (result.errors || !result.data?.Media) {
    return null
  }

  return result.data.Media as Media
}

export async function generateMetadata({ params }: PageProps<'/anime/[animeId]'>): Promise<Metadata> {
  const { animeId } = await params
  const id = parseInt(animeId, 10)

  if (isNaN(id)) {
    return {
      title: 'Anime Not Found',
      description: 'The requested anime could not be found.',
    }
  }

  const anime = await getAnimeById(id)

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

export default async function AnimeDetailPage({ params }: PageProps<'/anime/[animeId]'>) {
  return <AnimeDetail params={params} />
}
