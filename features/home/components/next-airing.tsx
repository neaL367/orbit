"use client"

import Link from "next/link"
import Image from "next/image"
import { useQueries } from "@tanstack/react-query"
import React, { useMemo, useState, useEffect, useRef } from "react"
import { Zap } from "lucide-react"

import { execute } from "@/lib/graphql/execute"
import { ScheduleAnimeQuery } from "@/lib/graphql/queries/schedule-anime"
import { getAnimeTitle } from "@/lib/utils/anime-utils"
import { useCurrentTime } from "@/hooks/use-current-time"
import { extractDominantColors } from "@/lib/utils/dominant-colors"
import type { ScheduleAnimeHeroQuery, Media } from "@/lib/graphql/types/graphql"

type ColorPalette = {
    topLeft: string
    topCenter: string
    topRight: string
    midLeft: string
    midCenter: string
    midRight: string
    bottomLeft: string
    bottomCenter: string
    bottomRight: string
}

export function NextAiring({ className, initialData }: { className?: string, initialData?: { data?: ScheduleAnimeHeroQuery } }) {
    const now = useCurrentTime()
    const [activeIndex, setActiveIndex] = useState(0)
    const [colors, setColors] = useState<ColorPalette[]>([])


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
            initialData: initialData,
            staleTime: 5000,
            refetchOnWindowFocus: true
        }]
    })[0]

    const schedules = useMemo(() => data?.data?.Page?.airingSchedules || [], [data])
    const activeSchedule = schedules[activeIndex]

    // Cache for extracted colors to avoid re-processing
    const colorCache = useRef<Map<string, ColorPalette>>(new Map())

    // Extract colors from all schedule images
    useEffect(() => {
        if (schedules.length === 0) return

        // Only extract colors for items we might need (current + next 2)
        const itemsToExtract = schedules.slice(0, Math.min(3, schedules.length))

        Promise.all(
            itemsToExtract.map(async (schedule) => {
                const imageUrl = schedule?.media?.bannerImage ||
                    schedule?.media?.coverImage?.extraLarge ||
                    schedule?.media?.coverImage?.large

                if (!imageUrl) {
                    return {
                        topLeft: '#2a2a35', topCenter: '#2a2a35', topRight: '#252530',
                        midLeft: '#20202a', midCenter: '#2a2a35', midRight: '#1a1a25',
                        bottomLeft: '#20202a', bottomCenter: '#1a1a25', bottomRight: '#1a1a25'
                    }
                }

                // Check cache first
                if (colorCache.current.has(imageUrl)) {
                    return colorCache.current.get(imageUrl)!
                }

                // Extract and cache extractDominantColors now returns 9 zones
                const colors = await extractDominantColors(imageUrl)
                // Cast to local type if needed, though structure should match
                const typedColors = colors as unknown as ColorPalette
                colorCache.current.set(imageUrl, typedColors)
                return typedColors
            })
        ).then(extractedColors => {
            // Fill remaining slots with default colors if needed
            const allColors = [...extractedColors]
            while (allColors.length < schedules.length) {
                allColors.push({
                    topLeft: '#2a2a35', topCenter: '#2a2a35', topRight: '#252530',
                    midLeft: '#20202a', midCenter: '#2a2a35', midRight: '#1a1a25',
                    bottomLeft: '#20202a', bottomCenter: '#1a1a25', bottomRight: '#1a1a25'
                })
            }
            setColors(allColors)
        })
    }, [schedules])

    // Auto-rotate ticker
    useEffect(() => {
        if (schedules.length <= 1) return

        const duration = 8000
        const rotateTimeout = setTimeout(() => {
            setActiveIndex(prev => (prev + 1) % schedules.length)
        }, duration)

        return () => clearTimeout(rotateTimeout)
    }, [schedules.length, activeIndex])

    const title = useMemo(() => activeSchedule?.media ? getAnimeTitle(activeSchedule.media as unknown as Media) : null, [activeSchedule])
    const timeUntilSec = (activeSchedule?.airingAt && now) ? (activeSchedule.airingAt - now) : null

    // Detailed    // Countdown calculation
    const countdown = useMemo(() => {
        if (!timeUntilSec || timeUntilSec <= 0 || now === null) return null
        const days = Math.floor(timeUntilSec / (3600 * 24))
        const hours = Math.floor((timeUntilSec % (3600 * 24)) / 3600)
        const minutes = Math.floor((timeUntilSec % 3600) / 60)
        const seconds = timeUntilSec % 60

        const pad = (n: number) => n.toString().padStart(2, '0')
        return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    }, [timeUntilSec, now])

    if (isLoading || !activeSchedule) {
        return <div className={`w-full relative border-b border-border bg-secondary/5 shimmer ${className || "h-[50vh] md:h-[60vh]"}`} />
    }



    const currentColors = colors[activeIndex] || {
        topLeft: '#1a1a1a', topCenter: '#1a1a1a', topRight: '#1a1a1a',
        midLeft: '#0a0a0a', midCenter: '#1a1a1a', midRight: '#0a0a0a',
        bottomLeft: '#0a0a0a', bottomCenter: '#0a0a0a', bottomRight: '#0a0a0a'
    }

    return (
        <section
            className={`w-screen relative left-1/2 -translate-x-1/2 z-0 group ${className || "min-h-[550px] md:h-[70vh]"} overflow-hidden bg-background flex flex-col`}
            style={{
                '--current-top-left': currentColors.topLeft,
                '--current-top-center': currentColors.topCenter,
                '--current-top-right': currentColors.topRight,
                '--current-mid-left': currentColors.midLeft,
                '--current-mid-center': currentColors.midCenter,
                '--current-mid-right': currentColors.midRight,
                '--current-bottom-left': currentColors.bottomLeft,
                '--current-bottom-center': currentColors.bottomCenter,
                '--current-bottom-right': currentColors.bottomRight,
            } as React.CSSProperties}
        >
            {/* 1. Precision Ambient Base (High Intensity) */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden will-change-transform translate-z-0 bg-black">
                {/* 9-Zone Ambient Field (Alive & Breathing) */}
                <div className="absolute inset-[-40%] blur-[100px] sm:blur-[140px] saturate-[2.5] brightness-[1.15] transition-opacity duration-1000 will-change-opacity translate-z-0">
                    <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-80">
                        {/* Row 1 */}
                        <div className="transition-colors duration-2000 ease-in-out" style={{ backgroundColor: currentColors.topLeft }} />
                        <div className="transition-colors duration-2000 ease-in-out" style={{ backgroundColor: currentColors.topCenter }} />
                        <div className="transition-colors duration-2000 ease-in-out" style={{ backgroundColor: currentColors.topRight }} />

                        {/* Row 2 */}
                        <div className="transition-colors duration-2000 ease-in-out" style={{ backgroundColor: currentColors.midLeft }} />
                        <div className="transition-colors duration-2000 ease-in-out scale-150 z-10 rounded-full blur-xl" style={{ backgroundColor: currentColors.midCenter }} />
                        <div className="transition-colors duration-2000 ease-in-out" style={{ backgroundColor: currentColors.midRight }} />

                        {/* Row 3 */}
                        <div className="transition-colors duration-2000 ease-in-out" style={{ backgroundColor: currentColors.bottomLeft }} />
                        <div className="transition-colors duration-2000 ease-in-out" style={{ backgroundColor: currentColors.bottomCenter }} />
                        <div className="transition-colors duration-2000 ease-in-out" style={{ backgroundColor: currentColors.bottomRight }} />
                    </div>
                </div>
            </div>

            {/* 3. Main Interface Logic */}
            <div className="w-full h-full relative z-10 flex flex-col flex-1 isolate">
                <Link href={`/anime/${activeSchedule.media?.id}`} className="block w-full h-full relative">
                    {/* Background Visual Layer */}
                    <div className="absolute inset-0 bg-secondary/30">
                        {schedules.map((schedule, index) => {
                            if (index !== activeIndex) return null
                            const scheduleImage = schedule?.media?.bannerImage || schedule?.media?.coverImage?.extraLarge
                            if (!scheduleImage) return null
                            return (
                                <div
                                    key={schedule?.id || index}
                                    className="absolute inset-0 transition-opacity duration-1000 ease-in-out opacity-100 will-change-opacity"
                                >
                                    <Image
                                        src={scheduleImage}
                                        alt=""
                                        fill
                                        className="object-cover opacity-40 md:opacity-20 blur-[30px] md:blur-[60px] scale-110 saturate-[2]"
                                        loading="eager"
                                        priority={true}
                                    />
                                </div>
                            )
                        })}
                        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
                        <div className="absolute inset-0 bg-linear-to-r from-background/95 via-background/50 to-transparent" />
                    </div>

                    {/* Interactive Content Container */}
                    <div className="absolute inset-0 flex justify-center">
                        <div className="max-w-[1600px] w-full h-full flex items-center px-6 md:px-12 lg:px-24 pt-8 md:pt-0 pb-20 md:pb-0 relative">
                            <div className="max-w-4xl md:max-w-[50%] lg:max-w-md xl:max-w-2xl 2xl:max-w-3xl w-full space-y-8 md:space-y-10 z-10 transition-all duration-500">
                                {/* Technical Header */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3 text-primary">
                                        <div className="relative">
                                            <Zap className="h-4 w-4 fill-current" />
                                            <div className="absolute inset-0 animate-ping opacity-50"><Zap className="h-4 w-4 fill-current" /></div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-[9px] md:text-xs font-bold uppercase tracking-[0.4em]">Broadcast_Signal_Detected</span>
                                            <div className="flex gap-1">
                                                <div className="w-0.5 h-3 bg-primary/40 animate-[bounce_2s_infinite]" />
                                                <div className="w-0.5 h-3 bg-primary/60 animate-[bounce_2s_infinite_0.2s]" />
                                                <div className="w-0.5 h-3 bg-primary animate-[bounce_2s_infinite_0.4s]" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-px w-full bg-linear-to-r from-primary/40 via-primary/10 to-transparent" />
                                </div>

                                <div key={activeSchedule.id} className="space-y-8 md:space-y-12 animate-in fade-in duration-1000">
                                    <div className="space-y-4 md:space-y-6">
                                        <div className="min-h-[60px] md:min-h-[140px] flex flex-col justify-end">
                                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-mono font-black uppercase tracking-tighter leading-[0.85] text-foreground drop-shadow-2xl line-clamp-2 md:line-clamp-3 mix-blend-screen">
                                                {title}
                                            </h2>
                                        </div>

                                        {/* Ultra-Dense Telemetry Strip */}
                                        <div className="grid grid-cols-2 lg:flex lg:flex-wrap items-center gap-3 lg:gap-10 font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-muted-foreground bg-white/3 border border-white/10 p-4 lg:px-6 lg:py-5 index-cut-tr transition-colors group-hover:border-primary/20">
                                            <div className="flex items-center gap-2.5">
                                                <span className="opacity-30">EP//</span>
                                                <span className="text-primary font-bold">{activeSchedule.episode}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 overflow-hidden">
                                                <span className="opacity-30 md:hidden block shrink-0">STS//</span>
                                                <span className="text-foreground/80 font-bold truncate">{activeSchedule.media?.status?.replace(/_/g, " ")}</span>
                                            </div>
                                            <div className="w-px h-3 bg-white/10 hidden lg:block" />
                                            <div className="flex items-center gap-2.5">
                                                <span className="opacity-30">ATTR//</span>
                                                <span className="text-foreground font-bold">{activeSchedule.media?.format}</span>
                                            </div>
                                            <div className="w-px h-3 bg-white/10 hidden lg:block" />
                                            <div className="hidden sm:flex items-center gap-2.5">
                                                <span className="opacity-30">HEX_PTR//</span>
                                                <span className="text-primary/60 font-bold">0x{activeSchedule.media?.id?.toString(16).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Countdown Sync Interface */}
                                    <div className="flex flex-col items-start gap-4">
                                        <div className="flex items-center gap-3 pl-1">
                                            <div className="w-1.5 h-1.5 bg-primary rotate-45 animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                            <span className="font-mono text-[10px] uppercase text-muted-foreground/60 tracking-[0.4em] font-black">T-Minus_Synchronization</span>
                                        </div>

                                        <div className="relative group/counter w-full sm:w-auto">
                                            {/* Technical Brackets */}
                                            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-primary/60 group-hover/counter:border-primary transition-colors" />
                                            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-primary/60 group-hover/counter:border-primary transition-colors" />

                                            <div className="bg-foreground text-background px-6 py-4 md:px-12 md:py-8 relative overflow-hidden transition-all group-hover/counter:bg-primary group-hover/counter:scale-[1.02]">
                                                <div className="font-mono text-3xl sm:text-4xl md:text-7xl font-black tracking-tight tabular-nums relative z-10 flex items-center justify-center gap-1.5 md:gap-3">
                                                    {now === null ? (
                                                        <span className="opacity-40 animate-pulse text-[0.8em]">SYNCING...</span>
                                                    ) : countdown ? (
                                                        countdown.split(':').map((unit, i) => (
                                                            <React.Fragment key={i}>
                                                                <div className="relative flex flex-col items-center">
                                                                    <span>{unit}</span>
                                                                    <div className="absolute -bottom-1 w-[80%] h-px bg-current opacity-20" />
                                                                </div>
                                                                {i < 3 && <span className="opacity-20 text-[0.7em] -mt-1">:</span>}
                                                            </React.Fragment>
                                                        ))
                                                    ) : (
                                                        <span className="text-primary animate-pulse text-[0.6em] tracking-[0.2em]">BROADCAST_LIVE</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side Cover (Desktop) */}
                            <div className="hidden md:flex absolute right-4 lg:right-24 top-1/2 -translate-y-1/2 h-[60%] md:h-[65%] lg:h-[75%] aspect-2/3 transition-all duration-1000 group-hover:scale-105 items-center justify-center">
                                <div className="relative w-full h-full">
                                    <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b border-l border-primary/40" />
                                    <div className="w-full h-full border border-primary/20 bg-secondary/30 relative z-10 overflow-hidden shadow-2xl transition-all duration-700 group-hover:border-primary/50">
                                        {schedules.map((schedule, index) => {
                                            if (index !== activeIndex) return null
                                            const coverImage = schedule?.media?.coverImage?.extraLarge
                                            if (!coverImage) return null
                                            return (
                                                <div key={schedule.id} className="absolute inset-0">
                                                    <Image
                                                        src={coverImage}
                                                        alt="Cover"
                                                        fill
                                                        className="object-cover transition-transform duration-[4s] group-hover:scale-110"
                                                        priority
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="absolute -inset-4 border border-primary/5 -z-10 translate-x-4 translate-y-4" />
                                </div>
                            </div>

                            {/* Navigation Interface */}
                            <div className="absolute bottom-6 left-0 right-0 h-12 z-20 pointer-events-none flex justify-center">
                                <div className="max-w-[1600px] w-full px-6 md:px-12 lg:px-24 flex items-center justify-between">
                                    <div className="flex gap-2 sm:gap-4 pointer-events-auto items-center">
                                        {schedules.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    setActiveIndex(i)
                                                }}
                                                aria-label={`Select item ${i + 1}`}
                                                className={`group relative h-4 flex items-center justify-center transition-all ${i === activeIndex ? 'w-10 sm:w-16' : 'w-3 sm:w-4 hover:w-8'}`}
                                            >
                                                <div className={`h-px w-full transition-all duration-500 ${i === activeIndex ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                                                {i === activeIndex && (
                                                    <>
                                                        <div className="absolute inset-0 bg-primary/20 animate-pulse" />
                                                        <div className="absolute left-0 w-1 h-3 bg-primary" />
                                                    </>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="hidden md:flex items-center gap-4">
                                        <span className="font-mono text-[7px] text-muted-foreground uppercase tracking-[0.3em] font-bold">Registry_Sync</span>
                                        <div className="w-32 h-px bg-white/10 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-primary/20 animate-progress" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </section>
    )
}
