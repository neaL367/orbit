"use client"

import Link from "next/link"
import { useQueries } from "@tanstack/react-query"
import { useMemo, useState, useEffect, useRef } from "react"
import { Zap } from "lucide-react"
import { IndexImage } from "@/components/shared/index-image"
import { execute } from "@/lib/graphql/execute"
import { ScheduleAnimeQuery } from "@/lib/graphql/queries/schedule-anime"
import { getAnimeTitle } from "@/lib/utils/anime-utils"
import { useCurrentTime } from "@/hooks/use-current-time"
import { extractDominantColors } from "@/lib/utils/dominant-colors"
import { AmbientProvider } from "@/contexts/ambient-context"
import type { Media } from "@/lib/graphql/types/graphql"

type ColorPalette = {
    leftTop: string
    rightTop: string
    leftBottom: string
    rightBottom: string
}

export function NextAiring({ className }: { className?: string }) {
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
                {/* Dynamic Color Gradient Layer */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] -z-10 blur-[120px] pointer-events-none transition-all duration-1000"
                    style={{
                        background: `
                        radial-gradient(ellipse at 25% 25%, color-mix(in srgb, var(--current-left-top) var(--mix-percent), var(--next-left-top)) 0%, transparent 50%),
                        radial-gradient(ellipse at 75% 25%, color-mix(in srgb, var(--current-right-top) var(--mix-percent), var(--next-right-top)) 0%, transparent 50%),
                        radial-gradient(ellipse at 25% 75%, color-mix(in srgb, var(--current-left-bottom) var(--mix-percent), var(--next-left-bottom)) 0%, transparent 50%),
                        radial-gradient(ellipse at 75% 75%, color-mix(in srgb, var(--current-right-bottom) var(--mix-percent), var(--next-right-bottom)) 0%, transparent 50%)
                    `,
                        opacity: 0.4
                    }}
                />

                {/* Ambient Outer Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] -z-10 blur-[100px] saturate-200 pointer-events-none">
                    {schedules.map((schedule, index) => {
                        const scheduleImage = schedule?.media?.bannerImage || schedule?.media?.coverImage?.extraLarge || schedule?.media?.coverImage?.large
                        if (!scheduleImage) return null
                        return (
                            <div
                                key={schedule?.id || index}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === activeIndex ? "opacity-20" : "opacity-0"}`}
                            >
                                <IndexImage
                                    src={scheduleImage}
                                    alt="Ambient Glow"
                                    fill
                                    priority={index === 0}
                                    showTechnicalDetails={false}
                                    className="w-full h-full object-cover scale-150"
                                />
                            </div>
                        )
                    })}
                </div>

                {/* Main Content Wrapper */}
                <div className="w-full h-full relative overflow-hidden border-b border-border bg-background/20 isolate">
                    <Link href={`/anime/${activeSchedule.media?.id}`} className="block w-full h-full relative">
                        {/* Background Image with Parallax-like feel */}
                        <div className="absolute inset-0 bg-secondary">
                            {schedules.map((schedule, index) => {
                                const scheduleImage = schedule?.media?.bannerImage || schedule?.media?.coverImage?.extraLarge || schedule?.media?.coverImage?.large
                                if (!scheduleImage) return null
                                return (
                                    <div
                                        key={schedule?.id || index}
                                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
                                    >
                                        <IndexImage
                                            src={scheduleImage}
                                            alt="Background"
                                            fill
                                            priority={index === 0}
                                            sizes="100vw"
                                            showTechnicalDetails={false}
                                            className="w-full h-full object-cover opacity-50 blur-[80px] scale-125 transition-all duration-[2000ms] animate-in fade-in zoom-in-105 saturate-150"
                                        />
                                    </div>
                                )
                            })}
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
                        </div>

                        {/* Content Container */}
                        <div className="absolute inset-0 flex items-center px-6 md:px-12 lg:px-24">
                            <div className="max-w-4xl lg:max-w-2xl w-full space-y-6 md:space-y-8 z-10 transition-all duration-500">
                                <div className="flex items-center gap-4 text-primary animate-pulse">
                                    <Zap className="h-5 w-5 fill-current" />
                                    <span className="font-mono text-xs md:text-sm font-bold uppercase tracking-[0.3em]">Upcoming_Broadcast</span>
                                </div>

                                <div key={activeSchedule.id} className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="space-y-3 md:space-y-4">
                                        <h2 className="text-3xl md:text-5xl lg:text-7xl font-mono font-bold uppercase tracking-tighter leading-[0.9] text-foreground line-clamp-2 drop-shadow-lg">
                                            {title}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-4 md:gap-6 font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-muted-foreground">
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
                            </div>

                            {/* Right Side Cover Art (Desktop) */}
                            <div className="hidden lg:block absolute right-24 top-1/2 -translate-y-1/2 h-[75%] aspect-[2/3] border border-border/50 bg-secondary/30 shrink-0 -rotate-2 transition-transform duration-700 hover:rotate-0 shadow-2xl shadow-black/80 overflow-hidden">
                                {schedules.map((schedule, index) => {
                                    const coverImage = schedule?.media?.coverImage?.extraLarge
                                    if (!coverImage) return null
                                    return (
                                        <div
                                            key={schedule?.id || index}
                                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
                                        >
                                            <IndexImage
                                                src={coverImage}
                                                alt="Cover"
                                                fill
                                                sizes="(max-width: 1024px) 0px, 400px"
                                                showTechnicalDetails={false}
                                                className="w-full h-full object-cover brightness-100"
                                            />
                                        </div>
                                    )
                                })}
                                {/* Glass Overlay effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-10" />
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
                                        aria-label={`Go to slide ${i + 1}`}
                                        className={`relative h-1.5 transition-all duration-300 overflow-hidden ${i === activeIndex ? 'w-12 bg-border' : 'w-3 bg-border hover:bg-muted-foreground'
                                            }`}
                                    >
                                        {i === activeIndex && (
                                            <div
                                                className="absolute inset-0 bg-primary origin-left animate-progress"
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
                </div>
            </section>
        </AmbientProvider>
    )
}
