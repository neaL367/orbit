'use client'

import { Badge } from '@/components/ui/badge'
import { ScheduleCard } from './card'
import { cn } from '@/lib/utils'
import type { AiringSchedule } from '@/graphql/graphql'

type DaySectionProps = {
  dayName: string
  dateString?: string
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
  dateString,
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

  // Determine section background for sticky header
  const sectionBg = isToday 
    ? 'bg-zinc-900/60' 
    : hasSchedules 
      ? 'bg-zinc-900/40' 
      : 'bg-zinc-900/20'

  return (
    <section className={cn(
      'space-y-6 rounded-xl border-2 transition-all',
      isToday && 'bg-zinc-950 border-zinc-700/50 shadow-lg shadow-zinc-900/50',
      !isToday && hasSchedules && 'bg-zinc-900/40 border-zinc-800/50',
      !isToday && !hasSchedules && 'bg-zinc-900/20 border-zinc-800/30'
    )}>
      <div className="px-6 pb-6 space-y-6">
        {/* Day Header - Sticky */}
        <div className={cn(
          'sticky top-16 z-20 py-4 -mx-6 px-6 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl rounded-t-xl',
          sectionBg,
          isToday && 'border-zinc-600/50',
          !isToday && hasSchedules && 'border-zinc-800/50',
          !isToday && !hasSchedules && 'border-zinc-800/30'
        )}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              {isToday && (
                <Badge className="px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50 text-yellow-400 font-semibold shadow-lg shadow-yellow-500/20 animate-pulse">
                  Today
                </Badge>
              )}
              <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                <h2 className={cn(
                  'text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight',
                  isToday && 'text-white',
                  !isToday && hasSchedules && 'text-white',
                  !isToday && !hasSchedules && 'text-zinc-500'
                )}>
                  {dayName}
                </h2>
                {dateString && (
                  <span className={cn(
                    'text-sm sm:text-base md:text-lg font-medium',
                    isToday && 'text-zinc-300',
                    !isToday && hasSchedules && 'text-zinc-400',
                    !isToday && !hasSchedules && 'text-zinc-600'
                  )}>
                    {dateString}
                  </span>
                )}
              </div>
            </div>
            {hasSchedules && (
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs px-3 py-1 whitespace-nowrap',
                  isToday && 'border-blue-600/50 text-blue-300 bg-blue-950/30',
                  !isToday && 'border-zinc-700 text-zinc-300'
                )}
              >
                {totalSchedules} {totalSchedules === 1 ? 'anime' : 'anime'}
              </Badge>
            )}
          </div>
        </div>

        {!hasSchedules ? (
          <div className="text-sm text-zinc-600 text-center py-12 rounded-lg border border-zinc-800/50 bg-zinc-900/30">
            No airings scheduled
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {formats.map((format, formatIndex) => {
              const schedules = schedulesByFormat[format] || []
              if (schedules.length === 0) return null

              return (
                <div key={format} className={cn(
                  "space-y-4",
                  formatIndex === 0 ? "pt-0" : "pt-8"
                )}>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
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

