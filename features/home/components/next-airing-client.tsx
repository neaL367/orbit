"use client"

import Link from "next/link"
import Image from "next/image"
import React, { useMemo, useState, useEffect, useRef } from "react"
import { Zap } from "lucide-react"
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

const DEFAULT_COLORS: ColorPalette = {
    topLeft: '#1a1a1a', topCenter: '#1a1a1a', topRight: '#1a1a1a',
    midLeft: '#0a0a0a', midCenter: '#1a1a1a', midRight: '#0a0a0a',
    bottomLeft: '#0a0a0a', bottomCenter: '#0a0a0a', bottomRight: '#0a0a0a'
}

interface NextAiringClientProps {
    className?: string
    data: ScheduleAnimeHeroQuery
}

export function NextAiringClient({ className, data }: NextAiringClientProps) {
    const now = useCurrentTime()
    const [activeIndex, setActiveIndex] = useState(0)
    const [colors, setColors] = useState<ColorPalette[]>([])
    const colorCache = useRef<Map<string, ColorPalette>>(new Map())

    const schedules = useMemo(() => data?.Page?.airingSchedules || [], [data])
    const activeSchedule = schedules[activeIndex]

    useEffect(() => {
        if (schedules.length === 0) return

        const extractColors = async () => {
             const extracted = await Promise.all(
                schedules.slice(0, 5).map(async (schedule) => {
                    const imageUrl = schedule?.media?.bannerImage || schedule?.media?.coverImage?.extraLarge
                    if (!imageUrl) return DEFAULT_COLORS
                    if (colorCache.current.has(imageUrl)) return colorCache.current.get(imageUrl)!
                    
                    const extractedColors = await extractDominantColors(imageUrl)
                    colorCache.current.set(imageUrl, extractedColors as any)
                    return extractedColors as any
                })
            )
            setColors(extracted)
        }

        extractColors()
    }, [schedules])

    useEffect(() => {
        if (schedules.length <= 1) return
        const timer = setTimeout(() => {
            setActiveIndex(prev => (prev + 1) % schedules.length)
        }, 8000)
        return () => clearTimeout(timer)
    }, [schedules.length, activeIndex])

    const title = useMemo(() => activeSchedule?.media ? getAnimeTitle(activeSchedule.media as unknown as Media) : null, [activeSchedule])
    const timeUntilSec = (activeSchedule?.airingAt && now) ? (activeSchedule.airingAt - now) : null

    const countdown = useMemo(() => {
        if (!timeUntilSec || timeUntilSec <= 0 || now === null) return null
        const days = Math.floor(timeUntilSec / (3600 * 24))
        const hours = Math.floor((timeUntilSec % (3600 * 24)) / 3600)
        const minutes = Math.floor((timeUntilSec % 3600) / 60)
        const seconds = timeUntilSec % 60
        const pad = (n: number) => n.toString().padStart(2, '0')
        return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    }, [timeUntilSec, now])

    const currentColors = colors[activeIndex] || DEFAULT_COLORS

    if (!activeSchedule) return null

    return (
        <section
            className={`w-full relative overflow-hidden bg-background flex flex-col ${className}`}
            style={{
                '--current-mid-center': currentColors.midCenter,
            } as React.CSSProperties}
        >
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-black">
                <div className="absolute inset-[-20%] blur-[120px] transition-opacity duration-1000 opacity-60">
                    <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                         {Object.values(currentColors).map((color, i) => (
                             <div key={i} className="transition-colors duration-2000" style={{ backgroundColor: color }} />
                         ))}
                    </div>
                </div>
            </div>

            <div className="w-full h-full relative z-10 flex flex-col flex-1 isolate">
                <Link href={`/anime/${activeSchedule.media?.id}`} className="block w-full h-full relative">
                    <div className="absolute inset-0 bg-secondary/10">
                         {activeSchedule.media?.bannerImage && (
                             <Image
                                src={activeSchedule.media.bannerImage}
                                alt=""
                                fill
                                className="object-cover opacity-20 blur-3xl scale-110"
                                priority
                             />
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    </div>

                    <div className="max-w-7xl mx-auto w-full h-full flex items-center px-6 md:px-12 relative">
                        <div className="max-w-3xl w-full space-y-10 z-10">
                            <div className="flex items-center gap-3 text-primary/80">
                                <Zap className="h-4 w-4 fill-current animate-pulse" />
                                <span className="font-mono text-xs font-black uppercase tracking-[0.4em]">Broadcast_Signal_Sync</span>
                            </div>

                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                <h2 className="text-4xl md:text-7xl font-mono font-black uppercase tracking-tighter leading-none text-foreground drop-shadow-2xl line-clamp-2">
                                    {title}
                                </h2>

                                <div className="flex flex-wrap items-center gap-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground bg-white/5 border border-white/10 p-5 index-cut-tr">
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-40">EP//</span>
                                        <span className="text-primary font-black">{activeSchedule.episode}</span>
                                    </div>
                                    <div className="w-px h-3 bg-white/10" />
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-40">FORMAT//</span>
                                        <span className="text-foreground font-bold">{activeSchedule.media?.format}</span>
                                    </div>
                                    <div className="w-px h-3 bg-white/10" />
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-40">STATUS//</span>
                                        <span className="text-foreground font-bold">{activeSchedule.media?.status?.replace(/_/g, " ")}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                     <span className="font-mono text-[10px] uppercase text-muted-foreground/60 tracking-[0.4em] font-black">Counter_Synchronization</span>
                                     <div className="bg-foreground text-background px-8 py-6 inline-block index-cut-tr">
                                        <div className="font-mono text-4xl md:text-6xl font-black tabular-nums">
                                            {now === null ? "SYNC..." : countdown || "LIVE"}
                                        </div>
                                     </div>
                                </div>
                            </div>
                        </div>

                         {/* Side Cover */}
                         <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 h-[70%] aspect-2/3 items-center">
                            <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-700">
                                <div className="absolute -inset-4 border border-primary/10 -z-10 translate-x-4 translate-y-4" />
                                <div className="relative w-full h-full border border-white/10 overflow-hidden shadow-2xl bg-secondary">
                                    {activeSchedule.media?.coverImage?.extraLarge && (
                                        <Image
                                            src={activeSchedule.media.coverImage.extraLarge}
                                            alt=""
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
                        <div className="max-w-7xl w-full px-6 flex gap-4 pointer-events-auto">
                            {schedules.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={(e) => { e.preventDefault(); setActiveIndex(i); }}
                                    className={`h-1 transition-all duration-500 ${i === activeIndex ? 'w-12 bg-primary' : 'w-4 bg-white/20 hover:bg-white/40'}`}
                                />
                            ))}
                        </div>
                    </div>
                </Link>
            </div>
        </section>
    )
}
