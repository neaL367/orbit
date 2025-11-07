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
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-zinc-800 rounded w-64" />
            <div className="grid grid-cols-7 gap-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-6 bg-zinc-800 rounded" />
                  <div className="space-y-2">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-24 bg-zinc-800 rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
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

