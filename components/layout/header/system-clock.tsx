"use client"

import { useEffect, useState } from "react"

export function SystemClock() {
    const [time, setTime] = useState<Date | null>(null)

    useEffect(() => {
        setTime(new Date())
        const interval = setInterval(() => {
            setTime(new Date())
        }, 100) // Update every 100ms for tenth-second precision

        return () => clearInterval(interval)
    }, [])

    if (!time) {
        return <span className="text-foreground tabular-nums font-bold">--:--:--</span>
    }

    const hours = time.getHours().toString().padStart(2, '0')
    const minutes = time.getMinutes().toString().padStart(2, '0')
    const seconds = time.getSeconds().toString().padStart(2, '0')
    // Get deciseconds for that rapid technical feel without being unreadable
    const decis = Math.floor(time.getMilliseconds() / 100).toString()

    return (
        <div className="flex items-center gap-1 font-mono text-foreground font-bold tabular-nums relative group cursor-default">
            <span>{hours}</span>
            <span className="animate-pulse text-primary">:</span>
            <span>{minutes}</span>
            <span className="animate-pulse text-primary">:</span>
            <span>{seconds}</span>
            <span className="text-muted-foreground/50 mx-[1px]">.</span>
            <span className="text-primary/80 opacity-70 w-[1ch] inline-block">{decis}</span>

            {/* Tooltip on hover showing date */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-background/90 border border-border text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
            </div>
        </div>
    )
}
