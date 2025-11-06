"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { getAnimeTitle, BackButton } from "@/features/shared"
import type { Media } from "@/graphql/graphql"

type AnimeDetailHeroProps = {
    anime: Media
}

export function AnimeDetailHero({ anime }: AnimeDetailHeroProps) {
    const [bannerLoaded, setBannerLoaded] = useState(false)

    const title = getAnimeTitle(anime)
    const bannerImage = anime?.bannerImage
    const coverColor = anime?.coverImage?.color || "#0b0b0b"

    return (
        <div className="relative w-full overflow-hidden">
            {/* Background Banner */}
            <div className="relative h-[350px] w-full">
                <div className="relative max-w-[1600px] mx-auto">
                    <div className="absolute top-4 left-4 md:left-10 z-10 ">
                        <BackButton />
                    </div>
                </div>
                <div
                    className="absolute inset-0"
                    style={{ backgroundColor: coverColor }}
                />
                {bannerImage ? (
                    <Image
                        src={bannerImage || ""}
                        alt={`${title} banner`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority
                        referrerPolicy="no-referrer"
                        onLoad={() => setBannerLoaded(true)}
                        className={cn(
                            "object-cover transition-opacity duration-300",
                            bannerLoaded ? "opacity-100" : "opacity-0",
                        )}
                    />
                ) : null}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            </div>
        </div>
    )
}

