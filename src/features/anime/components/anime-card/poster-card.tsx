"use client"

import React, { useMemo, useState, memo } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getAnimeTitle } from "@/lib/anime-utils"
import type { Media } from "@/lib/graphql/types/graphql"

interface PosterCardProps {
    anime: Media
    rank?: number
    priority?: boolean
}

export const PosterCard = memo(function PosterCard({ anime, rank, priority = false }: PosterCardProps) {
    const [imageLoaded, setImageLoaded] = useState(false)

    const title = useMemo(() => getAnimeTitle(anime), [anime])
    const coverImage = anime.coverImage?.extraLarge || anime.coverImage?.large

    return (
        <Link
            href={`/anime/${anime.id}`}
            className="group relative block aspect-[2/3] w-full bg-[#050505] grayscale hover:grayscale-0 transition-all duration-700 ease-out"
        >
            {/* Main Image */}
            {coverImage && (
                <img
                    src={coverImage}
                    alt={title}
                    loading={priority ? "eager" : "lazy"}
                    onLoad={() => setImageLoaded(true)}
                    className={cn(
                        "h-full w-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700",
                        imageLoaded ? "scale-100" : "scale-110 blur-xl"
                    )}
                />
            )}

            {/* Content */}
            <div className="absolute inset-0 z-30 p-4 flex flex-col justify-end bg-gradient-to-t from-black via-black/20 to-transparent">
                <h3 className="font-display text-lg leading-tight tracking-wide text-white translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    {title}
                </h3>

                {rank !== undefined && (
                    <div className="absolute top-4 right-4 text-2xl font-display text-white/10 group-hover:text-primary transition-colors">
                        {rank < 10 ? `0${rank}` : rank}
                    </div>
                )}
            </div>
        </Link>
    )
})
