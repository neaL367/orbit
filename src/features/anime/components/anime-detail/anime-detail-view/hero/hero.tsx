"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { getAnimeTitle } from "@/lib/anime-utils"
import type { Media } from "@/lib/graphql/types/graphql"

type HeroProps = {
    anime: Media
}

export function Hero({ anime }: HeroProps) {
    const [bannerLoaded, setBannerLoaded] = useState(false)

    const title = getAnimeTitle(anime)
    const bannerImage = anime?.bannerImage
    const coverColor = anime?.coverImage?.color || "#0b0b0b"

    return (
        <div className="relative w-full overflow-hidden">
            {/* Background Banner */}
            <div className="relative h-[350px] w-full">
                <div
                    className="absolute inset-0"
                    style={{ backgroundColor: coverColor }}
                />
                {bannerImage ? (
                    <img
                        src={bannerImage}
                        sizes="100vw"
                        alt={`${title} banner`}
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                        referrerPolicy="no-referrer"
                        onLoad={() => setBannerLoaded(true)}
                        className={cn(
                            "absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-300",
                            bannerLoaded ? "opacity-100" : "opacity-0"
                        )}
                    />
                ) : null}

                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
            </div>
        </div>
    )
}

