"use client"

import { useState } from "react"
import Link from "next/link"
import { CarouselItem } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { getAnimeTitle, formatTimeUntilAiringDetailed } from "@/features/shared"
import { useCountdownTimer } from "../../hooks/use-countdown-timer"
import type { Media } from "@/graphql/graphql"

type ItemProps = {
  anime: Media
  index: number
  current: number
  onImageLoad: (id: number) => void
  loadedImages: Set<number>
}

export function Item({
  anime,
  index,
  current,
  onImageLoad,
  loadedImages,
}: ItemProps) {
  const title = getAnimeTitle(anime)
  const bannerImage = anime.bannerImage || anime.coverImage?.large || anime.coverImage?.medium
  const coverColor = anime.coverImage?.color || "#1a1a1a"
  const nextEpisode = anime.nextAiringEpisode
  const initialTimeUntilAiring = nextEpisode?.timeUntilAiring || 0
  const episodeNumber = nextEpisode?.episode || 0

  const timeUntilAiring = useCountdownTimer(initialTimeUntilAiring)
  const { days, hours, minutes, seconds } = formatTimeUntilAiringDetailed(timeUntilAiring)

  const isActive = current === index
  const isPriority = index === 0
  const [localImageLoaded, setLocalImageLoaded] = useState(false)
  const isImageLoaded = loadedImages.has(anime.id) || localImageLoaded || isPriority || isActive

  const handleImageLoad = () => {
    setLocalImageLoaded(true)
    onImageLoad(anime.id)
  }

  return (
    <CarouselItem className={cn("pl-0 w-full h-[400px] basis-full rounded-xl")}>
      <Link href={`/anime/${anime.id}`} className={cn("h-full block")}>
        <div className={cn("relative w-full overflow-hidden h-full rounded-xl")}>
          {/* Background Color */}
          <div
            className="absolute inset-0 z-0 rounded-xl"
            style={{ backgroundColor: coverColor }}
          />

          {/* Banner Image */}
          {bannerImage && (
            <img
              src={bannerImage}
              alt={title}
              loading={isPriority ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={isPriority ? "high" : "auto"}
              referrerPolicy="no-referrer"
              onLoad={handleImageLoad}
              onError={() => setLocalImageLoaded(true)}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-10 rounded-xl",
                isImageLoaded ? "opacity-100" : "opacity-0",
              )}
            />
          )}

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10 rounded-xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10 rounded-xl" />

          {/* Episode Badge */}
          <div className="absolute top-4 right-4 z-20">
            <div className="px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 bg-black/60 shadow-lg">
              <p className="text-sm font-bold text-white">Episode {episodeNumber}</p>
            </div>
          </div>

          {/* Content Overlay */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 p-6 transition-all duration-600 ease-out z-20",
              isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
            style={{
              animation: isActive ? "fadeUp 0.6s ease-out" : "none",
            }}
          >
            <h3 className="text-2xl md:text-3xl max-w-[400px] font-extrabold mb-3 line-clamp-2 text-white drop-shadow-2xl leading-tight">
              {title}
            </h3>

            {timeUntilAiring > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-md border border-white/20 bg-black/50">
                  <span className="text-base font-bold text-white">
                    {days > 0 && `${days}d `}
                    {hours > 0 && `${hours}h `}
                    {minutes > 0 && `${minutes}m `}
                    {seconds > 0 && `${seconds}s`}
                  </span>
                </div>
                <span className="text-sm font-medium text-zinc-300 uppercase tracking-wide">
                  until airing
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </CarouselItem>
  )
}

