import type { Route } from 'next'
import Link from 'next/link'
import { PosterCard } from '@/features/anime/components/poster-card/PosterCard'
import { IndexSectionHeader } from '@/components/shared/index-section-header'
import { ErrorState } from '@/components/shared'
import type { Media } from '@/lib/graphql/types/graphql'

type SectionViewProps = {
  data: Media[]
  title: string
  subtitle?: string
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
  subtitle,
  viewAllHref,
  showRank = false,
  page = 1,
  perPage = 6,
  isLoading = false,
  error = null,
  onRetry,
}: SectionViewProps) {
  if (isLoading) {
    return (
      <div className="mb-20">
        <div className="h-8 w-48 bg-secondary border border-border shimmer mb-12" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] border border-border shimmer" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <section className="mb-20">
        <IndexSectionHeader title={title} subtitle="Registry_Error" />
        <ErrorState
          message="System Failed to Parse Feed"
          onRetry={onRetry}
        />
      </section>
    )
  }

  if (data.length === 0) {
    return null
  }

  return (
    <section className="mb-24 group/section reveal">
      <div className="flex items-baseline justify-between gap-4">
        <IndexSectionHeader
          title={title}
          subtitle={subtitle || "General_Archive"}
          className="flex-1"
        />
        {viewAllHref && (
          <Link
            href={viewAllHref as Route}
            className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors mb-12"
          >
            Access_Full
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10">
        {data.map((anime, index) => {
          if (!anime) return null
          const rank = showRank ? (page - 1) * perPage + index + 1 : undefined
          return (
            <PosterCard
              key={anime.id}
              anime={anime}
              rank={rank}
              priority={index < 2}
            />
          )
        })}
      </div>
    </section>
  )
}
