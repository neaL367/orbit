import type { Route } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { PosterCard } from '@/features/anime/components/poster-card/poster-card'
import { IndexSectionHeader } from '@/components/shared/index-section-header'
import { ErrorState } from '@/components/shared/error-state'
import { cn } from '@/lib/utils'
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
      <div className="mb-20 space-y-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 animate-pulse">Initializing_Databank...</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] border border-white/5 bg-white/[0.01] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 animate-shimmer" />
              <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/10" />
              <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/10" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <section className="mb-20 border border-red-500/20 bg-red-500/5 p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,0,0,0.05)_10px,rgba(255,0,0,0.05)_20px)] pointer-events-none" />
        <IndexSectionHeader title="CRITICAL_FAILURE" subtitle="LINK_SEVERED" />
        <ErrorState
          message="Registry_Connection_Failed: 0xERR_TIMEOUT"
          onRetry={onRetry}
        />
        <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-red-500/50 uppercase tracking-widest">
          ERR_CODE: 503
        </div>
      </section>
    )
  }

  if (data.length === 0) {
    return null
  }

  return (
    <section className="mb-32 group/section reveal relative">
      <div className="flex items-end justify-between gap-4 relative z-10 mb-10 border-b border-white/10 pb-4">
        <IndexSectionHeader
          title={title}
          subtitle={subtitle || "General_Archive"}
          className="flex-1 mb-0"
        />
        {viewAllHref && (
          <Link
            href={viewAllHref as Route}
            className="hidden sm:flex font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-all items-center gap-3 group/link mb-1"
          >
            <span className="opacity-60 group-hover/link:opacity-100 transition-opacity">Access_Full_Log</span>
            <div className="w-4 h-[1px] bg-primary/20 group-hover:bg-primary group-hover:w-8 transition-all" />
          </Link>
        )}
      </div>

      <div className="relative z-10">
        {variant === 'featured' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
            {/* 1. Primary Feature Module */}
            <div className="lg:col-span-7">
              {data[0] && (
                <div className="relative group/feat overflow-hidden border border-white/5 bg-secondary/5 hover:border-primary/20 transition-all duration-700">
                  {/* Visual Uplink Container */}
                  <div className="aspect-[16/9] w-full overflow-hidden relative">
                    <Image
                      src={data[0].bannerImage || data[0].coverImage?.extraLarge || ''}
                      alt={data[0].title?.romaji || ''}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 800px"
                      className="w-full h-full object-cover grayscale brightness-75 group-hover/feat:grayscale-0 group-hover/feat:scale-105 transition-all duration-[1.5s] ease-out will-change-transform"
                    />

                    {/* Atmospheric Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />

                    {/* Corner Bracket Decorations */}
                    <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-primary/40 pointer-events-none group-hover/feat:scale-110 transition-transform" />
                    <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-primary/40 pointer-events-none group-hover/feat:scale-110 transition-transform" />

                    {/* Active Scanning Interface */}
                  </div>

                  {/* Top-Right Technical Registry */}
                  <div className="absolute top-0 right-0 p-6 flex flex-col items-end gap-1 font-mono">
                    <div className="flex items-center gap-2 px-2 py-0.5 bg-primary/10 border border-primary/20">
                      <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em]">Registry_Pulse</span>
                    </div>
                    <span className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-bold">ARC-0x{data[0].id}</span>
                  </div>

                  {/* Main Data Display */}
                  <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 pointer-events-none">
                    <div className="space-y-6 max-w-2xl relative z-10 pointer-events-auto">
                      {/* Header Badge */}
                      {/* <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                        <span className="font-mono text-[9px] text-primary/60 uppercase tracking-[0.5em] font-bold">
                          {data[0].season} // {data[0].seasonYear}
                        </span>
                      </div> */}

                      {/* Title Display */}
                      <h3 className="text-3xl sm:text-5xl md:text-6xl font-mono font-black uppercase leading-[0.85] tracking-tighter text-foreground group-hover/feat:text-primary transition-colors duration-700 line-clamp-2 mix-blend-screen drop-shadow-2xl">
                        {data[0].title?.userPreferred || data[0].title?.romaji}
                      </h3>

                      {/* Precision Metadata Strip */}
                      {/* <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-white/10 border border-white/10 max-w-lg">
                        {[
                          { label: "STATUS", value: data[0].status?.replace(/_/g, ' ') },
                          { label: "FORMAT", value: data[0].format?.replace(/_/g, ' '), highlight: true },
                          { label: "AVERAGE", value: `${data[0].averageScore || '??'}%` }
                        ].map((item, i) => (
                          <div key={i} className="bg-background/80 backdrop-blur-md p-3 flex flex-col gap-1 hover:bg-white/5 transition-colors group/m">
                            <span className="font-mono text-[8px] text-muted-foreground/50 uppercase tracking-widest">{item.label}</span>
                            <span className={cn(
                              "font-mono text-[10px] font-black uppercase tracking-wider truncate",
                              item.highlight ? "text-primary" : "text-foreground"
                            )}>{item.value}</span>
                          </div>
                        ))}
                      </div> */}

                      {/* Narrative Log Preview */}
                      {data[0].description && (
                        <p className="text-muted-foreground/50 font-mono text-[11px] leading-relaxed line-clamp-2 uppercase tracking-wide max-w-xl border-l-[3px] border-primary/30 pl-4 py-1">
                          {data[0].description.replace(/<[^>]*>?/gm, '')}
                        </p>
                      )}

                      {/* Action Interface */}
                      <div className="pt-4">
                        <Link
                          href={`/anime/${data[0].id}`}
                          className="group/btn relative inline-flex items-center gap-4 px-10 py-4 bg-foreground text-background font-mono text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:bg-primary  index-cut-tr"
                        >
                          Access_Archive
                          <div className="w-1.5 h-1.5 bg-current rotate-45 transform group-hover/btn:translate-x-1 group-hover/btn:scale-125 transition-all" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Secondary Registry Nodes */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border-l border-primary/40 self-start">
                <span className="font-mono text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Secondary_Nodes [0x04]</span>
              </div>
              <div className="grid grid-cols-2 gap-6 content-start">
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
          </div>
        )}

        {variant === 'list' && (
          <div className="space-y-4 relative">
            {data.slice(0, 5).map((anime, index) => (
              <Link
                key={anime.id}
                href={`/anime/${anime.id}`}
                className="group/list flex items-center gap-4 sm:gap-10 p-4 bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-primary/20 transition-all relative overflow-hidden index-cut-tr"
              >
                {/* Ranking / Index */}
                <div className="font-mono text-2xl sm:text-4xl font-black text-white/[0.03] group-hover/list:text-primary/10 transition-colors w-12 sm:w-16 text-center shrink-0 tracking-tighter tabular-nums">
                  {(index + 1).toString().padStart(2, '0')}
                </div>

                {/* Cover Interface */}
                <div className="w-14 h-20 sm:w-20 sm:h-28 border border-white/10 overflow-hidden shrink-0 relative bg-secondary group-hover:border-primary/40 transition-colors">
                  <Image
                    src={anime.coverImage?.large || anime.coverImage?.medium || ''}
                    alt={anime.title?.romaji || ''}
                    fill
                    sizes="100px"
                    className="w-full h-full object-cover grayscale brightness-75 group-hover/list:grayscale-0 group-hover/list:brightness-100 group-hover/list:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Data Pack */}
                <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <h3 className="font-mono text-sm sm:text-lg lg:text-xl font-black uppercase tracking-tight truncate group-hover/list:text-primary transition-colors pr-4">
                      {anime.title?.userPreferred || anime.title?.romaji}
                    </h3>

                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[9px] text-white/20 uppercase font-bold tracking-widest hidden sm:block">GENRE//</span>
                        <div className="flex gap-1.5 overflow-hidden">
                          {anime.genres?.slice(0, 2).map(g => (
                            <span key={g} className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 bg-white/5 text-muted-foreground/80 border border-white/5 group-hover/list:border-primary/20 transition-colors whitespace-nowrap">{g}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technical Telemetry Row */}
                  <div className="flex items-center gap-8 sm:gap-12 shrink-0 border-l border-white/5 sm:pl-10 h-12">
                    <div className="flex flex-col items-end gap-1 font-mono">
                      <span className="text-[8px] text-white/20 uppercase tracking-[0.3em] font-bold">FORMAT</span>
                      <span className="text-[10px] text-foreground font-black group-hover/list:text-primary transition-colors">{anime.format || '??'}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 font-mono">
                      <span className="text-[8px] text-white/20 uppercase tracking-[0.3em] font-bold">SCORE</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-foreground font-black tracking-widest">{anime.averageScore ? `${anime.averageScore}%` : '---'}</span>
                        <div className={cn("w-1.5 h-1.5 rotate-45", anime.averageScore && anime.averageScore > 75 ? "bg-primary animate-pulse" : "bg-white/10")} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-[1px] bg-gradient-to-l from-primary/20 to-transparent opacity-0 group-hover/list:opacity-100 transition-opacity" />
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/list:opacity-100 transition-opacity">
                  <span className="font-mono text-[8px] text-primary font-bold">0x{anime.id}</span>
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
      </div>

      {/* Decorative Module Brackets */}
      <div className="absolute -top-6 -left-2 w-4 h-4 border-t border-l border-white/10 pointer-events-none" />
      <div className="absolute -top-6 -right-2 w-4 h-4 border-t border-r border-white/10 pointer-events-none" />
      <div className="absolute -top-8 right-10 font-mono text-[8px] text-white/5 uppercase tracking-[0.5em] pointer-events-none hidden sm:block">
        MOD_CORE_PRTCL.0x{title.length}
      </div>
    </section>
  )
}
