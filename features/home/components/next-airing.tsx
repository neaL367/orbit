"use client"

import Link from "next/link"
import Image from "next/image"
import { useQueries } from "@tanstack/react-query"
import React, { useMemo, useState, useEffect, useRef } from "react"
import { Zap } from "lucide-react"
import { IndexImage } from "@/components/shared/index-image"
import { execute } from "@/lib/graphql/execute"
import { ScheduleAnimeQuery } from "@/lib/graphql/queries/schedule-anime"
import { getAnimeTitle } from "@/lib/utils/anime-utils"
import { useCurrentTime } from "@/hooks/use-current-time"
import { extractDominantColors } from "@/lib/utils/dominant-colors"
import { AmbientProvider } from "@/contexts/ambient-context"
import type { ScheduleAnimeHeroQuery, Media } from "@/lib/graphql/types/graphql"

type ColorPalette = {
    leftTop: string
    rightTop: string
    leftBottom: string
    rightBottom: string
}

export function NextAiring({ className, initialData }: { className?: string, initialData?: { data?: ScheduleAnimeHeroQuery } }) {
    const now = useCurrentTime()
    const [activeIndex, setActiveIndex] = useState(0)
    const [colors, setColors] = useState<ColorPalette[]>([])
    const [mixPercent, setMixPercent] = useState(100)


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
            staleTime: 60000
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
                    return { leftTop: '#2a2a35', rightTop: '#252530', leftBottom: '#20202a', rightBottom: '#1a1a25' }
                }

                // Check cache first
                if (colorCache.current.has(imageUrl)) {
                    return colorCache.current.get(imageUrl)!
                }

                // Extract and cache
                const colors = await extractDominantColors(imageUrl)
                colorCache.current.set(imageUrl, colors)
                return colors
            })
        ).then(extractedColors => {
            // Fill remaining slots with default colors if needed
            const allColors = [...extractedColors]
            while (allColors.length < schedules.length) {
                allColors.push({ leftTop: '#2a2a35', rightTop: '#252530', leftBottom: '#20202a', rightBottom: '#1a1a25' })
            }
            setColors(allColors)
        })
    }, [schedules])

    // Auto-rotate ticker with color transition
    useEffect(() => {
        if (schedules.length <= 1) return

        const duration = 8000
        const transitionDuration = 1000

        // Start color transition
        setMixPercent(0)

        // Rotate to next slide after duration
        const rotateTimeout = setTimeout(() => {
            setActiveIndex(prev => (prev + 1) % schedules.length)
            setMixPercent(100)
        }, duration)

        return () => {
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

    if (isLoading || !activeSchedule) {
        return <div className={`w-full relative border-b border-border bg-secondary/5 shimmer ${className || "h-[50vh] md:h-[60vh]"}`} />
    }

    const bannerImage = activeSchedule.media?.bannerImage || activeSchedule.media?.coverImage?.extraLarge || activeSchedule.media?.coverImage?.large

    const currentColors = colors[activeIndex] || { leftTop: '#1a1a1a', rightTop: '#1a1a1a', leftBottom: '#0a0a0a', rightBottom: '#0a0a0a' }
    const nextColors = colors[(activeIndex + 1) % schedules.length] || currentColors

    return (
        <AmbientProvider colors={currentColors}>
            <section
                className={`w-full relative z-0 group ${className || "h-[50vh] md:h-[60vh]"}`}
                style={{
                    '--current-left-top': currentColors.leftTop,
                    '--current-right-top': currentColors.rightTop,
                    '--current-left-bottom': currentColors.leftBottom,
                    '--current-right-bottom': currentColors.rightBottom,
                    '--next-left-top': nextColors.leftTop,
                    '--next-right-top': nextColors.rightTop,
                    '--next-left-bottom': nextColors.leftBottom,
                    '--next-right-bottom': nextColors.rightBottom,
                    '--mix-percent': `${mixPercent}%`
                } as React.CSSProperties}
            >
                {/* Dynamic Color Gradient Layers (Cross-fading for performance) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-20 blur-[60px] pointer-events-none overflow-hidden">
                    <div
                        className="absolute inset-0 transition-opacity duration-1000 will-change-opacity"
                        style={{
                            background: `
                                radial-gradient(ellipse at 25% 25%, var(--current-left-top) 0%, transparent 50%),
                                radial-gradient(ellipse at 75% 25%, var(--current-right-top) 0%, transparent 50%),
                                radial-gradient(ellipse at 25% 75%, var(--current-left-bottom) 0%, transparent 50%),
                                radial-gradient(ellipse at 75% 75%, var(--current-right-bottom) 0%, transparent 50%)
                            `,
                            opacity: mixPercent / 100 * 0.3
                        }}
                    />
                    <div
                        className="absolute inset-0 transition-opacity duration-1000 will-change-opacity"
                        style={{
                            background: `
                                radial-gradient(ellipse at 25% 25%, var(--next-left-top) 0%, transparent 50%),
                                radial-gradient(ellipse at 75% 25%, var(--next-right-top) 0%, transparent 50%),
                                radial-gradient(ellipse at 25% 75%, var(--next-left-bottom) 0%, transparent 50%),
                                radial-gradient(ellipse at 75% 75%, var(--next-right-bottom) 0%, transparent 50%)
                            `,
                            opacity: (1 - mixPercent / 100) * 0.3
                        }}
                    />
                </div>

                {/* Ambient Outer Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] -z-10 blur-[60px] saturate-150 pointer-events-none overflow-hidden">
                    {schedules.map((schedule, index) => {
                        // Performance: Only render current and next to save GPU memory
                        const isVisible = index === activeIndex || index === (activeIndex + 1) % schedules.length
                        if (!isVisible) return null

                        const scheduleImage = schedule?.media?.bannerImage || schedule?.media?.coverImage?.extraLarge || schedule?.media?.coverImage?.large
                        if (!scheduleImage) return null

                        return (
                            <div
                                key={schedule?.id || index}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out will-change-opacity ${index === activeIndex ? "opacity-15" : "opacity-0"}`}
                            >
                                <Image
                                    src={scheduleImage}
                                    alt=""
                                    fill
                                    className="object-cover scale-125"
                                    loading={index === activeIndex ? "eager" : "lazy"}
                                    priority={index === activeIndex}
                                />
                            </div>
                        )
                    })}
                </div>

                {/* Main Content Wrapper */}
                <div className="w-full h-full relative overflow-hidden border-b border-border bg-background/20 isolate flex flex-col">
                    <Link href={`/anime/${activeSchedule.media?.id}`} className="block w-full h-full relative">
                        {/* Background Image with optimized rendering */}
                        <div className="absolute inset-0 bg-secondary">
                            {schedules.map((schedule, index) => {
                                // Only render current for background to save massive performance
                                if (index !== activeIndex) return null

                                const scheduleImage = schedule?.media?.bannerImage || schedule?.media?.coverImage?.extraLarge || schedule?.media?.coverImage?.large
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
                                            className="object-cover opacity-40 blur-[40px] scale-110 saturate-125"
                                            loading="eager"
                                            priority={true}
                                        />
                                    </div>
                                )
                            })}
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
                        </div>

                        {/* Content Container */}
                        <div className="absolute inset-0 flex items-center px-6 md:px-12 lg:px-24">
                            <div className="max-w-4xl lg:max-w-md xl:max-w-2xl 2xl:max-w-3xl w-full space-y-6 md:space-y-10 z-10 transition-all duration-500">
                                {/* Technical Header */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3 text-primary">
                                        <div className="relative">
                                            <Zap className="h-4 w-4 fill-current" />
                                            <div className="absolute inset-0 animate-ping opacity-50"><Zap className="h-4 w-4 fill-current" /></div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-[0.4em]">Broadcast_Signal_Detected</span>
                                            <div className="flex gap-1">
                                                <div className="w-1 h-3 bg-primary/40 animate-[bounce_2s_infinite]" />
                                                <div className="w-1 h-3 bg-primary/60 animate-[bounce_2s_infinite_0.2s]" />
                                                <div className="w-1 h-3 bg-primary animate-[bounce_2s_infinite_0.4s]" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-[1px] w-full bg-gradient-to-r from-primary/30 to-transparent" />
                                </div>

                                <div key={activeSchedule.id} className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
                                    <div className="space-y-4 md:space-y-6">
                                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-mono font-bold uppercase tracking-tighter leading-[0.95] text-foreground drop-shadow-2xl line-clamp-3">
                                            {title}
                                        </h2>

                                        {/* Structured Metadata Grid */}
                                        <div className="flex flex-wrap items-center gap-y-4 gap-6 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                            <div className="flex flex-col gap-1 pr-6 border-r border-border/50">
                                                <span className="text-[8px] opacity-40">Frequency</span>
                                                <span className="text-foreground font-bold">EP_{activeSchedule.episode}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 pr-6 border-r border-border/50">
                                                <span className="text-[8px] opacity-40">Attribute</span>
                                                <span className="text-foreground font-bold">{activeSchedule.media?.format}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 pr-6 border-r border-border/50">
                                                <span className="text-[8px] opacity-40">Status_Code</span>
                                                <span className="text-foreground font-bold">{activeSchedule.media?.status?.replace(/_/g, " ")}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[8px] opacity-40">System_ID</span>
                                                <span className="text-foreground font-bold">0x{activeSchedule.media?.id?.toString(16).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sci-Fi Countdown Interface */}
                                    <div className="flex flex-col items-start gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-primary rotate-45" />
                                            <span className="font-mono text-[9px] uppercase text-muted-foreground tracking-[0.3em]">T-Minus_Synchronization</span>
                                        </div>

                                        <div className="relative group/counter">
                                            {/* Technical Brackets */}
                                            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-primary" />
                                            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-primary" />

                                            <div className="bg-foreground text-background px-4 py-2 md:px-10 md:py-6 relative overflow-hidden">
                                                <span className="font-mono text-xl sm:text-2xl md:text-6xl font-bold tracking-[0.05em] tabular-nums relative z-10 flex items-center gap-1 md:gap-2">
                                                    {countdown ? countdown.split(':').map((unit, i) => (
                                                        <React.Fragment key={i}>
                                                            <span className="relative">
                                                                {unit}
                                                                <span className="absolute -bottom-0.5 md:-bottom-1 -left-0 w-full h-[1px] md:h-[2px] bg-background/20" />
                                                            </span>
                                                            {i < 3 && <span className="opacity-30 animate-pulse text-[0.8em]">:</span>}
                                                        </React.Fragment>
                                                    )) : "00:00:00:00"}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex justify-between font-mono text-[7px] uppercase tracking-widest text-muted-foreground px-1">
                                                <span>DD</span>
                                                <span>HH</span>
                                                <span>MM</span>
                                                <span>SS</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side Cover Art (Enhanced Precision Layout) */}
                            <div className="hidden lg:block absolute right-24 top-1/2 -translate-y-1/2 h-[70%] aspect-[2/3] shrink-0 transition-all duration-700">
                                <div className="relative w-full h-full">
                                    <div className="absolute -top-6 -right-6 font-mono text-[8px] uppercase tracking-widest text-muted-foreground/30 rotate-90 origin-bottom-right">
                                        Peripheral_Visual_Link_v.01
                                    </div>
                                    <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b border-l border-primary/40" />

                                    <div className="w-full h-full border border-primary/20 bg-secondary/30 relative z-10 overflow-hidden shadow-2xl transition-all duration-700 group-hover:border-primary/50 group-hover:-translate-y-2 group-hover:translate-x-2">
                                        {schedules.map((schedule, index) => {
                                            const coverImage = schedule?.media?.coverImage?.extraLarge
                                            if (!coverImage) return null
                                            return (
                                                <div
                                                    key={schedule?.id || index}
                                                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
                                                >
                                                    <Image
                                                        src={coverImage}
                                                        alt="Cover"
                                                        fill
                                                        className="object-cover transition-transform duration-[3s] group-hover:scale-110"
                                                        loading={index === activeIndex ? "eager" : "lazy"}
                                                        priority={index === activeIndex}
                                                    />
                                                </div>
                                            )
                                        })}
                                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_2px,3px_100%] pointer-events-none" />
                                    </div>
                                    <div className="absolute -inset-2 border border-primary/10 -z-10 translate-x-4 translate-y-4" />
                                </div>
                            </div>
                        </div>

                        {/* Progress Indicators (Precision Style) */}
                        <div className="absolute bottom-10 left-6 md:left-12 lg:left-24 right-6 md:right-12 lg:right-24 h-12 flex items-center justify-between z-20 pointer-events-none">
                            <div className="flex gap-2 sm:gap-4 pointer-events-auto items-center">
                                <span className="font-mono text-[7px] text-muted-foreground/60 tracking-widest hidden sm:block">INDEX_PTR:</span>
                                {schedules.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setActiveIndex(i)
                                        }}
                                        aria-label={`Go to slide ${i + 1}`}
                                        className={`group relative h-4 flex items-center justify-center transition-all ${i === activeIndex ? 'w-10 sm:w-16' : 'w-3 sm:w-4 hover:w-8'}`}
                                    >
                                        <div className={`h-[1px] w-full transition-all duration-500 ${i === activeIndex ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                                        {i === activeIndex && (
                                            <>
                                                <div className="absolute left-0 w-0.5 sm:w-1 h-2 sm:h-3 bg-primary" />
                                                <div className="absolute right-0 w-0.5 sm:w-1 h-2 sm:h-3 bg-primary" />
                                                <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                                            </>
                                        )}
                                        <span className={`absolute -top-4 font-mono text-[6px] sm:text-[7px] transition-opacity duration-300 ${i === activeIndex ? 'opacity-100' : 'opacity-0'}`}>
                                            0{i + 1}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="hidden md:flex items-center gap-4">
                                <div className="flex flex-col items-end">
                                    <span className="font-mono text-[7px] text-muted-foreground uppercase tracking-widest">Buffer_Status</span>
                                    <span className="font-mono text-[8px] text-foreground font-bold italic">RE_SYNCHRONIZING...</span>
                                </div>
                                <div className="w-32 h-[1px] bg-border relative overflow-hidden">
                                    <div className="absolute inset-0 bg-primary/20 animate-progress" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </section>
        </AmbientProvider>
    )
}
