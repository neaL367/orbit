import type { AiringSchedule } from '@/lib/graphql/types/graphql'

export type ScheduleLink = {
  site: string
  url: string
  icon?: string | null
  color?: string | null
}

export type ScheduleAgendaEntry = {
  schedule: AiringSchedule
  media: NonNullable<AiringSchedule['media']>
  title: string
  airingAt: number
  timeLabel: string
  episodeLabel: string
  formatLabel: string
  durationMinutes: number
  isAiringNow: boolean
  isFinished: boolean
  timeUntilSec: number | null
  statusLabel: string
  countdownLabel: string | null
  streamingLinks: ScheduleLink[]
}

export type ScheduleAgendaSlot = {
  slotKey: string
  slotLabel: string
  entries: ScheduleAgendaEntry[]
}

export type ScheduleAgendaHour = {
  hourKey: string
  hourLabel: string
  slotCount: number
  entryCount: number
  slots: ScheduleAgendaSlot[]
}

export type ScheduleDaySummary = {
  live: ScheduleAgendaEntry[]
  soon: ScheduleAgendaEntry[]
  later: ScheduleAgendaEntry[]
}

export type ScheduleDayModel = {
  index: number
  name: string
  shortName: string
  dateString: string
  compactDate: string
  isToday: boolean
  totalCount: number
  liveCount: number
  nextLabel: string | null
  entries: ScheduleAgendaEntry[]
  summary: ScheduleDaySummary
  agendaHours: ScheduleAgendaHour[]
}
