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

const badgeFrame =
    "index-cut-tr border border-white/12 bg-black/72 backdrop-blur-md shadow-[0_8px_24px_-8px_rgba(0,0,0,0.85)] transition-[border-color,box-shadow,transform] duration-500 group-hover:border-primary/35 group-hover:shadow-[0_12px_28px_-10px_rgba(0,0,0,0.9)]"

export const PosterCard = memo(function PosterCard({ anime, rank, priority = false, className }: PosterCardProps) {
    const title = useMemo(() => getAnimeTitle(anime), [anime])
    const coverImage = anime.coverImage?.extraLarge || anime.coverImage?.large

    return (
        <Link
            href={`/anime/${anime.id}`}
            className={cn(
                "group relative block aspect-2/3 w-full bg-secondary overflow-hidden transition-all duration-700 hover:ring-2 hover:ring-primary/40 rounded-sm shadow-xl",
                className
            )}
        >
            {/* Index + score: shared shell, symmetric top corners */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between gap-2 p-3">
                <div
                    className={cn(
                        badgeFrame,
                        "flex min-w-0 items-stretch overflow-hidden",
                        rank !== undefined ? "ring-1 ring-primary/25" : "ring-0"
                    )}
                >
                    <div
                        className={cn(
                            "w-px shrink-0",
                            rank !== undefined ? "bg-primary" : "bg-white/25"
                        )}
                        aria-hidden
                    />
                    <div className="flex flex-col gap-0.5 px-2 py-1.5">
                        <span className="font-mono text-[8px] font-black uppercase leading-none tracking-[0.22em] text-muted-foreground/90">
                            {rank !== undefined ? "Index" : "Ref"}
                        </span>
                        <span
                            className={cn(
                                "font-mono text-sm font-black tabular-nums leading-none tracking-tight",
                                rank !== undefined ? "text-primary" : "text-foreground"
                            )}
                        >
                            {rank !== undefined ? rank.toString().padStart(2, "0") : anime.id}
                        </span>
                    </div>
                </div>

                {typeof anime.averageScore === "number" ? (
                    <div
                        className={cn(
                            badgeFrame,
                            "flex flex-col items-end gap-0.5 px-2 py-1.5 opacity-95 group-hover:opacity-100 group-hover:-translate-y-px"
                        )}
                    >
                        <span className="font-mono text-[8px] font-black uppercase leading-none tracking-[0.22em] text-muted-foreground/90">
                            Score
                        </span>
                        <span className="flex items-baseline gap-0.5 font-mono leading-none">
                            <span className="text-base font-black tabular-nums text-primary">{anime.averageScore}</span>
                            <span className="text-[9px] font-bold text-primary/75">%</span>
                        </span>
                    </div>
                ) : null}
            </div>

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
            <div className="absolute inset-x-0 bottom-0 z-10 h-2/3 bg-linear-to-t from-black via-black/80 to-transparent" />

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
