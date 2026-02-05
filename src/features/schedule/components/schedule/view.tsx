'use client'

import { addDays, format, fromUnixTime, getDay } from 'date-fns'
import { useMemo } from 'react'
import { DaySection } from '../day-section/day-section'
import { formatTime, getStreamingLinks } from './utils'
import type { AiringSchedule } from '@/lib/graphql/types/graphql'

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

    const seenPerDay: Record<number, Set<number>> = {
      1: new Set(),
      2: new Set(),
      3: new Set(),
      4: new Set(),
      5: new Set(),
      6: new Set(),
      0: new Set(),
    }

    data.forEach((schedule) => {
      const airingAt = schedule.airingAt
      const date = fromUnixTime(airingAt)
      const dayOfWeek = getDay(date)
      const format = schedule.media?.format
      const formatKey = format ? String(format) : 'UNKNOWN'

      if (seenPerDay[dayOfWeek].has(schedule.id)) return

      if (!grouped[dayOfWeek][formatKey]) {
        grouped[dayOfWeek][formatKey] = []
      }
      grouped[dayOfWeek][formatKey].push(schedule)
      seenPerDay[dayOfWeek].add(schedule.id)
    })

    Object.keys(grouped).forEach((day) => {
      Object.keys(grouped[Number(day)]).forEach((format) => {
        grouped[Number(day)][format].sort((a, b) => a.airingAt - b.airingAt)
      })
    })

    return grouped
  }, [data])

  const today = new Date()
  const todayIndex = getDay(today)

  const todayDayIndex = DAYS_OF_WEEK.findIndex(day => day.index === todayIndex)
  const sortedDays = todayDayIndex === -1
    ? DAYS_OF_WEEK
    : [
      DAYS_OF_WEEK[todayDayIndex],
      ...DAYS_OF_WEEK.slice(todayDayIndex + 1),
      ...DAYS_OF_WEEK.slice(0, todayDayIndex)
    ]

  const formatDateLabel = (date: Date): string => {
    return format(date, 'do MMM')
  }

  return (
    <div className="space-y-32">
      {/* All Days of the Week - Today first */}
      {sortedDays.map(({ index: dayIndex, name: dayName }, arrayIndex) => {
        const date = addDays(today, arrayIndex)
        const dateString = formatDateLabel(date)
        return (
          <DaySection
            key={dayIndex}
            dayName={dayName}
            dateString={dateString}
            isToday={dayIndex === todayIndex}
            schedulesByFormat={schedulesByDay[dayIndex]}
            formatTimeAction={formatTime}
            getStreamingLinksAction={getStreamingLinks}
          />
        )
      })}

    </div>
  )
}
