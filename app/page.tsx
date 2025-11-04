'use client'

import { useGraphQL } from '@/lib/use-graphql'
import { AnimeCard } from '@/features/anime-card'
import type { Media, MediaSeason, TypedDocumentString } from '@/graphql/graphql'
import {
  TrendingAnimeQuery,
  PopularAnimeQuery,
  TopRatedAnimeQuery,
  SeasonalAnimeQuery,
} from '@/queries/media'
import {
  getCurrentSeason,
  getCurrentYear,
  getNextSeason,
  getNextSeasonYear,
} from '@/lib/date-utils'

type AnimeSectionProps = {
  title: string
  query: TypedDocumentString<unknown, { page?: number; perPage?: number; season?: MediaSeason; seasonYear?: number }>
  variables?: { page?: number; perPage?: number; season?: MediaSeason; seasonYear?: number }
}

function AnimeSection({ title, query, variables }: AnimeSectionProps) {
  const { data, isLoading, error } = useGraphQL(query, variables || { page: 1, perPage: 5 })

  if (isLoading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 px-4">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="aspect-2/3 bg-zinc-900 rounded-xl animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 px-4">{title}</h2>
        <div className="px-4 text-red-400">Error loading {title.toLowerCase()}</div>
      </section>
    )
  }

  const pageData = data as { Page?: { media?: Array<Media | null> } } | undefined
  const animeList = pageData?.Page?.media?.filter((anime: Media | null) => anime && !anime.isAdult) || []

  if (animeList.length === 0) {
    return null
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 px-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4">
        {animeList.map((anime) => anime ? <AnimeCard key={anime.id} anime={anime} /> : null)}
      </div>
    </section>
  )
}

export default function HomePage() {
  const currentSeason = getCurrentSeason()
  const currentYear = getCurrentYear()
  const nextSeason = getNextSeason()
  const nextSeasonYear = getNextSeasonYear()

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimeSection
          title="Trending Now"
          query={TrendingAnimeQuery}
          variables={{ page: 1, perPage: 5 }}
        />

        <AnimeSection
          title="Popular This Season"
          query={SeasonalAnimeQuery}
          variables={{ season: currentSeason, seasonYear: currentYear, page: 1, perPage: 5 }}
        />

        <AnimeSection
          title="Upcoming Next Season"
          query={SeasonalAnimeQuery}
          variables={{ season: nextSeason, seasonYear: nextSeasonYear, page: 1, perPage: 5 }}
        />

        <AnimeSection
          title="Top 100"
          query={TopRatedAnimeQuery}
          variables={{ page: 1, perPage: 5 }}
        />

        <AnimeSection
          title="All Time Popular"
          query={PopularAnimeQuery}
          variables={{ page: 1, perPage: 5 }}
        />
      </div>
    </div>
  )
}
