"use client"

import { useRef, useState, useEffect } from "react"
import { ScheduleCard } from "../schedule/card"
import { cn } from "@/lib/utils"
import type { AiringSchedule } from "@/lib/graphql/types/graphql"

const FORMAT_ORDER = ["TV", "TV_SHORT", "MOVIE", "SPECIAL", "OVA", "ONA"] as const
const FORMAT_LABELS: Record<string, string> = {
  TV: "TV",
  TV_SHORT: "Short TV",
  MOVIE: "Movie",
  OVA: "OVA",
  ONA: "ONA",
  SPECIAL: "Special",
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

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    let rafId: number | null = null

    const observer = new IntersectionObserver(
      ([entry]) => {
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
  const formats = FORMAT_ORDER.filter((format) => schedulesByFormat[format] && schedulesByFormat[format].length > 0)

  return (
    <section className="reveal pt-16 first:pt-0 md:pt-20">
      <div ref={sentinelRef} className="-mt-px h-px" />

      <div className="space-y-10 md:space-y-12">
        <div
          ref={headerRef}
          className={cn(
            "sticky z-30 -mx-4 px-4 pb-4 pt-2 transition-all duration-500",
            isStuck
              ? "border-b border-white/8 bg-background/95 opacity-100 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-md supports-[backdrop-filter]:bg-background/80"
              : "bg-transparent opacity-100",
            "will-change-[background-color,opacity,top]"
          )}
          style={{
            top: `calc(var(--nav-visible, 1) * 80px + 78px)`,
          }}
        >
          <div className="flex items-center gap-4 md:gap-6">
            <h2
              className={cn(
                "flex items-center gap-3 font-sans text-xl font-semibold tracking-tight md:text-3xl md:gap-4",
                isToday ? "text-primary" : "text-foreground"
              )}
            >
              {dayName}
              {isToday && (
                <span className="border border-primary/25 bg-primary/10 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-primary">
                  Today
                </span>
              )}
            </h2>
            <div className="h-px flex-1 bg-white/8" />
            <div className="flex flex-col items-end">
              <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {dateString}
              </span>
              <div className="mt-1 flex gap-1">
                <div className="h-0.5 w-12 bg-primary/25" />
                <div className="h-0.5 w-4 bg-primary" />
              </div>
            </div>
          </div>
        </div>

        {!hasSchedules ? (
          <div className="flex flex-col items-center justify-center border border-white/8 bg-white/[0.02] py-16 md:py-20 index-cut-tr">
            <p className="font-sans text-sm font-medium text-muted-foreground">No episodes this day</p>
            <p className="mt-2 max-w-sm text-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
              Try another day or check back after the list updates
            </p>
          </div>
        ) : (
          <div className="space-y-12 md:space-y-14">
            {formats.map((format, formatIndex) => {
              const schedules = schedulesByFormat[format] || []
              if (schedules.length === 0) return null

              return (
                <div key={format} className="space-y-5 md:space-y-6">
                  <div className="flex items-center gap-4 group/format">
                    <div className="border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-foreground transition-colors group-hover/format:border-primary/35">
                      {FORMAT_LABELS[format] || format.replace(/_/g, " ")}
                    </div>
                    <div className="h-px flex-1 bg-linear-to-r from-white/12 via-white/5 to-transparent" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70">
                      {schedules.length} {schedules.length === 1 ? "title" : "titles"}
                    </span>
                  </div>

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
