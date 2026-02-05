"use client"

import React, { useMemo, useState, memo, useCallback } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getAnimeTitle } from "@/lib/utils/anime-utils"
import type { Media } from "@/lib/graphql/types/graphql"
import { useImageLoaded } from "@/hooks/use-image-loaded"

interface PosterCardProps {
    anime: Media
    rank?: number
    priority?: boolean
}

export const PosterCard = memo(function PosterCard({ anime, rank, priority = false }: PosterCardProps) {
    const [isHovered, setIsHovered] = useState(false)
    const { loaded, onLoad, ref: imgRef } = useImageLoaded()

    const title = useMemo(() => getAnimeTitle(anime), [anime])
    const coverImage = anime.coverImage?.extraLarge || anime.coverImage?.large

    const handleMouseEnter = useCallback(() => setIsHovered(true), [])
    const handleMouseLeave = useCallback(() => setIsHovered(false), [])

    return (
        <Link
            href={`/anime/${anime.id}`}
            className="group relative block aspect-[2/3] w-full bg-secondary border border-border overflow-hidden transition-all duration-500"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Background Color Placeholder */}
            <div className="absolute inset-0 z-0 bg-neutral-900" />

            {/* Main Image */}
            {coverImage && (
                <img
                    ref={imgRef}
                    src={coverImage}
                    alt={title}
                    loading={priority ? "eager" : "lazy"}
                    onLoad={onLoad}
                    className={cn(
                        "h-full w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.2,0,0,1)]",
                        isHovered ? "scale-[1.03] brightness-110" : "scale-100",
                        loaded ? "opacity-100" : "opacity-0"
                    )}
                />
            )}

            {/* Overlay for metadata */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

            {/* Rank Indicator */}
            {rank !== undefined && (
                <div className="absolute top-0 left-0 z-20 bg-foreground text-background font-mono text-[10px] font-bold px-2 py-1 index-cut-tr">
                    {rank < 10 ? `0${rank}` : rank}
                </div>
            )}

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 z-20 p-4 space-y-1.5">
                <h3 className="line-clamp-2 font-mono text-[13px] font-bold leading-tight uppercase tracking-tighter text-foreground group-hover:text-white transition-colors">
                    {title}
                </h3>
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    <span>{anime.format?.replace(/_/g, " ")}</span>
                    <span className="w-[1.5px] h-[1.5px] bg-muted-foreground" />
                    <span>{anime.startDate?.year}</span>
                </div>
            </div>

            {/* Focused Notch */}
            <div className={cn(
                "absolute top-0 right-0 w-[1.5px] h-0 bg-white transition-all duration-500 z-30",
                isHovered && "h-full"
            )} />
            <div className={cn(
                "absolute bottom-0 right-0 w-0 h-[1.5px] bg-white transition-all duration-500 z-30",
                isHovered && "w-full"
            )} />
        </Link>
    )
})
