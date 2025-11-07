'use client'

import { Badge } from '@/components/ui/badge'
import { ScheduleCard } from './card'
import { cn } from '@/lib/utils'
import type { AiringSchedule } from '@/graphql/graphql'

type DaySectionProps = {
  dayName: string
  isToday?: boolean
  schedulesByFormat: Record<string, AiringSchedule[]>
  formatTime: (timestamp: number) => string
  getStreamingLinks: (schedule: AiringSchedule) => Array<{
    site: string
    url: string
    icon?: string | null
    color?: string | null
  }>
}

// Format display order and labels
const FORMAT_ORDER: string[] = ['TV', 'TV_SHORT', 'MOVIE', 'OVA', 'ONA', 'SPECIAL', 'MUSIC', 'UNKNOWN']
const FORMAT_LABELS: Record<string, string> = {
  TV: 'TV',
  TV_SHORT: 'TV Short',
  MOVIE: 'Movie',
  OVA: 'OVA',
  ONA: 'ONA',
  SPECIAL: 'Special',
  MUSIC: 'Music',
  UNKNOWN: 'Other',
}

export function DaySection({ 
  dayName, 
  isToday = false, 
  schedulesByFormat, 
  formatTime, 
  getStreamingLinks 
}: DaySectionProps) {
  // Calculate total schedules
  const totalSchedules = Object.values(schedulesByFormat).reduce((sum, schedules) => sum + schedules.length, 0)
  const hasSchedules = totalSchedules > 0

  // Get formats in order, filtering out empty ones
  const formats = FORMAT_ORDER.filter(format => schedulesByFormat[format] && schedulesByFormat[format].length > 0)

  return (
    <section className={cn(
      'space-y-6 rounded-xl border-2 transition-all',
      isToday && 'bg-zinc-900/60 border-zinc-700/50 shadow-lg shadow-zinc-900/50',
      !isToday && hasSchedules && 'bg-zinc-900/40 border-zinc-800/50',
      !isToday && !hasSchedules && 'bg-zinc-900/20 border-zinc-800/30'
    )}>
      <div className="p-6 space-y-6">
        {/* Day Header */}
        <div className={cn(
          'flex items-center gap-3 pb-4 border-b-2',
          isToday && 'border-zinc-600/50',
          !isToday && hasSchedules && 'border-zinc-800/50',
          !isToday && !hasSchedules && 'border-zinc-800/30'
        )}>
          <div className="flex items-center gap-3 flex-1">
            {isToday && (
              <div className="h-2 w-2 rounded-full bg-yellow-600 animate-pulse" />
            )}
            <h2 className={cn(
              'text-2xl md:text-3xl font-bold',
              (isToday || hasSchedules) && 'text-white',
              !isToday && !hasSchedules && 'text-zinc-500'
            )}>
              {isToday && <span className="text-yellow-500 mr-2 font-semibold">Today</span>}
              {dayName}
            </h2>
          </div>
          {hasSchedules && (
            <Badge 
              variant="outline" 
              className={cn(
                'text-xs px-3 py-1',
                isToday && 'border-blue-600/50 text-blue-300 bg-blue-950/30',
                !isToday && 'border-zinc-700 text-zinc-300'
              )}
            >
              {totalSchedules} {totalSchedules === 1 ? 'anime' : 'anime'}
            </Badge>
          )}
        </div>

        {!hasSchedules ? (
          <div className="text-sm text-zinc-600 text-center py-12 rounded-lg border border-zinc-800/50 bg-zinc-900/30">
            No airings scheduled
          </div>
        ) : (
          <div className="space-y-8">
            {formats.map((format) => {
              const schedules = schedulesByFormat[format] || []
              if (schedules.length === 0) return null

              return (
                <div key={format} className="space-y-4">
                  {/* Format Header */}
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/50">
                    <h3 className="text-lg font-semibold text-zinc-300">
                      {FORMAT_LABELS[format] || format.replace(/_/g, ' ')}
                    </h3>
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-zinc-700 text-zinc-400">
                      {schedules.length}
                    </Badge>
                  </div>

                  {/* Schedule Cards */}
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
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

