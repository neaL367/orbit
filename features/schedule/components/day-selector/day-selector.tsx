"use client"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type DayTab = {
  index: number
  name: string
  isToday: boolean
}

type DaySelectorProps = {
  days: DayTab[]
  selectedDay: number | null
  onSelectDayAction: (dayIndex: number | null) => void
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
          "sticky z-40 pt-6 transition-all duration-500 will-change-transform",
          isStuck
            ? "border-b border-white/8 bg-background/95 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md supports-[backdrop-filter]:bg-background/80"
            : "bg-transparent py-6",
          "select-none"
        )}
        style={{
          top: `calc(var(--nav-visible, 1) * 80px)`,
        }}
      >
        <div className="mx-auto max-w-[1600px] px-6 md:px-12 lg:px-24">
          <div className="-mx-4 flex items-center gap-3 overflow-x-auto px-4 scrollbar-hide no-scrollbar">
            <button
              type="button"
              onClick={() => onSelectDayAction(null)}
              className={cn(
                "flex min-w-[108px] flex-col items-start gap-1 border p-3 text-left transition-all duration-300",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                selectedDay === null
                  ? "border-primary bg-primary text-primary-foreground shadow-lg ring-1 ring-primary/25"
                  : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/25 hover:text-foreground"
              )}
            >
              <span className="font-mono text-[8px] font-semibold uppercase tracking-wider opacity-70">
                View
              </span>
              <span className="whitespace-nowrap font-sans text-xs font-semibold tracking-tight">All days</span>
            </button>

            <div className="mx-2 h-8 w-px shrink-0 bg-white/8" />

            {days.map(({ index: dayIndex, name: dayName, isToday }) => (
              <button
                key={dayIndex}
                type="button"
                onClick={() => onSelectDayAction(dayIndex)}
                className={cn(
                  "group relative flex min-w-[112px] flex-col items-start gap-1 overflow-hidden border p-3 text-left transition-all duration-300",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  selectedDay === dayIndex
                    ? "border-white bg-white text-black shadow-lg ring-1 ring-white/20"
                    : isToday
                      ? "border-primary/40 bg-primary/[0.03] text-primary hover:border-primary hover:bg-primary/8"
                      : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/25 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[8px] font-semibold uppercase tracking-wider opacity-60">
                    {isToday ? "Today" : "Day"}
                  </span>
                  {isToday && (
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary motion-safe:animate-pulse motion-reduce:opacity-100"
                      aria-hidden
                    />
                  )}
                </div>
                <span className="whitespace-nowrap font-sans text-xs font-semibold tracking-tight">{dayName}</span>

                {selectedDay === dayIndex && (
                  <div className="absolute right-0 top-0 h-4 w-4 translate-x-3 -translate-y-3 rotate-45 bg-primary/25" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
