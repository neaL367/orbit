import { Suspense } from 'react'
import { connection } from 'next/server'
import { AnimeSection } from '@/features/home/components/section/anime-section'
import {
  getCurrentSeason,
  getCurrentYear,
} from '@/lib/utils'
import { NextAiring } from '@/features/home/components/next-airing'

function SectionSkeleton() {
  return (
    <div className="mb-20">
      <div className="h-8 w-48 bg-secondary border border-border shimmer mb-12" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[2/3] border border-border shimmer" />
            <div className="h-3 w-3/4 bg-secondary shimmer" />
            <div className="h-2 w-1/2 bg-secondary shimmer" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function HomePage() {
  await connection()
  const currentSeason = getCurrentSeason()
  const currentYear = getCurrentYear()

  return (
    <div className="space-y-24">
      {/* Hero / Intro (Minimalist) */}
      <section className="py-12 md:py-24 border-b border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full -z-10" />
        <h1 className="text-5xl sm:text-7xl md:text-9xl lg:text-[12rem] font-mono leading-[0.8] tracking-tighter uppercase mb-8 md:mb-12">
          INDEX<span className="text-primary/10">X</span>
        </h1>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-10 font-mono text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <p className="max-w-md leading-relaxed">
            Systemized registry for high-fidelity anime discovery.
            Calibrated for deliberate exploration within the global archive.
          </p>
          <div className="flex flex-wrap gap-8 md:gap-16 border-l border-border pl-6 md:pl-8 relative">
            <div className="absolute top-0 left-0 w-[1px] h-12 bg-gradient-to-b from-transparent via-primary to-transparent" />
            <div className="space-y-1">
              <span className="text-muted-foreground/50 text-[9px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                CORE_STATUS
              </span>
              <span className="text-foreground block font-bold tracking-[0.2em] relative">
                SYSCAL_LOCKED
                <span className="absolute -top-1 -right-2 w-1 h-1 bg-foreground/50" />
                <span className="absolute -bottom-1 -left-2 w-1 h-1 bg-foreground/50" />
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground/50 text-[9px]">REGISTRY_SIZE</span>
              <span className="text-foreground block font-bold tracking-[0.2em]">
                24,812<span className="text-muted-foreground/30">_ENTRIES</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <NextAiring className="h-[40vh] md:h-[50vh]" />

      <div className="space-y-32">
        <Suspense fallback={<SectionSkeleton />}>
          <AnimeSection
            type="trending"
            title="Trending"
            subtitle="Archive_Pulse"
            viewAllHref="/anime?sort=trending"
          />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <AnimeSection
            type="seasonal"
            title="Seasonal"
            subtitle={`${currentSeason}_${currentYear}`}
            season={currentSeason}
            year={currentYear}
            viewAllHref="/anime?sort=seasonal"
          />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <AnimeSection
            type="popular"
            title="Popular"
            subtitle="Mass_Registry"
            viewAllHref="/anime?sort=popular"
          />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <AnimeSection
            type="top-rated"
            title="Top_Rated"
            subtitle="Elite_Index"
            viewAllHref="/anime?sort=top-rated"
            showRank={true}
          />
        </Suspense>
      </div>
    </div>
  )
}
