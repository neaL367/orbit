"use client"

import React, { useMemo, useState, memo, useCallback } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getAnimeTitle } from "@/lib/utils/anime-utils"
import type { Media } from "@/lib/graphql/types/graphql"
import { IndexImage } from "@/components/shared/index-image"

interface PosterCardProps {
    anime: Media
    rank?: number
    priority?: boolean
    className?: string
}

export const PosterCard = memo(function PosterCard({ anime, rank, priority = false, className }: PosterCardProps) {
    const [isHovered, setIsHovered] = useState(false)

    const title = useMemo(() => getAnimeTitle(anime), [anime])
    const coverImage = anime.coverImage?.extraLarge || anime.coverImage?.large

    const handleMouseEnter = useCallback(() => setIsHovered(true), [])
    const handleMouseLeave = useCallback(() => setIsHovered(false), [])

    return (
        <Link
            href={`/anime/${anime.id}`}
            className={cn(
                "group relative block aspect-[2/3] w-full bg-secondary border border-border/50 overflow-hidden transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5",
                className
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Technical Brackets (Hover) */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-primary/60 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 z-30" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-primary/60 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 z-30" />

            {/* Registry Index Number */}
            <div className="absolute top-3 right-3 z-30 font-mono text-[8px] text-white/30 group-hover:text-primary/80 transition-colors">
                REF_ID:0x{anime.id}
            </div>

            {/* Main Image */}
            {coverImage && (
                <IndexImage
                    src={coverImage}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    priority={priority}
                    showTechnicalDetails={false}
                    className={cn(
                        "transition-all duration-700 ease-[cubic-bezier(0.2,0,0,1)]",
                        isHovered ? "scale-105 brightness-110 saturate-[1.1]" : "scale-100"
                    )}
                />
            )}

            {/* Gradient Overlay for metadata */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />

            {/* Rank Indicator */}
            {rank !== undefined && (
                <div className="absolute top-0 left-0 z-20 bg-primary text-primary-foreground font-mono text-[10px] font-black px-3 py-1 index-cut-tr">
                    #{rank < 10 ? `0${rank}` : rank}
                </div>
            )}

            {/* Content Container */}
            <div className="absolute inset-x-0 bottom-0 z-20 p-3 sm:p-5 space-y-2 sm:space-y-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-[1px] bg-primary/40 group-hover:w-3 transition-all" />
                        <span className="font-mono text-[6px] sm:text-[7px] text-primary/60 tracking-[0.3em] uppercase">Entry_Point</span>
                    </div>
                    <h3 className="line-clamp-2 font-mono text-xs sm:text-[14px] font-black leading-[1.1] uppercase tracking-tighter text-foreground transition-colors group-hover:text-primary/90">
                        {title}
                    </h3>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 font-mono text-[7px] sm:text-[9px] uppercase tracking-widest text-muted-foreground/60 border-t border-white/5 pt-2 sm:pt-3">
                    <span className="text-foreground/80 font-bold truncate">{anime.format?.replace(/_/g, " ")}</span>
                    <div className="w-[1px] h-2 bg-white/10 shrink-0" />
                    <span>{anime.startDate?.year || 'TBA'}</span>
                </div>
            </div>

            {/* Scanning Line (Hover) */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-primary/20 z-20 opacity-0 group-hover:opacity-100 group-hover:animate-scan pointer-events-none" />
        </Link>
    )
})
