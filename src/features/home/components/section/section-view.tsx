

import type { Route } from 'next'
import { AnimeCard } from '@/features/anime/components/anime-card/anime-card'
import { SectionHeader, ErrorState, LoadingSkeleton } from '@/components/shared'
import type { Media } from '@/lib/graphql/types/graphql'

type SectionViewProps = {
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

export function SectionView({
  data,
  title,
  viewAllHref,
  showRank = false,
  page = 1,
  perPage = 5,
  isLoading = false,
  error = null,
  onRetry,
}: SectionViewProps) {
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
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {data.map((anime, index) => {
          if (!anime) return null
          const rank = showRank ? (page - 1) * perPage + index + 1 : undefined
          return (
            <li key={anime.id}>
              <AnimeCard
                anime={anime}
                rank={rank}
                loading={index < 2 ? "eager" : "lazy"}
              />
            </li>
          )
        })}
      </ul>
    </section>
  )
}

