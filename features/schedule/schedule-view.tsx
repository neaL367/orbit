'use client'

import { useMemo } from 'react'
import { UpcomingAiringCarousel } from '@/features/anime-carousel'
import { DaySection } from './day-section'
import { formatTime, getStreamingLinks } from './utils'
import type { AiringSchedule } from '@/graphql/graphql'

type ScheduleViewProps = {
  data: AiringSchedule[]
}

const DAYS_OF_WEEK = [
  { index: 1, name: 'Monday' },
  { index: 2, name: 'Tuesday' },
  { index: 3, name: 'Wednesday' },
  { index: 4, name: 'Thursday' },
  { index: 5, name: 'Friday' },
  { index: 6, name: 'Saturday' },
  { index: 0, name: 'Sunday' },
] as const

export function ScheduleView({ data }: ScheduleViewProps) {
  const schedulesByDay = useMemo(() => {
    const grouped: Record<number, Record<string, AiringSchedule[]>> = {
      1: {}, // Monday
      2: {}, // Tuesday
      3: {}, // Wednesday
      4: {}, // Thursday
      5: {}, // Friday
      6: {}, // Saturday
      0: {}, // Sunday
    }

    // Track seen schedules per day to prevent duplicates within the same day
    const seenPerDay: Record<number, Set<number>> = {
      1: new Set(),
      2: new Set(),
      3: new Set(),
      4: new Set(),
      5: new Set(),
      6: new Set(),
      0: new Set(),
    }

    // Process all schedules (deduplication by schedule ID is already done in schedule.tsx)
    data.forEach((schedule) => {
      const airingAt = schedule.airingAt
      const date = new Date(airingAt * 1000)
      const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.
      const format = schedule.media?.format
      const formatKey = format ? String(format) : 'UNKNOWN'

      // Skip if we've already seen this schedule ID for this day (extra safety check)
      if (seenPerDay[dayOfWeek].has(schedule.id)) {
        return
      }

      // Group by format within each day
      if (!grouped[dayOfWeek][formatKey]) {
        grouped[dayOfWeek][formatKey] = []
      }
      grouped[dayOfWeek][formatKey].push(schedule)
      seenPerDay[dayOfWeek].add(schedule.id)
    })

    // Sort each day's format groups by airing time
    Object.keys(grouped).forEach((day) => {
      Object.keys(grouped[Number(day)]).forEach((format) => {
        grouped[Number(day)][format].sort((a, b) => a.airingAt - b.airingAt)
      })
    })

    return grouped
  }, [data])

  const todayIndex = new Date().getDay()

  // Sort days so today appears first, then the rest in order
  const sortedDays = useMemo(() => {
    const todayDayIndex = DAYS_OF_WEEK.findIndex(day => day.index === todayIndex)
    if (todayDayIndex === -1) {
      return DAYS_OF_WEEK
    }
    
    // Reorder: today first, then remaining days
    return [
      DAYS_OF_WEEK[todayDayIndex],
      ...DAYS_OF_WEEK.slice(todayDayIndex + 1),
      ...DAYS_OF_WEEK.slice(0, todayDayIndex)
    ]
  }, [todayIndex])

  return (
    <div className="space-y-12">
      {/* Upcoming Airing Carousel */}
      <div className="mb-12">
        <UpcomingAiringCarousel hideViewAll />
      </div>

      {/* All Days of the Week - Today first */}
      {sortedDays.map(({ index: dayIndex, name: dayName }) => (
        <DaySection
          key={dayIndex}
          dayName={dayName}
          isToday={dayIndex === todayIndex}
          schedulesByFormat={schedulesByDay[dayIndex]}
          formatTime={formatTime}
          getStreamingLinks={getStreamingLinks}
        />
      ))}
    </div>
  )
}

