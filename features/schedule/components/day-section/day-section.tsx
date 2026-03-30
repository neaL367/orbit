'use client'

import { useRef, useState, useEffect } from 'react'
import { ScheduleCard } from '../schedule/card'
import { cn } from '@/lib/utils'
import type { AiringSchedule } from '@/lib/graphql/types/graphql'

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
    <section className="reveal first:pt-0 pt-20">
      {/* Sentinel element to detect sticky state */}
      <div ref={sentinelRef} className="h-px -mt-px" />

      <div className="space-y-12">
        <div
          ref={headerRef}
          className={cn(
            "sticky z-30 pb-4 pt-2 -mx-4 px-4 transition-all duration-500",
            isStuck ? "bg-background border-b border-white/5 opacity-100 shadow-[0_10px_20px_rgba(0,0,0,0.3)]" : "bg-transparent opacity-100",
            "will-change-[background-color,opacity,top]"
          )}
          style={{
            top: `calc(var(--nav-visible, 1) * 80px + 78px)`
          }}
        >
          <div className="flex items-center gap-6">
            <h2 className={cn(
              "font-mono text-xl md:text-3xl font-black uppercase tracking-tighter flex items-center gap-4",
              isToday ? "text-primary" : "text-foreground"
            )}>
              {dayName}
              {isToday && (
                <span className="flex items-center gap-2 px-3 py-0.5 bg-primary/10 border border-primary/20 text-[10px] tracking-[0.3em] font-black">
                  LIVE_ACTIVE
                </span>
              )}
            </h2>
            <div className="flex-1 h-px bg-white/5" />
            <div className="flex flex-col items-end">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                {isToday ? "ACTIVE_CYCLE//" : "TEMPORAL//"} {dateString}
              </span>
              <div className="flex gap-1 mt-1">
                <div className="w-12 h-0.5 bg-primary/20" />
                <div className="w-4 h-0.5 bg-primary" />
              </div>
            </div>
          </div>
        </div>

        {!hasSchedules ? (
          <div className="flex flex-col items-center justify-center py-20 border border-white/5 bg-white/1 index-cut-tr">
            <div className="flex items-center gap-2 text-muted-foreground/20 mb-2">
              <div className="w-2 h-2 bg-current rotate-45" />
              <span className="font-mono text-[10px] uppercase tracking-[0.5em]">No_Data_Flux</span>
            </div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/30">
              Registry_Scan_Complete: NULL_BROADCAST_FOUND
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {formats.map((format, formatIndex) => {
              const schedules = schedulesByFormat[format] || []
              if (schedules.length === 0) return null

              return (
                <div key={format} className="space-y-6">
                  {/* Format Sub-header */}
                  <div className="flex items-center gap-4 group/format">
                    <div className="px-3 py-1 font-mono text-[9px] font-black uppercase tracking-[0.4em] text-foreground bg-white/5 border border-white/10 group-hover/format:border-primary/30 transition-colors">
                      {FORMAT_LABELS[format] || format}
                    </div>
                    <div className="flex-1 h-px bg-linear-to-r from-white/10 via-white/5 to-transparent" />
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[9px] uppercase text-muted-foreground/30 tracking-widest flex items-center gap-2">
                        ENTRY_LOG: <span className="text-foreground/60">{schedules.length.toString().padStart(2, '0')}</span>
                      </span>
                    </div>
                  </div>

                  {/* Schedule Cards Stack (Registry Flow) */}
                  <div className="grid grid-cols-1 gap-1">
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
