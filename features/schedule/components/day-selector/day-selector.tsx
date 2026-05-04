"use client"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import type { ScheduleDayModel } from "../schedule/types"

type DaySelectorProps = {
  days: ScheduleDayModel[]
  selectedDay: number
  onSelectDayAction: (dayIndex: number) => void
}

export function DaySelector({ days, selectedDay, onSelectDayAction }: DaySelectorProps) {
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

  return (
    <>
      <div ref={sentinelRef} className="-mt-px h-px" />

      <div
        ref={headerRef}
        className={cn(
          "sticky z-40 py-2 transition-all duration-300 will-change-transform",
          isStuck
            ? "border-b border-white/8 bg-background/95 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md supports-backdrop-filter:bg-background/80"
            : "bg-transparent",
          "select-none"
        )}
        style={{
          top: `calc(var(--nav-visible, 1) * 80px)`,
        }}
      >
        <div className="mx-auto max-w-[1600px] px-6 md:px-12 lg:px-24">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide no-scrollbar">
            {days.map((day) => {
              const isSelected = selectedDay === day.index
              return (
                <button
                  key={day.index}
                  type="button"
                  onClick={() => onSelectDayAction(day.index)}
                  className={cn(
                    "group relative flex min-w-[108px] shrink-0 flex-col items-stretch gap-1 overflow-hidden border px-2.5 py-2 text-left transition-all duration-200 index-cut-tr",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    isSelected
                      ? "border-white/30 bg-white text-black shadow-md ring-1 ring-white/15"
                      : day.isToday
                        ? "border-primary/30 bg-primary/5 text-foreground hover:border-primary/50"
                        : "border-white/10 bg-white/2 text-muted-foreground hover:border-white/20 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.22em] opacity-70">
                      {day.shortName}
                    </span>
                    {day.liveCount > 0 ? (
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full bg-primary",
                          isSelected ? "bg-black" : "motion-safe:animate-pulse motion-reduce:animate-none"
                        )}
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  <span className="font-sans text-[12px] font-semibold leading-tight tracking-tight text-current">
                    {day.compactDate}
                  </span>
                  <div className="flex items-center justify-between gap-1 border-t border-current/10 pt-1 font-mono text-[9px] uppercase tracking-[0.12em] opacity-80">
                    <span>{day.totalCount}</span>
                    <span className="truncate opacity-60">{day.liveCount > 0 ? `${day.liveCount} live` : "—"}</span>
                  </div>
                  {isSelected ? (
                    <div className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-full bg-black/30" />
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
