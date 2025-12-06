'use client'

import { addDays, format, fromUnixTime, getDay } from 'date-fns'
import { useMemo } from 'react'
import { UpcomingAiringCarousel } from '@/app/_components/carousel'
import { DaySection } from '../day-section'
import { formatTime, getStreamingLinks } from './utils'
import type { AiringSchedule } from '@/lib/graphql/types/graphql'
import { Button } from '@/components/ui/button'
import { useScrollToTop } from '@/app/_hooks/use-scroll-to-top'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'


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
  const { show, scrollToTop } = useScrollToTop(600);

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
      const date = fromUnixTime(airingAt)
      const dayOfWeek = getDay(date) // 0 = Sunday, 1 = Monday, etc.
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

  const today = new Date()
  const todayIndex = getDay(today)

  // Sort days so today appears first, then the rest in order
  // Direct computation without useMemo for React Compiler compatibility
  const todayDayIndex = DAYS_OF_WEEK.findIndex(day => day.index === todayIndex)
  const sortedDays = todayDayIndex === -1
    ? DAYS_OF_WEEK
    : [
        DAYS_OF_WEEK[todayDayIndex],
        ...DAYS_OF_WEEK.slice(todayDayIndex + 1),
        ...DAYS_OF_WEEK.slice(0, todayDayIndex)
      ]

  // Format date as "15th Jan" or "1st Jan" using date-fns
  const formatDate = (date: Date): string => {
    return format(date, 'do MMM')
  }

  return (
    <div className="space-y-12">
      {/* Upcoming Airing Carousel */}
      <div className="mb-12">
        <UpcomingAiringCarousel hideViewAll />
      </div>

      {/* All Days of the Week - Today first */}
      {sortedDays.map(({ index: dayIndex, name: dayName }, arrayIndex) => {
        // Calculate date based on position in sorted array (today is index 0, tomorrow is index 1, etc.)
        const date = addDays(today, arrayIndex)
        const dateString = formatDate(date)
        return (
          <DaySection
            key={dayIndex}
            dayName={dayName}
            dateString={dateString}
            isToday={dayIndex === todayIndex}
            schedulesByFormat={schedulesByDay[dayIndex]}
            formatTime={formatTime}
            getStreamingLinks={getStreamingLinks}
          />
        )
      })}
      <Button
        onClick={scrollToTop}
        className={cn(
          'fixed bottom-8 right-8 z-50 h-12 w-12 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 shadow-lg transition-all duration-300',
          show
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        )}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5 text-white" />
      </Button>
    </div>
  )
}

