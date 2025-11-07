'use client'

import { useMemo } from 'react'
import { useGraphQL } from '@/hooks/use-graphql'
import { ScheduleAnimeQuery } from '@/queries/media'
import { CACHE_TIMES } from '@/lib/constants'
import { WeekView } from './week-view'
import { BackButton } from '@/features/shared'
import type { AiringSchedule } from '@/graphql/graphql'

export function Content() {
  const { data, isLoading, error } = useGraphQL(
    ScheduleAnimeQuery,
    {
      page: 1,
      perPage: 50,
      notYetAired: true,
    },
    {
      enabled: true,
      staleTime: CACHE_TIMES.MEDIUM,
      retry: 3,
    }
  )

  const schedules = useMemo(() => {
    if (!data?.Page?.airingSchedules) return []
    return (data.Page.airingSchedules || []).filter(
      (schedule): schedule is AiringSchedule => schedule !== null && schedule.media !== null
    )
  }, [data])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16" style={{ maxWidth: '1680px' }}>
          <div className="animate-pulse space-y-12">
            {/* BackButton skeleton */}
            <div className="h-10 bg-zinc-800 rounded w-24" />

            {/* Title skeleton */}
            <div className="h-12 bg-zinc-800 rounded w-64" />

            {/* Upcoming Carousel and Airing Now Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              {/* Upcoming Carousel skeleton (2/3 width) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 bg-zinc-800 rounded w-48" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="aspect-2/3 bg-zinc-800 rounded-xl" />
                  ))}
                </div>
              </div>

              {/* Airing Now skeleton (1/3 width) */}
              <div className="lg:col-span-1 space-y-4">
                <div className="h-8 bg-zinc-800 rounded w-32" />
                <div className="h-[500px] bg-zinc-900/30 rounded-lg border border-zinc-800/50 p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-zinc-800/50 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>

            {/* Day Sections skeleton */}
            {[...Array(3)].map((_, dayIndex) => (
              <div key={dayIndex} className="space-y-6 rounded-xl border-2 border-zinc-800/50 bg-zinc-900/40 p-6">
                {/* Day Header skeleton */}
                <div className="flex items-center gap-3 pb-4 border-b-2 border-zinc-800/50">
                  <div className="h-8 bg-zinc-800 rounded w-32" />
                  <div className="h-6 bg-zinc-800 rounded w-16 ml-auto" />
                </div>

                {/* Format sections skeleton */}
                <div className="space-y-8">
                  {[...Array(2)].map((_, formatIndex) => (
                    <div key={formatIndex} className="space-y-4">
                      {/* Format Header skeleton */}
                      <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/50">
                        <div className="h-6 bg-zinc-800 rounded w-20" />
                        <div className="h-5 bg-zinc-800 rounded w-8" />
                      </div>

                      {/* Schedule Cards grid skeleton */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, cardIndex) => (
                          <div key={cardIndex} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                            <div className="flex gap-4">
                              {/* Image skeleton */}
                              <div className="w-24 h-36 sm:w-28 sm:h-40 bg-zinc-800 rounded shrink-0" />
                              {/* Content skeleton */}
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-zinc-800 rounded w-20" />
                                <div className="h-4 bg-zinc-800 rounded w-full" />
                                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16" style={{ maxWidth: '1680px' }}>
          <BackButton className="mb-6" />
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Error loading schedule</h1>
            <p className="text-zinc-400">Please try again later.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16" style={{ maxWidth: '1680px' }}>
        <BackButton className="mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold mb-8">Anime Schedule</h1>
        <WeekView schedules={schedules} />
      </div>
    </div>
  )
}

