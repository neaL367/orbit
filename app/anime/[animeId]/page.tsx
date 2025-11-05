'use client'

import { notFound } from 'next/navigation'
import { use } from 'react'

import {
  AnimeDetailHeader,
  AnimeDetailRecommendations,
  AnimeDetailRelations,
  AnimeDetailLoading,
  AnimeDetailError,
  AnimeDetailTrailer,
  AnimeDetailCharacters,
} from '@/features/anime-detail'
import { useGraphQL } from '@/hooks/use-graphql'
import { AnimeByIdQuery } from '@/queries/media/anime-by-id'
import type { Media } from '@/graphql/graphql'

export default function AnimeDetailPage({ params }: { params: Promise<{ animeId: string }> }) {
  const { animeId: animeIdParam } = use(params)
  const animeId = parseInt(animeIdParam, 10)

  if (isNaN(animeId)) {
    notFound()
  }

  const { data, isLoading, error, refetch } = useGraphQL(AnimeByIdQuery, { id: animeId })

  if (isLoading) {
    return <AnimeDetailLoading />
  }

  const mediaData = data as { Media?: Media } | undefined
  const anime = mediaData?.Media

  if (error || !anime) {
    return <AnimeDetailError onRetry={() => refetch()} />
  }

  const recommendations = anime?.recommendations?.nodes?.filter(Boolean) || []
  const relations = anime?.relations?.edges?.filter(Boolean) || []
  const characters = anime?.characters?.edges?.filter(Boolean) || []
  const title = anime?.title?.userPreferred || anime?.title?.romaji || anime?.title?.english || 'Unknown'

  return (
    <div className="min-h-screen bg-black text-white  ">
      <AnimeDetailHeader anime={anime} />
      <div className="pb-12 max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        <AnimeDetailTrailer trailer={anime.trailer} title={title} />
        <AnimeDetailCharacters characters={characters} />
        <AnimeDetailRecommendations recommendations={recommendations} />
        <AnimeDetailRelations relations={relations} />
      </div>
    </div>
  )
}
