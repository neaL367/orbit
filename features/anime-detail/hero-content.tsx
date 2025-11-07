"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { getAnimeTitle, getAnimeSubtitle, formatDate, formatTimeUntilAiring } from "@/features/shared"
import type { Media } from "@/graphql/graphql"
import { Star, Flame, Calendar, Clock, ChevronDown } from "lucide-react"

type HeroContentProps = {
  anime: Media
}

export function HeroContent({ anime }: HeroContentProps) {
  const [coverLoaded, setCoverLoaded] = useState(false)

  const title = getAnimeTitle(anime)
  const subtitle = getAnimeSubtitle(anime)
  const coverImage = anime?.coverImage?.extraLarge || anime?.coverImage?.large
  const coverImageSrcSet = useMemo(() => {
    const images = []
    if (anime?.coverImage?.medium) images.push(`${anime.coverImage.medium} 300w`)
    if (anime?.coverImage?.large) images.push(`${anime.coverImage.large} 600w`)
    if (anime?.coverImage?.extraLarge) images.push(`${anime.coverImage.extraLarge} 1000w`)
    return images.length > 0 ? images.join(', ') : undefined
  }, [anime])
  const coverColor = anime?.coverImage?.color || "#0b0b0b"
  const score = anime?.averageScore ?? anime?.meanScore
  const popularity = anime?.popularity
  const duration = anime?.duration
  const episodes = anime?.episodes
  const nextAiring = anime?.nextAiringEpisode
  const releaseDate = anime?.startDate ? formatDate(anime.startDate) : null
  const timeUntilAiring = formatTimeUntilAiring(nextAiring?.timeUntilAiring ?? undefined)

  return (
    <div className="mb-8 sm:mb-12 lg:mb-16">
      {/* Main Content - Flex layout without overlap */}
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10 items-start">
        {/* Cover Image */}
        <div className="shrink-0 w-full sm:w-48 md:w-56 lg:w-64">
          <div className="relative w-full aspect-[2/3] rounded-lg sm:rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/20">
            <div
              className="absolute inset-0"
              style={{ backgroundColor: coverColor }}
            />
            {coverImage ? (
              <img
                src={coverImage || "/placeholder.svg"}
                srcSet={coverImageSrcSet}
                sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, 256px"
                alt={`${title} cover`}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                referrerPolicy="no-referrer"
                onLoad={() => setCoverLoaded(true)}
                className={cn(
                  "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                  coverLoaded ? "opacity-100" : "opacity-0",
                )}
              />
            ) : null}
          </div>
        </div>

        {/* Title & Meta Information */}
        <div className="flex-1 min-w-0 space-y-4 sm:space-y-5 md:space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight break-words">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm sm:text-base md:text-lg text-white/70 font-medium break-words mt-2">
                {subtitle}
              </p>
            )}
          </div>

          {/* Primary Stats */}
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {typeof score === "number" && (
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 shrink-0" />
                <span className="text-sm sm:text-base font-bold text-white">{score / 10}</span>
              </div>
            )}

            {popularity != null && (
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 shrink-0" />
                <span className="text-sm sm:text-base font-bold text-white">
                  #{popularity.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Secondary Info */}
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {releaseDate && (
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
                <span className="text-sm sm:text-base font-medium text-white">{releaseDate}</span>
              </div>
            )}

            {duration && (
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
                <span className="text-sm sm:text-base font-medium text-white">{duration}m/ep</span>
              </div>
            )}

            {episodes && (
              <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                <span className="text-sm sm:text-base font-medium text-white">{episodes} Episodes</span>
              </div>
            )}
          </div>

          {/* Next Episode Countdown */}
          {nextAiring && timeUntilAiring && (
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-green-500/20 backdrop-blur-md border border-green-500/40 w-fit">
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" />
              <span className="text-sm sm:text-base font-semibold text-green-200">
                Ep {nextAiring.episode} in {timeUntilAiring}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

