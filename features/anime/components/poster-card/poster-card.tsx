"use client"

import { useMemo, memo } from "react"
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
    const title = useMemo(() => getAnimeTitle(anime), [anime])
    const coverImage = anime.coverImage?.extraLarge || anime.coverImage?.large

    return (
        <Link
            href={`/anime/${anime.id}`}
            className={cn(
                "group relative block aspect-2/3 w-full overflow-hidden rounded-sm border border-white/5 bg-secondary shadow-xl transition-[border-color,box-shadow] duration-700 hover:border-primary/50",
                className
            )}
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
                        className="scale-100 brightness-[0.8] grayscale-[0.4] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:brightness-110 group-hover:saturate-120 group-hover:grayscale-0 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                </div>
            )}

            {/* Solid Mask for text legibility */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black via-black/90 to-transparent z-10" />

            {/* Information Layer */}
            <div className="absolute inset-x-0 bottom-0 z-30 space-y-3 p-4 sm:space-y-4 sm:p-5">
                <div className="translate-y-4 space-y-1.5 transition-transform duration-500 group-hover:translate-y-0">
                    <div className="flex items-center gap-2">
                        <div className="h-px w-4 bg-primary transition-[width] duration-700 group-hover:w-10" />
                        <span className="font-mono text-[8px] font-black uppercase tracking-[0.35em] text-primary/80">
                            Title
                        </span>
                    </div>
                    <h3 className="line-clamp-2 font-mono text-sm font-black uppercase leading-[1.1] tracking-tighter text-foreground transition-colors duration-500 group-hover:text-primary sm:text-base">
                        {title}
                    </h3>

                    <div className="flex min-h-[1.25rem] flex-wrap gap-1">
                        {anime.genres?.slice(0, 2).map((genre) => (
                            <span
                                key={genre}
                                className="whitespace-nowrap border border-white/15 bg-black/30 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-widest text-white/70"
                            >
                                {genre}
                            </span>
                        ))}
                        {anime.genres?.[2] ? (
                            <span className="hidden whitespace-nowrap border border-white/10 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-widest text-white/45 lg:inline">
                                {anime.genres[2]}
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="flex items-center gap-3 border-t border-white/10 pt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 sm:gap-4 sm:pt-4 sm:text-[10px]">
                    <span className="text-white/80 font-black">{anime.format?.replace(/_/g, " ")}</span>
                    <div className="w-px h-3 bg-white/20 shrink-0" />
                    <span className="font-bold">{anime.startDate?.year || 'TBA'}</span>
                    <div className="flex-1" />
                    <div className="h-2 w-2 rotate-45 border border-white/25 bg-white/5 transition-all duration-500" />
                </div>
            </div>

            {/* Technical Decor (Hover) - Corner Brackets */}
            <div className="absolute top-2 left-2 w-5 h-5 border-t border-l border-primary/60 opacity-0 group-hover:opacity-100 -translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-700 z-40" />
            <div className="absolute bottom-2 right-2 w-5 h-5 border-r border-b border-primary/60 opacity-0 group-hover:opacity-100 translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-700 z-40" />
        </Link>
    )
})
