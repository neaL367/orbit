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
    "index-cut-tr border border-white/15 bg-black/95 shadow-md transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] group-hover:bg-primary/5"

export const PosterCard = memo(function PosterCard({ anime, rank, priority = false, className }: PosterCardProps) {
    const title = useMemo(() => getAnimeTitle(anime), [anime])
    const coverImage = anime.coverImage?.extraLarge || anime.coverImage?.large

    return (
        <Link
            href={`/anime/${anime.id}`}
            className={cn(
                "group relative block aspect-2/3 w-full bg-secondary overflow-hidden transition-all duration-500 rounded-sm ring-1 ring-white/10 hover:ring-primary/50 hover:shadow-[0_8px_30px_rgba(var(--primary),0.15)]",
                className
            )}
        >
            {/* Index + score: shared shell, symmetric top corners */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between gap-2 p-3">
                <div
                    className={cn(
                        badgeFrame,
                        "flex min-w-0 items-stretch overflow-hidden",
                        rank !== undefined ? "ring-1 ring-primary/40" : "ring-0"
                    )}
                >
                    <div
                        className={cn(
                            "w-1 shrink-0 transition-colors duration-300",
                            rank !== undefined ? "bg-primary" : "bg-white/20 group-hover:bg-primary/50"
                        )}
                        aria-hidden
                    />
                    <div className="flex flex-col gap-0.5 px-2.5 py-1.5">
                        <span className="font-mono text-[10px] font-bold uppercase leading-none tracking-[0.25em] text-muted-foreground/80 group-hover:text-primary/80 transition-colors">
                            {rank !== undefined ? "Index" : "Ref"}
                        </span>
                        <span
                            className={cn(
                                "font-mono text-[15px] font-black tabular-nums leading-none tracking-tight",
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
                            "flex flex-col items-end gap-0.5 px-2.5 py-1.5 opacity-95 group-hover:opacity-100 group-hover:-translate-y-px"
                        )}
                    >
                        <span className="font-mono text-[10px] font-bold uppercase leading-none tracking-[0.25em] text-muted-foreground/80 group-hover:text-primary/80 transition-colors">
                            Score
                        </span>
                        <span className="flex items-baseline gap-0.5 font-mono leading-none">
                            <span className="text-[15px] font-black tabular-nums text-primary">{anime.averageScore}</span>
                            <span className="text-[10px] font-bold text-primary/75">%</span>
                        </span>
                    </div>
                ) : null}
            </div>

            {/* Visuals */}
            {coverImage && (
                <div className="relative h-full w-full overflow-hidden bg-black">
                    <IndexImage
                        src={coverImage}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        priority={priority}
                        showTechnicalDetails={false}
                        className="transition-transform duration-500 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                    />
                </div>
            )}

            {/* Mask */}
            <div className="absolute inset-x-0 bottom-0 z-10 h-3/5 bg-linear-to-t from-black via-black/80 to-transparent pointer-events-none" />

            {/* Info Layer */}
            <div className="absolute inset-x-0 bottom-0 z-30 p-4 sm:p-5 space-y-3 pointer-events-none">
                <div className="space-y-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                    <h3 className="line-clamp-2 font-sans text-[15px] font-bold leading-snug tracking-tight text-foreground/90 group-hover:text-primary transition-colors duration-300 drop-shadow-md">
                        {title}
                    </h3>

                    <div className="flex items-center gap-2.5 border-t border-white/10 pt-2.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
                        <span className="text-foreground group-hover:text-foreground transition-colors">{anime.format?.replace(/_/g, " ")}</span>
                        <div className="h-3 w-px bg-white/20 group-hover:bg-primary/40 transition-colors" />
                        <span>{anime.startDate?.year || "TBA"}</span>
                        <div className="flex-1" />
                        {anime.status ? (
                            <span className="text-muted-foreground/60">{anime.status.replace(/_/g, " ")}</span>
                        ) : null}
                    </div>
                </div>
            </div>
        </Link>
    )
})
