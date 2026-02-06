'use client'

import { ScheduleCard } from '../schedule/card'
import { cn } from '@/lib/utils'
import type { AiringSchedule } from '@/lib/graphql/types/graphql'
import { IndexSectionHeader } from '@/components/shared/index-section-header'

type DaySectionProps = {
  dayName: string
  dateString?: string
  isToday?: boolean
  schedulesByFormat: Record<string, AiringSchedule[]>
  formatTimeAction: (timestamp: number) => string
  getStreamingLinksAction: (schedule: AiringSchedule) => Array<{
    site: string
    url: string
    icon?: string | null
    color?: string | null
  }>
}

const FORMAT_ORDER: string[] = ['TV', 'TV_SHORT', 'MOVIE', 'OVA', 'ONA', 'SPECIAL', 'MUSIC', 'UNKNOWN']
const FORMAT_LABELS: Record<string, string> = {
  TV: 'TV_BROADCAST',
  TV_SHORT: 'TV_SHORT',
  MOVIE: 'CINEMATIC',
  OVA: 'OVAL_DOC',
  ONA: 'NET_ARCHIVE',
  SPECIAL: 'RESERVED',
  MUSIC: 'AUDIO_VISUAL',
  UNKNOWN: 'UNCLASSIFIED',
}

export function DaySection({
  dayName,
  dateString,
  isToday = false,
  schedulesByFormat,
  formatTimeAction,
  getStreamingLinksAction
}: DaySectionProps) {
  const totalSchedules = Object.values(schedulesByFormat).reduce((sum, schedules) => sum + schedules.length, 0)
  const hasSchedules = totalSchedules > 0
  const formats = FORMAT_ORDER.filter(format => schedulesByFormat[format] && schedulesByFormat[format].length > 0)

  return (
    <section className="reveal">
      <div className="space-y-16">
        <div className="sticky top-16 z-20 bg-background/95 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 border-b border-border/50">
          <IndexSectionHeader
            title={dayName}
            subtitle={isToday ? `TODAY // ${dateString}` : dateString}
            className={cn(
              "mb-0",
              isToday && "text-foreground",
              isToday && "after:absolute after:inset-0 after:bg-white/[0.02] after:-z-10 after:blur-xl"
            )}
          />
        </div>

        {!hasSchedules ? (
          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/30 py-8 border border-border border-dashed text-center">
            No_Broadcasts_Logged
          </div>
        ) : (
          <div className="space-y-20">
            {formats.map((format) => {
              const schedules = schedulesByFormat[format] || []
              if (schedules.length === 0) return null

              return (
                <div key={format} className="space-y-8">
                  {/* Format Sub-header */}
                  <div className="flex items-center gap-4">
                    <div className="bg-muted px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      {FORMAT_LABELS[format] || format}
                    </div>
                    <div className="flex-1 h-[1px] bg-border/50" />
                    <span className="font-mono text-[10px] uppercase text-muted-foreground/40 tracking-widest">
                      QTY: {schedules.length}
                    </span>
                  </div>

                  {/* Schedule Cards Stack (Registry Flow) */}
                  <div className="flex flex-col gap-2">
                    {schedules.map((schedule) => {
                      const media = schedule.media
                      if (!media) return null

                      return (
                        <ScheduleCard
                          key={schedule.id}
                          schedule={schedule}
                          media={media}
                          formatTimeAction={formatTimeAction}
                          getStreamingLinksAction={getStreamingLinksAction}
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
