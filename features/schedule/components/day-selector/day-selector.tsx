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

    return (
        <>
            {/* Sentinel element to detect sticky state */}
            <div ref={sentinelRef} className="h-px -mt-px" />

            <div
                ref={headerRef}
                className={cn(
                    "sticky top-16 z-30 pt-4 pb-0 transition-all duration-300 backdrop-blur-sm",
                    "-mx-6 md:-mx-12 lg:-mx-24 px-6 md:px-12 lg:px-24",
                    isStuck ? "bg-background/90" : "bg-transparent",
                    "will-change-[background-color] contain-paint"
                )}
            >
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-4">
                        {/* All Days Button */}
                        <button
                            onClick={() => onSelectDayAction(null)}
                            className={cn(
                                "relative px-4 py-2 border font-mono text-[10px] uppercase transition-all shrink-0 font-bold whitespace-nowrap",
                                selectedDay === null
                                    ? "bg-foreground text-background border-foreground shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]"
                                    : "border-border hover:bg-white/[0.04] text-muted-foreground hover:text-foreground"
                            )}
                        >
                            All Days
                        </button>

                        {/* Day Tabs */}
                        {days.map(({ index: dayIndex, name: dayName, isToday }) => (
                            <button
                                key={dayIndex}
                                onClick={() => onSelectDayAction(dayIndex)}
                                className={cn(
                                    "relative px-4 py-2 border font-mono text-[10px] uppercase transition-all shrink-0 font-bold flex items-center gap-2 whitespace-nowrap",
                                    selectedDay === dayIndex
                                        ? "bg-foreground text-background border-foreground shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]"
                                        : isToday
                                            ? "border-primary/50 text-primary hover:bg-primary/10"
                                            : "border-border hover:bg-white/[0.04] text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {isToday && (
                                    <span className="w-1 h-1 bg-primary animate-pulse rounded-full" />
                                )}
                                {dayName}
                                {isToday && selectedDay !== dayIndex && (
                                    <span className="text-[7px] opacity-50">NOW</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
