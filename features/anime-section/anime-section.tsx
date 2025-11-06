"use client"

import type { Route } from 'next'
import { useGraphQL } from '@/hooks/use-graphql'
import { CACHE_TIMES } from '@/lib/constants'
import { AnimeCard, SectionHeader, ErrorState, LoadingSkeleton, extractMediaList } from '@/features/shared'
import type { MediaSeason, TypedDocumentString } from '@/graphql/graphql'

type AnimeSectionProps = {
  title: string
  query: TypedDocumentString<unknown, { page?: number; perPage?: number; season?: MediaSeason; seasonYear?: number }>
  variables?: { page?: number; perPage?: number; season?: MediaSeason; seasonYear?: number }
  viewAllHref?: string
  showRank?: boolean
}

export function AnimeSection({ title, query, variables, viewAllHref, showRank = false }: AnimeSectionProps) {
  const { data, isLoading, error, refetch } = useGraphQL(
    query, 
    variables || { page: 1, perPage: 5 },
    {
      staleTime: CACHE_TIMES.MEDIUM, // 5 minutes - home page sections update frequently
      retry: 3
    }
  )

  const animeList = extractMediaList(data)

  if (isLoading) {
    return (
      <section className="mb-12">
        <SectionHeader title={title} viewAllHref={viewAllHref as Route} className="px-4" />
        <LoadingSkeleton
          count={5}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4"
        />
      </section>
    )
  }

  if (error) {
    return (
      <section className="mb-12">
        <SectionHeader title={title} viewAllHref={viewAllHref as Route} className="px-4" />
        <ErrorState
          message={`Error loading ${title.toLowerCase()}`}
          onRetry={() => refetch()}
          className="px-4"
        />
      </section>
    )
  }

  if (animeList.length === 0) {
    return null
  }

  return (
    <section className="mb-12">
      <SectionHeader title={title} viewAllHref={viewAllHref as Route} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {animeList.map((anime, index) => {
          if (!anime) return null
          const page = variables?.page || 1
          const perPage = variables?.perPage || 5
          const rank = showRank ? (page - 1) * perPage + index + 1 : undefined
          return <AnimeCard key={anime.id} anime={anime} rank={rank} />
        })}
      </div>
    </section>
  )
}

