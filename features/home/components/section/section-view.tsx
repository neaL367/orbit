import type { Route } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { PosterCard } from '@/features/anime/components/poster-card/poster-card'
import { IndexSectionHeader } from '@/components/shared/index-section-header'
import { ErrorState } from '@/components/shared/error-state'
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
    <section className="mb-32 group/section reveal relative">
      <div className="flex items-center justify-between gap-4 relative z-10">
        <IndexSectionHeader
          title={title}
          subtitle={subtitle || "General_Archive"}
          className="flex-1 mb-8 sm:mb-12 md:mb-16"
        />
        {viewAllHref && (
          <Link
            href={viewAllHref as Route}
            className="font-mono text-[9px] uppercase tracking-[0.3em] text-primary/60 hover:text-primary transition-all mb-16 flex items-center gap-3 group/link"
          >
            <span className="opacity-40 group-hover/link:opacity-100 transition-opacity">0xACCESS</span>
            <div className="w-8 h-[1px] bg-primary/20 group-hover:w-12 group-hover:bg-primary/60 transition-all" />
          </Link>
        )}
      </div>

      <div className="relative z-10">
        {variant === 'featured' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Feature */}
            <div className="lg:col-span-7">
              {data[0] && (
                <div className="relative group/feat overflow-hidden border border-white/5 bg-secondary/20">
                  <div className="aspect-[16/9] w-full overflow-hidden relative">
                    <Image
                      src={data[0].bannerImage || data[0].coverImage?.extraLarge || ''}
                      alt={data[0].title?.romaji || ''}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 800px"
                      className="w-full h-full object-cover grayscale opacity-40 group-hover/feat:grayscale-0 group-hover/feat:opacity-100 group-hover/feat:scale-105 transition-all duration-1000 will-change-[transform,filter]"
                    />
                    {/* Technical Overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(var(--primary-rgb),0.15),transparent_70%)] pointer-events-none" />
                  </div>

                  <div className="absolute top-0 right-0 p-4">
                    <div className="flex flex-col items-end gap-1 font-mono text-[8px] text-white/20 uppercase tracking-widest">
                      <span>DATA_STREAM_v.2</span>
                      <span>REF: 0x{data[0].id}</span>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 p-5 sm:p-8 md:p-10 space-y-4 sm:space-y-6 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rotate-45 animate-pulse" />
                        <span className="bg-primary/10 text-primary px-2 py-0.5 sm:px-3 sm:py-1 font-mono text-[8px] sm:text-[9px] font-black uppercase tracking-widest border border-primary/20 whitespace-nowrap">Core_Feature</span>
                      </div>
                      <span className="font-mono text-[8px] sm:text-[10px] text-muted-foreground/60 uppercase tracking-widest truncate">{data[0].format?.replace(/_/g, ' ')} // {data[0].season} {data[0].seasonYear}</span>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <h3 className="text-2xl sm:text-4xl md:text-5xl font-mono font-black uppercase leading-[0.9] tracking-tighter text-foreground group-hover/feat:text-primary transition-colors duration-500 line-clamp-2">
                        {data[0].title?.userPreferred || data[0].title?.romaji}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-1 text-muted-foreground/60 font-mono text-[8px] sm:text-[10px] uppercase tracking-widest">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-white/20">Status:</span>
                          <span className="text-foreground">{data[0].status?.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-white/20">Genres:</span>
                          <span className="text-foreground">{data[0].genres?.slice(0, 2).join(' / ')}</span>
                        </div>
                      </div>
                    </div>

                    {data[0].description && (
                      <p className="text-muted-foreground/60 font-mono text-[10px] sm:text-[11px] leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-lg uppercase tracking-tight opacity-80">
                        {data[0].description.replace(/<[^>]*>?/gm, '')}
                      </p>
                    )}

                    <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-4 sm:gap-6">
                      <Link
                        href={`/anime/${data[0].id}`}
                        className="group/btn relative px-6 py-2.5 sm:px-8 sm:py-3 bg-foreground text-background font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-widest overflow-hidden transition-all hover:pr-10 sm:hover:pr-12"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          Examine_Dataset
                        </span>
                        <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/btn:opacity-100 transition-all group-hover:right-2 sm:group-hover:right-3">
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-background rotate-45" />
                        </div>
                        <div className="absolute inset-y-0 left-0 w-[400%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-scan-vertical pointer-events-none" />
                      </Link>

                      <div className="flex flex-col gap-0.5 sm:gap-1 font-mono text-[7px] sm:text-[8px] text-muted-foreground/40 uppercase tracking-widest">
                        <span>Link_Established</span>
                        <span className="text-primary/40">Secured_Channel</span>
                      </div>
                    </div>
                  </div>

                  {/* Corner Decoration */}
                  <div className="absolute bottom-0 right-0 w-24 h-24 border-b border-r border-primary/10 pointer-events-none" />
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
                  className="scale-95 lg:scale-100"
                />
              ))}
            </div>
          </div>
        )}

        {variant === 'list' && (
          <div className="space-y-2 sm:space-y-3 relative">
            {data.slice(0, 5).map((anime, index) => (
              <Link
                key={anime.id}
                href={`/anime/${anime.id}`}
                className="group/list flex items-center gap-4 sm:gap-8 p-4 sm:p-6 bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-primary/20 transition-all relative overflow-hidden"
              >
                <div className="font-mono text-xl sm:text-3xl font-black text-white/5 group-hover/list:text-primary/10 transition-colors w-8 sm:w-16 shrink-0 tracking-tighter">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                <div className="w-12 h-16 sm:w-20 sm:h-24 border border-white/10 overflow-hidden shrink-0 relative bg-secondary">
                  <Image
                    src={anime.coverImage?.medium || ''}
                    alt={anime.title?.romaji || ''}
                    fill
                    sizes="80px"
                    className="w-full h-full object-cover grayscale opacity-60 group-hover/list:grayscale-0 group-hover/list:opacity-100 group-hover/list:scale-110 transition-all duration-700"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className="font-mono text-[7px] sm:text-[9px] text-muted-foreground/60 uppercase tracking-widest truncate">{anime.season} {anime.seasonYear}</span>
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary/20 rotate-45 shrink-0" />
                    <span className="font-mono text-[7px] sm:text-[9px] text-primary/80 uppercase font-black tracking-widest truncate">{anime.status?.replace(/_/g, ' ')}</span>
                  </div>
                  <h3 className="font-mono text-base sm:text-xl font-black uppercase tracking-tighter truncate group-hover/list:text-primary transition-colors">
                    {anime.title?.userPreferred || anime.title?.romaji}
                  </h3>
                  <div className="hidden sm:flex gap-3">
                    {anime.genres?.slice(0, 3).map(g => (
                      <span key={g} className="font-mono text-[8px] uppercase tracking-[0.2em] px-2 py-0.5 bg-white/5 text-muted-foreground/80">{g}</span>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1.5 font-mono text-[9px] text-muted-foreground/40 uppercase tracking-[0.3em] whitespace-nowrap">
                  <span className="text-foreground/60 font-black">{anime.format}</span>
                  <span>{anime.episodes || '??'} SESSIONS</span>
                </div>

                {/* Technical Indicator */}
                <div className="absolute top-0 right-0 p-1.5 sm:p-2 opacity-0 group-hover/list:opacity-100 transition-opacity">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 border-t border-r border-primary" />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-primary/20 -translate-x-full group-hover/list:translate-x-0 transition-transform duration-700" />
              </Link>
            ))}
          </div>
        )}

        {variant === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-12">
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
      </div>

      {/* Decorative Module Brackets */}
      <div className="absolute -top-6 -left-6 w-12 h-12 border-t border-l border-white/5 pointer-events-none group-hover/section:border-primary/20 transition-colors" />
      <div className="absolute -top-6 right-0 font-mono text-[7px] text-white/10 uppercase tracking-[0.5em] pointer-events-none">
        MOD_CORE_PRTCL.0x{title.length}
      </div>
    </section>
  )
}
