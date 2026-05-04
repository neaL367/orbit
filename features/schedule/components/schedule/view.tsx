'use client'

import { addDays, format, fromUnixTime, getDay } from 'date-fns'
import { useMemo, useState } from 'react'
import { useCurrentTime } from '@/hooks/use-current-time'
import { getAnimeTitle, formatTimeUntilAiring } from '@/lib/utils/anime-utils'
import { DaySection } from '../day-section/day-section'
import { DaySelector } from '../day-selector/day-selector'
import { ScheduleBroadcastHeader } from './broadcast-header'
import { formatTime, getStreamingLinks } from './utils'
import type { AiringSchedule } from '@/lib/graphql/types/graphql'
import type { ScheduleAgendaEntry, ScheduleAgendaHour, ScheduleDayModel } from './types'

type ScheduleViewProps = {
  data: AiringSchedule[]
}

const SOON_WINDOW_SECONDS = 3 * 60 * 60

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
  const today = new Date()
  const todayIndex = getDay(today)
  const todayKey = format(today, 'yyyy-MM-dd')
  const now = useCurrentTime()
  const [selectedDay, setSelectedDay] = useState<number>(todayIndex)

  const rotatedDays = useMemo(() => {
    const todayDayIndex = DAYS_OF_WEEK.findIndex((day) => day.index === todayIndex)

    if (todayDayIndex === -1) {
      return DAYS_OF_WEEK.map((day) => ({ ...day, isToday: false }))
    }

    return [
      { ...DAYS_OF_WEEK[todayDayIndex], isToday: true },
      ...DAYS_OF_WEEK.slice(todayDayIndex + 1).map((day) => ({ ...day, isToday: false })),
      ...DAYS_OF_WEEK.slice(0, todayDayIndex).map((day) => ({ ...day, isToday: false })),
    ]
  }, [todayIndex])

  const days = useMemo<ScheduleDayModel[]>(() => {
    const [year, month, dayOfMonth] = todayKey.split('-').map(Number)
    const baseDate = new Date(year, month - 1, dayOfMonth)
    const grouped: Record<number, AiringSchedule[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      0: [],
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

    for (const schedule of data) {
      const dayOfWeek = getDay(fromUnixTime(schedule.airingAt))

      if (seenPerDay[dayOfWeek].has(schedule.id)) continue

      grouped[dayOfWeek].push(schedule)
      seenPerDay[dayOfWeek].add(schedule.id)
    }

    for (const day of Object.keys(grouped)) {
      grouped[Number(day)].sort((a, b) => a.airingAt - b.airingAt)
    }

    return rotatedDays.map((day, offset) => {
      const date = addDays(baseDate, offset)
      const entries = grouped[day.index]
        .filter((schedule): schedule is AiringSchedule & { media: NonNullable<AiringSchedule['media']> } => Boolean(schedule.media))
        .map<ScheduleAgendaEntry>((schedule) => {
          const media = schedule.media
          const durationMinutes = media.duration || 24
          const isAiringNow = now != null && now >= schedule.airingAt && now <= schedule.airingAt + durationMinutes * 60
          const isFinished = now != null && now > schedule.airingAt + durationMinutes * 60
          const timeUntilSec = now != null ? schedule.airingAt - now : null
          const countdownLabel = timeUntilSec && timeUntilSec > 0 ? formatTimeUntilAiring(timeUntilSec) : null

          return {
            schedule,
            media,
            title: getAnimeTitle(media),
            airingAt: schedule.airingAt,
            timeLabel: formatTime(schedule.airingAt),
            episodeLabel: schedule.episode.toString().padStart(2, '0'),
            formatLabel: formatMediaKind(media.format ? String(media.format) : undefined),
            durationMinutes,
            isAiringNow,
            isFinished,
            timeUntilSec,
            statusLabel: isFinished ? 'Ended' : isAiringNow ? 'On air' : countdownLabel ? `In ${countdownLabel}` : 'Upcoming',
            countdownLabel,
            streamingLinks: getStreamingLinks(schedule),
          }
        })

      const live = entries.filter((entry) => entry.isAiringNow)
      const soon = entries.filter(
        (entry) =>
          !entry.isAiringNow &&
          !entry.isFinished &&
          entry.timeUntilSec != null &&
          entry.timeUntilSec > 0 &&
          entry.timeUntilSec <= SOON_WINDOW_SECONDS
      )
      const later = entries.filter(
        (entry) =>
          !entry.isAiringNow &&
          !entry.isFinished &&
          (entry.timeUntilSec == null || entry.timeUntilSec > SOON_WINDOW_SECONDS)
      )

      return {
        index: day.index,
        name: day.name,
        shortName: day.name.slice(0, 3),
        dateString: format(date, 'EEEE, do MMM'),
        compactDate: format(date, 'd MMM'),
        isToday: day.isToday,
        totalCount: entries.length,
        liveCount: live.length,
        nextLabel: live.length > 0 ? 'Live now' : soon[0]?.timeLabel ?? later[0]?.timeLabel ?? null,
        entries,
        summary: {
          live,
          soon,
          later,
        },
        agendaHours: buildAgendaHours(entries),
      }
    })
  }, [data, now, rotatedDays, todayKey])

  const activeDay = days.find((day) => day.index === selectedDay) ?? days[0]

  return (
    <div className="space-y-4 md:space-y-5">
      <ScheduleBroadcastHeader days={days} activeDay={activeDay} />

      <DaySelector
        days={days}
        selectedDay={selectedDay}
        onSelectDayAction={setSelectedDay}
      />

      {activeDay ? <DaySection day={activeDay} /> : null}
    </div>
  )
}

function formatMediaKind(format: string | undefined): string {
  if (!format) return 'Series'

  const labels: Record<string, string> = {
    TV: 'TV',
    TV_SHORT: 'Short TV',
    MOVIE: 'Movie',
    OVA: 'OVA',
    ONA: 'ONA',
    SPECIAL: 'Special',
    MUSIC: 'Music',
  }

  return labels[format] ?? format.replace(/_/g, ' ')
}

function buildAgendaHours(entries: ScheduleAgendaEntry[]): ScheduleAgendaHour[] {
  const hourMap = new Map<string, ScheduleAgendaHour>()

  for (const entry of entries) {
    const date = fromUnixTime(entry.airingAt)
    const hourKey = format(date, 'yyyy-MM-dd-HH')
    const slotKey = format(date, 'yyyy-MM-dd-HH-mm')

    let hourGroup = hourMap.get(hourKey)
    if (!hourGroup) {
      hourGroup = {
        hourKey,
        hourLabel: format(date, 'h a'),
        slotCount: 0,
        entryCount: 0,
        slots: [],
      }
      hourMap.set(hourKey, hourGroup)
    }

    let slot = hourGroup.slots.find((candidate) => candidate.slotKey === slotKey)
    if (!slot) {
      slot = {
        slotKey,
        slotLabel: format(date, 'h:mm a'),
        entries: [],
      }
      hourGroup.slots.push(slot)
      hourGroup.slotCount += 1
    }

    slot.entries.push(entry)
    hourGroup.entryCount += 1
  }

  return [...hourMap.values()].sort((a, b) => a.hourKey.localeCompare(b.hourKey))
}
