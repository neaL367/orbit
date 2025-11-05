"use client"

import Link from 'next/link'
import type { Route } from 'next'
import { useGraphQL } from '@/hooks/use-graphql'
import { AnimeCard } from '@/features/shared/anime-card'
import type { Media, MediaSeason, TypedDocumentString } from '@/graphql/graphql'

type AnimeSectionProps = {
  title: string
  query: TypedDocumentString<unknown, { page?: number; perPage?: number; season?: MediaSeason; seasonYear?: number }>
  variables?: { page?: number; perPage?: number; season?: MediaSeason; seasonYear?: number }
  viewAllHref?: string
  showRank?: boolean
}

export function AnimeSection({ title, query, variables, viewAllHref, showRank = false }: AnimeSectionProps) {
  const { data, isLoading, error, refetch } = useGraphQL(query, variables || { page: 1, perPage: 5 })

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6 px-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          {viewAllHref && (
            <Link href={viewAllHref as Route} className="text-sm text-zinc-400 hover:text-white transition-colors">
              View All →
            </Link>
          )}
        </div>
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
        <div className="flex items-center justify-between mb-6 px-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          {viewAllHref && (
            <Link href={viewAllHref as Route} className="text-sm text-zinc-400 hover:text-white transition-colors">
              View All →
            </Link>
          )}
        </div>
        <div className="px-4 flex flex-col items-center gap-4 py-8">
          <p className="text-red-400">Error loading {title.toLowerCase()}</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-white"
          >
            Try Again
          </button>
        </div>
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref as Route} className="text-sm text-zinc-400 hover:text-white transition-colors">
            View All →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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

