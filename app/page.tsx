import { Suspense } from 'react'
import { AnimeSection } from '@/features/home/components/section/anime-section'
import { NextAiring } from '@/features/home/components/next-airing'

function SectionSkeleton({ variant = 'grid' }: { variant?: 'grid' | 'featured' | 'list' | 'compact' }) {
  return (
    <div className="mb-24 space-y-12 animate-pulse opacity-50">
      <div className="h-10 w-48 bg-secondary/40 border border-white/5 index-cut-tr" />

      {variant === 'featured' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 aspect-[16/9] bg-secondary/20 border border-white/5" />
          <div className="lg:col-span-5 grid grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-secondary/20 border border-white/5" />
            ))}
          </div>
        </div>
      )}

      {variant === 'list' && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 border border-white/5 bg-secondary/10 flex gap-6 p-4">
              <div className="w-12 h-full bg-white/5" />
              <div className="w-16 h-full bg-white/5 border border-white/5" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 bg-white/5" />
                <div className="h-6 w-1/2 bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {variant === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[2/3] bg-secondary/20 border border-white/5" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { getScheduleAnime } from '@/lib/graphql/data'

export default async function HomePage() {
  const scheduleData = await getScheduleAnime(1, 5)

  return (
    <div className="space-y-24">
      {/* Primary Registry Hero (Integrated Next Airing) */}
      <Suspense fallback={<div className="h-[70vh] md:h-[85vh] bg-secondary/5 shimmer" />}>
        <NextAiring className="h-[70vh] md:h-[85vh]" initialData={scheduleData} />
      </Suspense>

      <div className="space-y-40">
        <Suspense fallback={<SectionSkeleton variant="featured" />}>
          <AnimeSection
            type="trending"
            title="Trending"
            subtitle="Archive_Pulse"
            viewAllHref="/anime?sort=trending"
            variant="featured"
            perPage={5}
          />
        </Suspense>

        <Suspense fallback={<SectionSkeleton variant="grid" />}>
          <AnimeSection
            type="seasonal"
            subtitle="Current_Cycle"
            viewAllHref="/anime?sort=seasonal"
            variant="grid"
          />
        </Suspense>

        <Suspense fallback={<SectionSkeleton variant="list" />}>
          <AnimeSection
            type="upcoming"
            subtitle="Upcoming_Cycle"
            viewAllHref="/anime?sort=seasonal"
            variant="list"
            perPage={5}
          />
        </Suspense>

        <Suspense fallback={<SectionSkeleton variant="grid" />}>
          <AnimeSection
            type="popular"
            title="Popular"
            subtitle="Mass_Registry"
            viewAllHref="/anime?sort=popular"
            variant="grid"
          />
        </Suspense>

        <Suspense fallback={<SectionSkeleton variant="list" />}>
          <AnimeSection
            type="top-rated"
            title="Top_Rated"
            subtitle="Elite_Index"
            viewAllHref="/anime?sort=top-rated"
            showRank={true}
            variant="list"
            perPage={5}
          />
        </Suspense>
      </div>
    </div>
  )
}
