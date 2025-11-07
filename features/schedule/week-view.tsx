'use client'

import { useMemo } from 'react'
import { UpcomingAiringCarousel } from '@/features/anime-carousel'
import { DaySection } from './day-section'
import { formatTime, getStreamingLinks } from './utils'
import type { AiringSchedule } from '@/graphql/graphql'

type WeekViewProps = {
  schedules: AiringSchedule[]
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

export function WeekView({ schedules }: WeekViewProps) {

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

    // Process all schedules (deduplication by schedule ID is already done in content.tsx)
    schedules.forEach((schedule) => {
      const airingAt = schedule.airingAt
      const date = new Date(airingAt * 1000)
      const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.
      const format = schedule.media?.format
      const formatKey = format ? String(format) : 'UNKNOWN'

      // Group by format within each day
      if (!grouped[dayOfWeek][formatKey]) {
        grouped[dayOfWeek][formatKey] = []
      }
      grouped[dayOfWeek][formatKey].push(schedule)
    })

    // Sort each day's format groups by airing time
    Object.keys(grouped).forEach((day) => {
      Object.keys(grouped[Number(day)]).forEach((format) => {
        grouped[Number(day)][format].sort((a, b) => a.airingAt - b.airingAt)
      })
    })

    return grouped
  }, [schedules])

  const todayIndex = new Date().getDay()

  // Get days to display: today, next 2 days, and previous days
  const displayDays = useMemo(() => {
    const todayIdx = DAYS_OF_WEEK.findIndex(day => day.index === todayIndex)
    if (todayIdx === -1) {
      return { today: null, nextDays: [], previousDays: [] }
    }

    // Get today
    const today = DAYS_OF_WEEK[todayIdx]

    // Get next 2 days
    const nextDays: Array<{ index: number; name: string }> = []
    for (let i = 1; i < 3; i++) {
      const idx = (todayIdx + i) % DAYS_OF_WEEK.length
      nextDays.push(DAYS_OF_WEEK[idx])
    }

    // Get previous days (for showing "No airings scheduled")
    // Previous days are all days before today in the week
    const previousDays: Array<{ index: number; name: string }> = []
    for (let i = 0; i < todayIdx; i++) {
      previousDays.push(DAYS_OF_WEEK[i])
    }

    return { today, nextDays, previousDays }
  }, [todayIndex])

  return (
    <div className="space-y-12">
      {/* Upcoming Airing Carousel */}
      <div className="mb-12">
        <UpcomingAiringCarousel hideViewAll />
      </div>

      {/* Today - Always on top */}
      {displayDays.today && (
        <DaySection
          dayName={displayDays.today.name}
          isToday={true}
          schedulesByFormat={schedulesByDay[displayDays.today.index]}
          formatTime={formatTime}
          getStreamingLinks={getStreamingLinks}
        />
      )}

      {/* Next 2 Days */}
      {displayDays.nextDays.map(({ index: dayIndex, name: dayName }) => (
        <DaySection
          key={dayIndex}
          dayName={dayName}
          schedulesByFormat={schedulesByDay[dayIndex]}
          formatTime={formatTime}
          getStreamingLinks={getStreamingLinks}
        />
      ))}
    </div>
  )
}

