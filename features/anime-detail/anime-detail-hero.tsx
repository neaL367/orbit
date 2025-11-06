"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Media } from "@/graphql/graphql"

type AnimeDetailHeroProps = {
    anime: Media
}

const hexToRgba = (hex?: string, alpha = 1) => {
    if (!hex || !/^#?[0-9A-Fa-f]{6}$/.test(hex)) return `rgba(26,26,26,${alpha})`
    const h = hex.replace("#", "")
    const r = Number.parseInt(h.slice(0, 2), 16)
    const g = Number.parseInt(h.slice(2, 4), 16)
    const b = Number.parseInt(h.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function AnimeDetailHero({ anime }: AnimeDetailHeroProps) {
    const [bannerLoaded, setBannerLoaded] = useState(false)

    const title = anime?.title?.userPreferred || anime?.title?.romaji || anime?.title?.english || "Unknown"
    const bannerImage = anime?.bannerImage
    const coverColor = anime?.coverImage?.color || "#0b0b0b"

    return (
        <div className="relative w-full overflow-hidden">
            {/* Background Banner */}
            <div className="relative h-[350px] w-full">
                <div className="relative max-w-[1600px] mx-auto">
                    <div className="absolute top-4 left-4  md:left-6 z-10 ">
                        <button
                            onClick={() => window.history.back()}
                            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center"
                            aria-label="Go back"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
                {bannerImage ? (
                    <Image
                        src={bannerImage || ""}
                        alt={`${title} banner`}
                        fill
                        sizes="100vw"
                        priority
                        referrerPolicy="no-referrer"
                        onLoad={() => setBannerLoaded(true)}
                        className={cn(
                            "object-cover transition-all duration-700 ease-in-out",
                            bannerLoaded ? "opacity-100 blur-0" : "opacity-0 blur-lg",
                        )}
                    />
                ) : (
                    <div
                        className="w-full h-full"
                        style={{ background: `linear-gradient(135deg, ${hexToRgba(coverColor, 1)} 0%, #000 100%)` }}
                    />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            </div>
        </div>
    )
}

