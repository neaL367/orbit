'use client'

import { useQueries } from '@tanstack/react-query'
import { Suspense, useMemo } from 'react'
import { ScheduleView } from './schedule-view'
import { BackButton } from '@/features/shared'
import { ScheduleLoading } from './schedule-loading'
import { ScheduleAnimeQuery } from '@/queries/media'
import { execute } from '@/graphql/execute'
import { CACHE_TIMES } from '@/lib/constants'
import type { AiringSchedule } from '@/graphql/graphql'

// Helper function to get start and end timestamps for each day of the week
// Returns an array of 7 day ranges, starting from today
function getDayRanges(): Array<{ dayIndex: number; start: number; end: number }> {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const ranges: Array<{ dayIndex: number; start: number; end: number }> = []

  // Generate 7 day ranges starting from today
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(today)
    dayDate.setDate(today.getDate() + i)
    
    // Start of day (00:00:00)
    const start = new Date(dayDate)
    start.setHours(0, 0, 0, 0)
    
    // End of day (23:59:59)
    const end = new Date(dayDate)
    end.setHours(23, 59, 59, 999)
    
    // Calculate day index (0 = Sunday, 1 = Monday, etc.)
    const dayIndex = dayDate.getDay()
    
    ranges.push({
      dayIndex,
      start: Math.floor(start.getTime() / 1000), // Convert to Unix timestamp (seconds)
      end: Math.floor(end.getTime() / 1000),
    })
  }

  return ranges
}

function ScheduleContent() {
  // Get day ranges for the next 7 days
  const dayRanges = useMemo(() => getDayRanges(), [])

  // Fetch schedules for each day in parallel
  const dayQueries = useQueries({
    queries: dayRanges.map(({ dayIndex, start, end }) => ({
      queryKey: ['ScheduleAnime', dayIndex, start, end],
      queryFn: async () => {
        const result = await execute(ScheduleAnimeQuery, {
          page: 1,
          perPage: 500, // Large perPage since we're querying by day
          notYetAired: true,
          airingAt_greater: start,
          airingAt_lesser: end,
        })
        return result.data
      },
      staleTime: CACHE_TIMES.MEDIUM,
      retry: 2,
    })),
  })

  // Combine all schedules from all days
  const schedules = useMemo(() => {
    const allSchedules: AiringSchedule[] = []

    // Collect schedules from all day queries
    dayQueries.forEach((query) => {
      if (query.data?.Page?.airingSchedules) {
        const validSchedules = query.data.Page.airingSchedules.filter(
          (schedule): schedule is AiringSchedule => schedule !== null && schedule.media !== null
        )
        allSchedules.push(...validSchedules)
      }
    })

    // Deduplicate by schedule ID first
    const seenIds = new Set<number>()
    const schedulesById = new Map<number, AiringSchedule>()
    
    for (const schedule of allSchedules) {
      // Skip if we've already seen this schedule ID
      if (seenIds.has(schedule.id)) {
        continue
      }
      seenIds.add(schedule.id)
      schedulesById.set(schedule.id, schedule)
    }

    // Group by mediaId and keep only the next episode (earliest airing time) for each anime
    const schedulesByMedia = new Map<number, AiringSchedule>()
    
    for (const schedule of schedulesById.values()) {
      const mediaId = schedule.mediaId
      const existing = schedulesByMedia.get(mediaId)
      
      // If no existing schedule for this anime, or this one airs earlier, keep this one
      if (!existing || schedule.airingAt < existing.airingAt) {
        schedulesByMedia.set(mediaId, schedule)
      }
    }

    // Return only the next episode for each anime
    return Array.from(schedulesByMedia.values())
  }, [dayQueries])

  // Check loading and error states
  const isLoading = dayQueries.some((query) => query.isLoading)
  const error = dayQueries.find((query) => query.error)?.error

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16" style={{ maxWidth: '1680px' }}>
        {/* Header Section - Always Visible */}
        <div className="mb-8">
          <BackButton className="mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Anime Schedule</h1>
        </div>

        {/* Content Section - Shows loading, error, or data */}
        {error ? (
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Error loading schedule</h1>
            <p className="text-zinc-400">Please try again later.</p>
          </div>
        ) : isLoading ? (
          <ScheduleLoading />
        ) : (
          <ScheduleView data={schedules} />
        )}
      </div>
    </div>
  )
}

export function Schedule() {
  return (
    <Suspense fallback={<ScheduleLoading />}>
      <ScheduleContent />
    </Suspense>
  )
}

