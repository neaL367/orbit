'use client'

import { Badge } from '@/components/ui/badge'
import { ScheduleCard } from './schedule-card'
import type { AiringSchedule } from '@/graphql/graphql'

type DaySectionProps = {
  dayName: string
  isToday?: boolean
  schedules: AiringSchedule[]
  formatTime: (timestamp: number) => string
  getStreamingLinks: (schedule: AiringSchedule) => Array<{
    site: string
    url: string
    icon?: string | null
    color?: string | null
  }>
}

export function DaySection({ 
  dayName, 
  isToday = false, 
  schedules, 
  formatTime, 
  getStreamingLinks 
}: DaySectionProps) {
  const hasSchedules = schedules.length > 0

  return (
    <section className="space-y-6">
      {/* Day Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
        <h2 className={`text-2xl md:text-3xl font-bold ${isToday ? 'text-white' : hasSchedules ? 'text-white' : 'text-zinc-500'}`}>
          {isToday && <span className="text-zinc-400 mr-2">Today</span>}
          {dayName}
        </h2>
        {hasSchedules && (
          <Badge variant="outline" className="text-xs px-3 py-1 border-zinc-700 text-zinc-300">
            {schedules.length} {schedules.length === 1 ? 'anime' : 'anime'}
          </Badge>
        )}
      </div>

      {!hasSchedules ? (
        <div className="text-sm text-zinc-600 text-center py-12 rounded-lg border border-zinc-800 bg-zinc-900/30">
          No airings scheduled
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
    </section>
  )
}

