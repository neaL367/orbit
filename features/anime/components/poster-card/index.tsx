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

export const PosterCard = memo(function PosterCard({ anime, rank, priority = false, className }: PosterCardProps) {
    const title = useMemo(() => getAnimeTitle(anime), [anime])
    const coverImage = anime.coverImage?.extraLarge || anime.coverImage?.large

    return (
        <Link
            href={`/anime/${anime.id}`}
            className={cn(
                "group relative block aspect-[2/3] w-full bg-secondary overflow-hidden transition-all duration-700 hover:ring-2 hover:ring-primary/40 rounded-sm shadow-xl",
                className
            )}
        >
            {/* Rank/ID Badge */}
            <div className="absolute top-3 left-3 z-40">
                {rank !== undefined ? (
                    <div className="bg-primary text-primary-foreground font-mono text-xs font-black px-2.5 py-1 index-cut-tr shadow-lg uppercase tracking-tight">
                        #{rank.toString().padStart(2, '0')}
                    </div>
                ) : (
                    <div className="font-mono text-[9px] text-white/40 uppercase tracking-widest font-black bg-black/40 backdrop-blur-md px-2 py-0.5 border border-white/5">
                        0x{anime.id}
                    </div>
                )}
            </div>

            {/* Score Badge (Top Right) */}
            {anime.averageScore && (
                <div className="absolute top-3 right-3 z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                        <span className="font-mono text-[10px] text-white font-black tracking-widest">{anime.averageScore}%</span>
                    </div>
                </div>
            )}

            {/* Visuals */}
            {coverImage && (
                <div className="relative h-full w-full overflow-hidden">
                    <IndexImage
                        src={coverImage}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        priority={priority}
                        showTechnicalDetails={false}
                        className="transition-all duration-1000 ease-out group-hover:scale-105 group-hover:brightness-110 group-hover:blur-0 grayscale-[0.2] brightness-90"
                    />
                </div>
            )}

            {/* Mask */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />

            {/* Info Layer */}
            <div className="absolute inset-x-0 bottom-0 z-30 p-5 space-y-3">
                <div className="space-y-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-2">
                        <div className="h-px bg-primary/60 w-4 group-hover:w-10 transition-all duration-700" />
                        <span className="font-mono text-[8px] text-primary/80 tracking-[0.4em] uppercase font-black">RECORD_ENTRY</span>
                    </div>
                    
                    <h3 className="line-clamp-2 font-mono text-sm md:text-base font-black leading-tight uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors duration-500">
                        {title}
                    </h3>

                    {/* Meta Metadata */}
                    <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-widest text-white/40 border-t border-white/10 pt-3">
                        <span className="text-white/80 font-black">{anime.format?.replace(/_/g, " ")}</span>
                        <div className="w-px h-3 bg-white/10" />
                        <span className="font-bold">{anime.startDate?.year || 'TBA'}</span>
                        <div className="flex-1" />
                        {anime.status && (
                            <span className="text-primary/60 font-black">[{anime.status.replace(/_/g, "")}]</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
})
