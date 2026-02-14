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
                    "sticky z-40 pt-6 transition-all duration-500",
                    isStuck ? "bg-background border-b border-white/5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]" : "bg-transparent py-6",
                    "will-change-[padding,background-color,top] select-none"
                )}
                style={{
                    top: `calc(var(--nav-visible, 1) * 80px)`
                }}
            >
                <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">
                    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide no-scrollbar -mx-4 px-4">
                        {/* All Days Button */}
                        <button
                            onClick={() => onSelectDayAction(null)}
                            className={cn(
                                "flex flex-col items-start gap-1 p-3 border transition-all duration-300 min-w-[100px]",
                                selectedDay === null
                                    ? "bg-primary border-primary text-background shadow-[0_0_20px_rgba(var(--primary),0.2)]"
                                    : "border-white/10 hover:border-white/30 text-muted-foreground hover:text-foreground bg-white/2"
                            )}
                        >
                            <span className="font-mono text-[8px] uppercase tracking-tighter opacity-60">REGISTRY//</span>
                            <span className="font-mono text-[11px] font-black uppercase tracking-widest whitespace-nowrap">Global_Log</span>
                        </button>

                        <div className="w-px h-8 bg-white/5 mx-2 shrink-0" />

                        {/* Day Tabs */}
                        {days.map(({ index: dayIndex, name: dayName, isToday }) => (
                            <button
                                key={dayIndex}
                                onClick={() => onSelectDayAction(dayIndex)}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-3 border transition-all duration-300 min-w-[110px] relative overflow-hidden group",
                                    selectedDay === dayIndex
                                        ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                                        : isToday
                                            ? "border-primary/40 text-primary hover:bg-primary/5 hover:border-primary"
                                            : "border-white/10 hover:border-white/30 text-muted-foreground hover:text-foreground bg-white/1"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-[8px] uppercase tracking-tighter opacity-60">
                                        {isToday ? "ACTIVE_CYCLE//" : "TEMPORAL//"}
                                    </span>
                                    {isToday && (
                                        <div className="w-1 h-1 bg-primary animate-pulse rounded-full" />
                                    )}
                                </div>
                                <span className="font-mono text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
                                    {dayName}
                                </span>

                                {selectedDay === dayIndex && (
                                    <div className="absolute top-0 right-0 w-4 h-4 bg-primary/20 rotate-45 translate-x-3 -translate-y-3" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
