'use client'

import { useRef, useState, useEffect } from 'react'
import { ScheduleCard } from '../schedule/card'
import { cn } from '@/lib/utils'
import type { AiringSchedule } from '@/lib/graphql/types/graphql'
import { IndexSectionHeader } from '@/components/shared/index-section-header'

const FORMAT_ORDER = ['TV', 'TV_SHORT', 'MOVIE', 'SPECIAL', 'OVA', 'ONA'] as const
const FORMAT_LABELS: Record<string, string> = {
  TV: 'TV_BROADCAST',
  TV_SHORT: 'TV_SHORT',
  MOVIE: 'CINEMATIC',
  OVA: 'OVA_DOC',
  ONA: 'NET_ARCHIVE',
  SPECIAL: 'RESERVED',
}

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
  priority?: boolean
}

export function DaySection({
  dayName,
  dateString,
  isToday = false,
  schedulesByFormat,
  formatTimeAction,
  getStreamingLinksAction,
  priority = false,
}: DaySectionProps) {
  const headerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [isStuck, setIsStuck] = useState(false)

  // Detect when header becomes stuck (debounced for performance)
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    let rafId: number | null = null

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Use RAF to debounce updates for smooth scrolling
        if (rafId) cancelAnimationFrame(rafId)
        rafId = requestAnimationFrame(() => {
          setIsStuck(!entry.isIntersecting)
        })
      },
      { threshold: [1] }
    )

    observer.observe(sentinel)
    return () => {
      observer.disconnect()
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  const totalSchedules = Object.values(schedulesByFormat).reduce((sum, schedules) => sum + schedules.length, 0)
  const hasSchedules = totalSchedules > 0
  const formats = FORMAT_ORDER.filter(format => schedulesByFormat[format] && schedulesByFormat[format].length > 0)

  return (
    <section className="reveal">
      {/* Sentinel element to detect sticky state */}
      <div ref={sentinelRef} className="h-px -mt-px" />

      <div className="space-y-16">
        <div
          ref={headerRef}
          className={cn(
            "sticky top-[120px] z-20 pb-4 pt-2 -mx-4 px-4 transition-all duration-300 backdrop-blur-sm",
            isStuck ? "bg-background/90" : "bg-transparent",
            "will-change-[background-color] contain-paint"
          )}
        >
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
            {formats.map((format, formatIndex) => {
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
                    {schedules.map((schedule, index) => {
                      const media = schedule.media
                      if (!media) return null

                      return (
                        <ScheduleCard
                          key={schedule.id}
                          schedule={schedule}
                          media={media}
                          formatTimeAction={formatTimeAction}
                          getStreamingLinksAction={getStreamingLinksAction}
                          priority={priority && formatIndex === 0 && index < 6}
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
