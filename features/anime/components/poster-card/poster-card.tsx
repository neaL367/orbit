"use client"

import { useMemo, useState, memo, useCallback } from "react"
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

/**
 * Precision Registry Poster Card
 * High information density with technical metadata overlays.
 */
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
                "group relative block aspect-[2/3] w-full bg-secondary border border-white/5 overflow-hidden transition-all duration-700 hover:border-primary/50 rounded-sm shadow-xl",
                className
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Metadata Registry Indicator (Top) */}
            <div className="absolute top-2.5 left-2.5 right-2.5 z-40 flex justify-between items-start pointer-events-none">
                {rank !== undefined ? (
                    <div key="rank-indicator" className="bg-primary text-primary-foreground font-mono text-[11px] sm:text-[13px] font-black px-2 py-1 shadow-lg index-cut-tr">
                        #{rank < 10 ? `0${rank}` : rank}
                    </div>
                ) : (
                    <div key="id-indicator" className="font-mono text-[9px] text-white/50 uppercase tracking-[0.2em] font-black bg-black/60 backdrop-blur-md px-2 py-0.5 border border-white/5 index-cut-tr">
                        0x{anime.id}
                    </div>
                )}

                <div className="flex flex-col items-end gap-1 translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="font-mono text-[9px] px-2 py-0.5 bg-primary text-primary-foreground uppercase font-black tracking-widest border border-primary/20">
                        {anime.status?.replace(/_/g, " ")}
                    </span>
                    {anime.averageScore && (
                        <span key="score-indicator" className="font-mono text-[10px] text-white font-black bg-black/60 px-2 py-0.5 backdrop-blur-md border border-white/5">
                            {anime.averageScore}%
                        </span>
                    )}
                </div>
            </div>

            {/* Main Visual Layer */}
            {coverImage && (
                <div className="relative h-full w-full overflow-hidden">
                    <IndexImage
                        src={coverImage}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        priority={priority}
                        showTechnicalDetails={false}
                        className={cn(
                            "transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]",
                            isHovered ? "scale-110 brightness-[0.7] saturate-[1.2] blur-[2px]" : "scale-100 brightness-[0.9]"
                        )}
                    />
                </div>
            )}

            {/* Solid Mask for text legibility */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/90 to-transparent z-10" />

            {/* Information Layer */}
            <div className="absolute inset-x-0 bottom-0 z-30 p-4 sm:p-5 space-y-3 sm:space-y-4">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-[1px] bg-primary group-hover:w-10 transition-all duration-700" />
                        <span className="font-mono text-[8px] text-primary/80 tracking-[0.4em] uppercase font-black">SUBJECT_DATA</span>
                    </div>
                    <h3 className="line-clamp-2 font-mono text-sm sm:text-base font-black leading-[1.1] uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors duration-500">
                        {title}
                    </h3>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/40 border-t border-white/10 pt-3 sm:pt-4">
                    <span className="text-white/80 font-black">{anime.format?.replace(/_/g, " ")}</span>
                    <div className="w-[1px] h-3 bg-white/20 shrink-0" />
                    <span className="font-bold">{anime.startDate?.year || 'TBA'}</span>
                    <div className="flex-1" />
                    <div className={cn(
                        "w-2 h-2 rotate-45 border transition-all duration-500",
                        anime.averageScore && anime.averageScore > 75 ? "bg-primary border-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]" : "border-white/20"
                    )} />
                </div>
            </div>

            {/* Technical Decor (Hover) - Corner Brackets */}
            <div className="absolute top-2 left-2 w-5 h-5 border-t border-l border-primary/60 opacity-0 group-hover:opacity-100 -translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-700 z-40" />
            <div className="absolute bottom-2 right-2 w-5 h-5 border-r border-b border-primary/60 opacity-0 group-hover:opacity-100 translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-700 z-40" />
        </Link>
    )
})
