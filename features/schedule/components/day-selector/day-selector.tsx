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
            ? "border-b border-white/10 bg-black/80 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl supports-backdrop-filter:bg-background/60"
            : "bg-transparent",
          "select-none"
        )}
        style={{
          top: `calc(var(--nav-visible, 1) * 80px)`,
        }}
      >
        <div className="mx-auto max-w-[1600px] px-6 md:px-12 lg:px-24">
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide no-scrollbar">
            {days.map((day) => {
              const isSelected = selectedDay === day.index
              return (
                <button
                  key={day.index}
                  type="button"
                  onClick={() => onSelectDayAction(day.index)}
                  className={cn(
                    "group relative flex min-w-[120px] shrink-0 flex-col items-stretch gap-1.5 overflow-hidden border px-3 py-2.5 text-left transition-all duration-300 index-cut-tr",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary),0.15)] ring-1 ring-primary/30"
                      : day.isToday
                        ? "border-primary/30 bg-primary/5 text-foreground hover:border-primary/50 hover:bg-primary/10"
                        : "border-white/10 bg-white/2 text-muted-foreground hover:border-white/30 hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                      {day.shortName}
                    </span>
                    {day.liveCount > 0 ? (
                      <span
                        className={cn(
                          "h-2 w-2 shrink-0 bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]",
                          isSelected ? "bg-primary" : "motion-safe:animate-pulse motion-reduce:animate-none"
                        )}
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  <span className={cn("font-sans text-sm font-bold leading-tight tracking-tight", isSelected ? "text-primary drop-shadow-sm" : "text-current")}>
                    {day.compactDate}
                  </span>
                  <div className="flex items-center justify-between gap-2 border-t border-current/20 pt-1.5 font-mono text-[10px] uppercase tracking-widest opacity-80">
                    <span className="font-bold">{day.totalCount}</span>
                    <span className="truncate opacity-60 font-semibold">{day.liveCount > 0 ? `${day.liveCount} live` : "—"}</span>
                  </div>
                  {isSelected ? (
                    <div className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-full bg-primary/50" />
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
