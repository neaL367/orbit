'use client'

import { ScheduleCard } from './schedule-card'
import { SectionHeader } from '@/features/shared'
import type { AiringSchedule } from '@/graphql/graphql'

type AiringNowSectionProps = {
  schedules: AiringSchedule[]
  formatTime: (timestamp: number) => string
  getStreamingLinks: (schedule: AiringSchedule) => Array<{
    site: string
    url: string
    icon?: string | null
    color?: string | null
  }>
}

export function AiringNow({ schedules, formatTime, getStreamingLinks }: AiringNowSectionProps) {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex-shrink-0">
        <div className="flex items-center gap-2">
          <SectionHeader
            title="Airing Now"
            className="mb-7"
          />
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-zinc-600 text-center py-12 rounded-lg border border-zinc-800 bg-zinc-900/30 min-h-[400px]">
          No anime currently airing
        </div>
      ) : (
        <div className="flex-1 h-[500px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          {schedules.map((schedule) => {
            const media = schedule.media
            if (!media) return null

            return (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                media={media}
                formatTime={formatTime}
                getStreamingLinks={getStreamingLinks}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

