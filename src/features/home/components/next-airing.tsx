"use client"

import { useQueries } from "@tanstack/react-query"
import { execute } from "@/lib/graphql/execute"
import { ScheduleAnimeQuery } from "@/lib/graphql/queries/schedule-anime"
import { getAnimeTitle } from "@/lib/utils/anime-utils"
import { useCurrentTime } from "@/hooks/use-current-time"
import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { Zap } from "lucide-react"
import type { Media } from "@/lib/graphql/types/graphql"

export function NextAiring({ className }: { className?: string }) {
    const now = useCurrentTime()
    const [activeIndex, setActiveIndex] = useState(0)
    const [progress, setProgress] = useState(0)

    // Get stable mount time to avoid partial refetches
    const [currentUnix] = useState(() => Math.floor(Date.now() / 1000))

    const { data, isLoading } = useQueries({
        queries: [{
            queryKey: ["NextAiringHero"],
            queryFn: () => execute(ScheduleAnimeQuery, {
                page: 1,
                perPage: 5,
                notYetAired: true,
                airingAt_greater: currentUnix
            }),
            staleTime: 60000
        }]
    })[0]

    const schedules = useMemo(() => data?.data?.Page?.airingSchedules || [], [data])
    const activeSchedule = schedules[activeIndex]

    // Auto-rotate ticker with progress tracking
    useEffect(() => {
        if (schedules.length <= 1) return

        const startTime = Date.now()
        const duration = 8000

        // Update progress every 50ms
        const progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime
            const newProgress = Math.min((elapsed / duration) * 100, 100)
            setProgress(newProgress)
        }, 50)

        // Rotate to next slide after duration
        const rotateTimeout = setTimeout(() => {
            setActiveIndex(prev => (prev + 1) % schedules.length)
            setProgress(0)
        }, duration)

        return () => {
            clearInterval(progressInterval)
            clearTimeout(rotateTimeout)
        }
    }, [schedules.length, activeIndex])

    const title = useMemo(() => activeSchedule?.media ? getAnimeTitle(activeSchedule.media as unknown as Media) : null, [activeSchedule])
    const timeUntilSec = (activeSchedule?.airingAt && now) ? (activeSchedule.airingAt - now) : null

    // Detailed countdown formatting
    const countdown = useMemo(() => {
        if (!timeUntilSec || timeUntilSec <= 0) return null
        const days = Math.floor(timeUntilSec / (3600 * 24))
        const hours = Math.floor((timeUntilSec % (3600 * 24)) / 3600)
        const minutes = Math.floor((timeUntilSec % 3600) / 60)
        const seconds = timeUntilSec % 60

        const pad = (n: number) => n.toString().padStart(2, '0')
        return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    }, [timeUntilSec])

    if (isLoading || !activeSchedule) return null

    const bannerImage = activeSchedule.media?.bannerImage || activeSchedule.media?.coverImage?.extraLarge || activeSchedule.media?.coverImage?.large

    return (
        <section className={`w-full relative border-b border-border overflow-hidden group ${className || "h-[50vh] md:h-[60vh]"}`}>
            <Link href={`/anime/${activeSchedule.media?.id}`} className="block w-full h-full relative">
                {/* Background Image with Parallax-like feel */}
                <div className="absolute inset-0 bg-secondary">
                    {bannerImage && (
                        <img
                            key={activeSchedule.id} // Re-trigger animation on change
                            src={bannerImage}
                            alt="Background"
                            className="w-full h-full object-cover opacity-60 blur-sm scale-110 transition-all duration-[2000ms] animate-in fade-in zoom-in-105"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
                </div>

                {/* Content Container */}
                <div className="absolute inset-0 flex items-center px-6 md:px-12 lg:px-24">
                    <div className="max-w-4xl w-full space-y-6 md:space-y-8 z-10">
                        <div className="flex items-center gap-4 text-primary animate-pulse">
                            <Zap className="h-5 w-5 fill-current" />
                            <span className="font-mono text-xs md:text-sm font-bold uppercase tracking-[0.3em]">Upcoming_Broadcast</span>
                        </div>

                        <div className="space-y-3 md:space-y-4">
                            <h2 className="text-3xl md:text-5xl lg:text-7xl font-mono font-bold uppercase tracking-tighter leading-[0.9] text-foreground line-clamp-2 drop-shadow-lg">
                                {title}
                            </h2>
                            <div className="flex flex-wrap items-center gap-4 md:gap-6 font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-muted-foreground/80">
                                <span className="text-foreground">Ep_{activeSchedule.episode}</span>
                                <span className="h-1 w-1 rounded-full bg-border" />
                                <span>{activeSchedule.media?.format}</span>
                                <span className="h-1 w-1 rounded-full bg-border" />
                                <span>{activeSchedule.media?.status}</span>
                            </div>
                        </div>

                        {/* Countdown Display */}
                        <div className="inline-flex flex-col items-start gap-2 pt-2 md:pt-4">
                            <span className="font-mono text-[10px] uppercase text-muted-foreground tracking-[0.2em]">Launch_Sequence</span>
                            <div className="bg-foreground text-background px-4 py-2 md:px-6 md:py-3 index-cut-tr shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                                <span className="font-mono text-xl md:text-4xl font-bold tracking-widest tabular-nums">
                                    {countdown || "00:00:00:00"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side Cover Art (Desktop) */}
                    <div className="hidden lg:block absolute right-24 top-1/2 -translate-y-1/2 h-[75%] aspect-[2/3] border border-border/50 bg-secondary/30 shrink-0 -rotate-2 transition-transform duration-700 hover:rotate-0 shadow-2xl shadow-black/80">
                        {activeSchedule.media?.coverImage?.extraLarge && (
                            <img
                                src={activeSchedule.media.coverImage.extraLarge}
                                alt="Cover"
                                className="w-full h-full object-cover brightness-100"
                            />
                        )}
                        {/* Glass Overlay effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="absolute bottom-6 left-6 md:left-12 lg:left-24 right-6 md:right-12 lg:right-24 flex items-center justify-between z-20 pointer-events-none">
                    <div className="flex gap-2 pointer-events-auto">
                        {schedules.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => {
                                    e.preventDefault()
                                    setActiveIndex(i)
                                }}
                                className={`relative h-1.5 transition-all duration-300 overflow-hidden ${i === activeIndex ? 'w-12 bg-border' : 'w-3 bg-border hover:bg-muted-foreground'
                                    }`}
                            >
                                {i === activeIndex && (
                                    <div
                                        className="absolute inset-0 bg-primary transition-all duration-75 ease-linear"
                                        style={{
                                            width: `${progress}%`
                                        }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Active Interval Progress */}
                    <div className="hidden md:block w-48 h-[1px] bg-border relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/20" />
                    </div>
                </div>
            </Link>
        </section>
    )
}
