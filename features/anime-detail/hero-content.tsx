"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { getAnimeTitle, getAnimeSubtitle, formatDate, formatTimeUntilAiring } from "@/features/shared"
import { useCurrentTime } from "@/hooks/use-current-time"
import type { Media } from "@/graphql/graphql"
import { Star, Flame, Calendar, Clock, ChevronDown } from "lucide-react"

type HeroContentProps = {
  anime: Media
}

export function HeroContent({ anime }: HeroContentProps) {
  const [coverLoaded, setCoverLoaded] = useState(false)
  const now = useCurrentTime()

  const title = getAnimeTitle(anime)
  const subtitle = getAnimeSubtitle(anime)
  const coverImage = anime?.coverImage?.extraLarge || anime?.coverImage?.large
  const coverColor = anime?.coverImage?.color || "#0b0b0b"
  
  // Generate srcset for cover image
  const coverSrcSet = useMemo(() => {
    const sizes = []
    if (anime?.coverImage?.extraLarge) sizes.push(`${anime.coverImage.extraLarge} 600w`)
    if (anime?.coverImage?.large) sizes.push(`${anime.coverImage.large} 400w`)
    if (anime?.coverImage?.medium) sizes.push(`${anime.coverImage.medium} 300w`)
    return sizes.length > 1 ? sizes.join(', ') : undefined
  }, [anime])
  const score = anime?.averageScore ?? anime?.meanScore
  const popularity = anime?.popularity
  const duration = anime?.duration
  const episodes = anime?.episodes
  const nextAiring = anime?.nextAiringEpisode
  const releaseDate = anime?.startDate ? formatDate(anime.startDate) : null
  
  // Calculate time until airing from airingAt timestamp
  const timeUntilAiring = useMemo(() => {
    if (!nextAiring?.airingAt) return null
    const airingAt = nextAiring.airingAt
    const timeUntil = airingAt - now
    return timeUntil > 0 ? timeUntil : 0
  }, [nextAiring?.airingAt, now])
  
  const timeUntilAiringFormatted = formatTimeUntilAiring(timeUntilAiring ?? undefined)

  return (
    <div className="mb-8 sm:mb-12 lg:mb-16">
      {/* Main Content - Flex layout */}
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10 items-start">
        {/* Cover Image */}
        <div className="shrink-0 w-full sm:w-52 md:w-60 lg:w-72 mx-auto lg:mx-0">
          <div className="group relative w-full aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/10 hover:ring-white/20 transition-all duration-300">
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{ 
                backgroundColor: coverColor,
                opacity: coverLoaded ? 0 : 1
              }}
            />
            {coverImage ? (
              <img
                src={coverImage}
                srcSet={coverSrcSet}
                alt={`${title} cover`}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                referrerPolicy="no-referrer"
                onLoad={() => setCoverLoaded(true)}
                className={cn(
                  "absolute inset-0 w-full h-full object-cover transition-all duration-500",
                  coverLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
                  "group-hover:scale-105"
                )}
              />
            ) : null}
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        {/* Title & Meta Information */}
        <div className="flex-1 min-w-0 space-y-5 sm:space-y-6 lg:space-y-7">
          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight break-words tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base sm:text-lg md:text-xl text-zinc-300 font-medium break-words leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Primary Stats */}
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {typeof score === "number" && (
              <div className="group flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-md border border-yellow-500/40 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 hover:border-yellow-500/60 transition-all duration-200">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 shrink-0 fill-yellow-400" />
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl font-extrabold text-white">{score / 10}</span>
                  <span className="text-xs text-yellow-300/70">/10</span>
                </div>
              </div>
            )}

            {popularity != null && (
              <div className="group flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-md border border-orange-500/40 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 hover:border-orange-500/60 transition-all duration-200">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 shrink-0 fill-orange-400" />
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-orange-300/70">#</span>
                  <span className="text-lg sm:text-xl font-extrabold text-white">{popularity.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Secondary Info */}
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {releaseDate && (
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-800/60 backdrop-blur-md border border-zinc-700/60 hover:bg-zinc-700/60 hover:border-zinc-600/60 transition-all duration-200 shadow-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300 shrink-0" />
                <span className="text-sm sm:text-base font-semibold text-white">{releaseDate}</span>
              </div>
            )}

            {duration && (
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-800/60 backdrop-blur-md border border-zinc-700/60 hover:bg-zinc-700/60 hover:border-zinc-600/60 transition-all duration-200 shadow-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300 shrink-0" />
                <span className="text-sm sm:text-base font-semibold text-white">{duration} min/ep</span>
              </div>
            )}

            {episodes && (
              <div className="px-4 py-2.5 rounded-xl bg-zinc-800/60 backdrop-blur-md border border-zinc-700/60 shadow-lg">
                <span className="text-sm sm:text-base font-semibold text-white">{episodes} Episodes</span>
              </div>
            )}
          </div>

          {/* Next Episode Countdown */}
          {nextAiring && timeUntilAiringFormatted && timeUntilAiring && timeUntilAiring > 0 && (
            <button
              onClick={() => {
                const element = document.getElementById('streaming-episodes')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-green-500/50 shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:border-green-500/70 transition-all duration-200 w-fit animate-pulse cursor-pointer active:scale-95"
            >
              <div className="relative">
                <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 shrink-0" />
                <div className="absolute inset-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500/30 animate-ping" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-green-300/70 font-medium">Next Episode</span>
                <span className="text-sm sm:text-base font-bold text-green-200">
                  Ep {nextAiring.episode} in {timeUntilAiringFormatted}
                </span>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

