'use client'

import { notFound } from 'next/navigation'
import { use } from 'react'
import { CACHE_TIMES } from '@/lib/constants'
import {
  Hero,
  HeroContent,
  Info,
  Synopsis,
  Recommendations,
  Relations,
  Loading,
  Error,
  Trailer,
  Characters,
  StreamingEpisodes,
} from '@/features/anime-detail'
import { useGraphQL } from '@/hooks/use-graphql'
import { AnimeByIdQuery } from '@/queries/media/anime-by-id'
import type { Media } from '@/graphql/graphql'

export function Content({ params }: { params: Promise<{ animeId: string }> }) {
  const { animeId: animeIdParam } = use(params)
  const animeId = parseInt(animeIdParam, 10)

  if (isNaN(animeId)) {
    notFound()
  }

  const { data, isLoading, error, refetch } = useGraphQL(
    AnimeByIdQuery,
    { id: animeId },
    {
      staleTime: CACHE_TIMES.LONG, // 10 minutes - detail pages don't change often
      retry: 3
    }
  )

  if (isLoading) {
    return <Loading />
  }

  const mediaData = data as { Media?: Media } | undefined
  const anime = mediaData?.Media

  if (error || !anime) {
    return <Error onRetry={() => refetch()} />
  }

  const recommendations = anime?.recommendations?.nodes?.filter(Boolean) || []
  const relations = anime?.relations?.edges?.filter(Boolean) || []
  const characters = anime?.characters?.edges?.filter(Boolean) || []
  const streamingEpisodes = anime?.streamingEpisodes?.filter(Boolean) || []
  const title = anime?.title?.userPreferred || anime?.title?.romaji || anime?.title?.english || 'Unknown'

  return (
    <div className="min-h-screen bg-black text-white">
      <Hero anime={anime} />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12 lg:py-16">
        <HeroContent anime={anime} />

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 mt-10">
          {/* Left Sidebar - Anime Details */}
          <aside className="w-full lg:w-[380px] shrink-0 space-y-6">
            <Info anime={anime} />
          </aside>

          {/* Right Side - Main Content */}
          <main className="flex-1 space-y-10">
            <Synopsis description={anime.description} />
            <Trailer trailer={anime.trailer} title={title} />
            <StreamingEpisodes streamingEpisodes={streamingEpisodes} />
            <Characters characters={characters} />
            <Recommendations recommendations={recommendations} />
            <Relations relations={relations} />
          </main>
        </div>
      </div>
    </div>
  )
}

