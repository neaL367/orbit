"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { getAnimeTitle } from "@/lib/anime-utils"
import type { Media } from "@/lib/graphql/types/graphql"

type HeroProps = {
    anime: Media
}

export function Hero({ anime }: HeroProps) {
    const [bannerLoaded, setBannerLoaded] = useState(false)
    const [placeholderLoaded, setPlaceholderLoaded] = useState(false)

    const title = getAnimeTitle(anime)
    const bannerImage = anime?.bannerImage
    const placeholderImage = anime?.coverImage?.large || anime?.coverImage?.medium
    const coverColor = anime?.coverImage?.color || "#0b0b0b"

    const bannerRef = useRef<HTMLImageElement>(null)
    const placeholderRef = useRef<HTMLImageElement>(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            if (bannerRef.current?.complete) {
                setBannerLoaded(true)
            }
            if (placeholderRef.current?.complete) {
                setPlaceholderLoaded(true)
            }
        }, 0)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="relative w-full overflow-hidden">
            {/* Background Banner Container */}
            <div className="relative h-[350px] w-full bg-zinc-900">
                <div
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{
                        backgroundColor: coverColor,
                        opacity: bannerLoaded ? 0 : 1
                    }}
                />

                {/* 1. Low-Res Placeholder (Cover Image) */}
                {placeholderImage && !bannerLoaded && (
                    <img
                        ref={placeholderRef}
                        src={placeholderImage}
                        alt=""
                        aria-hidden="true"
                        referrerPolicy="no-referrer"
                        onLoad={() => setPlaceholderLoaded(true)}
                        className={cn(
                            "absolute inset-0 w-full h-full object-cover object-top blur-md transition-opacity duration-500",
                            placeholderLoaded ? "opacity-40" : "opacity-0"
                        )}
                    />
                )}

                {/* 2. High-Res Banner */}
                {bannerImage ? (
                    <img
                        ref={bannerRef}
                        src={bannerImage}
                        sizes="100vw"
                        alt={`${title} banner`}
                        loading="eager"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onLoad={() => setBannerLoaded(true)}
                        className={cn(
                            "absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ease-out",
                            bannerLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                        )}
                    />
                ) : null}

                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
            </div>
        </div>
    )
}

