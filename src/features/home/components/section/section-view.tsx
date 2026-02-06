import type { Route } from 'next'
import Link from 'next/link'
import Image from 'next/image'
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
  variant?: 'grid' | 'featured' | 'list' | 'compact'
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
  variant = 'grid',
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

      {variant === 'featured' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Feature */}
          <div className="lg:col-span-7">
            {data[0] && (
              <div className="relative group/feat overflow-hidden border border-border">
                <div className="aspect-[16/10] w-full overflow-hidden relative">
                  <Image
                    src={data[0].bannerImage || data[0].coverImage?.extraLarge || ''}
                    alt={data[0].title?.romaji || ''}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="w-full h-full object-cover grayscale opacity-60 group-hover/feat:grayscale-0 group-hover/feat:opacity-100 group-hover/feat:scale-105 transition-all duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 space-y-4 max-w-xl">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary text-background px-3 py-0.5 font-mono text-[10px] font-bold uppercase index-cut-tr">Featured_Entry</span>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">{data[0].format?.replace(/_/g, ' ')}</span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-mono font-bold uppercase leading-none tracking-tighter">
                    {data[0].title?.userPreferred || data[0].title?.romaji}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-muted-foreground font-mono text-[10px] uppercase">
                    <span>{data[0].status?.replace(/_/g, ' ')}</span>
                    <span>{data[0].genres?.slice(0, 2).join(' / ')}</span>
                  </div>
                  {data[0].description && (
                    <p className="text-muted-foreground font-mono text-[11px] leading-relaxed line-clamp-4 max-w-md uppercase tracking-tight">
                      {data[0].description.replace(/<[^>]*>?/gm, '')}
                    </p>
                  )}
                  <div className="pt-2">
                    <Link
                      href={`/anime/${data[0].id}`}
                      className="inline-block border border-border px-6 py-2 font-mono text-[10px] font-bold uppercase hover:bg-white hover:text-black transition-all"
                    >
                      Examine_Dataset
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Secondary Features */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-6">
            {data.slice(1, 5).map((anime, index) => (
              <PosterCard
                key={anime.id}
                anime={anime}
                rank={showRank ? (page - 1) * perPage + index + 2 : undefined}
                className="scale-90 lg:scale-100"
              />
            ))}
          </div>
        </div>
      )}

      {variant === 'list' && (
        <div className="space-y-4">
          {data.slice(0, 5).map((anime, index) => (
            <Link
              key={anime.id}
              href={`/anime/${anime.id}`}
              className="group/list flex items-center gap-6 p-4 border border-border hover:bg-white/[0.02] transition-all relative overflow-hidden"
            >
              <div className="font-mono text-[24px] font-bold text-muted-foreground/20 group-hover/list:text-primary/10 transition-colors w-12 shrink-0">
                {(index + 1).toString().padStart(2, '0')}
              </div>
              <div className="w-16 h-20 border border-border overflow-hidden shrink-0 relative">
                <Image
                  src={anime.coverImage?.medium || ''}
                  alt={anime.title?.romaji || ''}
                  fill
                  sizes="64px"
                  className="w-full h-full object-cover grayscale active group-hover/list:grayscale-0 transition-all duration-500"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-[9px] text-muted-foreground uppercase">{anime.season} {anime.seasonYear}</span>
                  <span className="w-1 h-[1px] bg-border" />
                  <span className="font-mono text-[9px] text-primary uppercase font-bold">{anime.status?.replace(/_/g, ' ')}</span>
                </div>
                <h3 className="font-mono text-[14px] font-bold uppercase truncate group-hover/list:underline underline-offset-4 decoration-1">
                  {anime.title?.userPreferred || anime.title?.romaji}
                </h3>
                <div className="flex gap-2 mt-2">
                  {anime.genres?.slice(0, 3).map(g => (
                    <span key={g} className="font-mono text-[8px] uppercase px-2 py-0.5 border border-border text-muted-foreground">{g}</span>
                  ))}
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-1 font-mono text-[9px] text-muted-foreground uppercase">
                <span>{anime.format}</span>
                <span>{anime.episodes} EP</span>
              </div>
              <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center opacity-0 group-hover/list:opacity-100 transition-opacity">
                <div className="w-2 h-2 border-t border-r border-primary" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {variant === 'grid' && (
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
      )}
    </section>
  )
}
