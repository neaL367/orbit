"use client"

import type { Route } from 'next'
import { AnimeCard, SectionHeader, ErrorState, LoadingSkeleton } from '@/features/shared'
import type { Media } from '@/graphql/graphql'

type AnimeSectionViewProps = {
  data: Media[]
  title: string
  viewAllHref?: string
  showRank?: boolean
  page?: number
  perPage?: number
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
}

export function AnimeSectionView({
  data,
  title,
  viewAllHref,
  showRank = false,
  page = 1,
  perPage = 5,
  isLoading = false,
  error = null,
  onRetry,
}: AnimeSectionViewProps) {
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
          onRetry={onRetry}
          className="px-4"
        />
      </section>
    )
  }

  if (data.length === 0) {
    return null
  }

  return (
    <section className="mb-12">
      <SectionHeader title={title} viewAllHref={viewAllHref as Route} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {data.map((anime, index) => {
          if (!anime) return null
          const rank = showRank ? (page - 1) * perPage + index + 1 : undefined
          return <AnimeCard key={anime.id} anime={anime} rank={rank} />
        })}
      </div>
    </section>
  )
}

