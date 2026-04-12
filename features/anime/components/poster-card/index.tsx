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
                    <div className="font-mono text-[9px] text-muted-foreground/70 uppercase tracking-wider bg-black/40 px-2 py-0.5 border border-border">
                        ID_{anime.id}
                    </div>
                )}
            </div>

            {/* Score Badge (Top Right) */}
            {anime.averageScore && (
                <div className="absolute top-3 right-3 z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/60 backdrop-blur-md border border-border px-2 py-1">
                        <span className="font-mono text-[10px] text-foreground font-semibold tracking-wide">{anime.averageScore}%</span>
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
                        className="transition-all duration-700 ease-out group-hover:scale-[1.02] group-hover:brightness-105 brightness-95"
                    />
                </div>
            )}

            {/* Mask */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />

            {/* Info Layer */}
            <div className="absolute inset-x-0 bottom-0 z-30 p-5 space-y-3">
                <div className="space-y-2 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="line-clamp-2 font-sans text-sm font-semibold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 md:text-base">
                        {title}
                    </h3>

                    <div className="flex items-center gap-3 border-t border-border pt-3 font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
                        <span className="text-foreground/90">{anime.format?.replace(/_/g, " ")}</span>
                        <div className="h-3 w-px bg-border" />
                        <span>{anime.startDate?.year || "TBA"}</span>
                        <div className="flex-1" />
                        {anime.status ? (
                            <span className="text-muted-foreground">{anime.status.replace(/_/g, " ")}</span>
                        ) : null}
                    </div>
                </div>
            </div>
        </Link>
    )
})
