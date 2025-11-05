"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Media } from "@/graphql/graphql"
import { AnimeDetailExternalLinks } from "@/features/anime-detail"
import { BackButton } from "@/features/shared"

type AnimeDetailHeaderProps = {
  anime: Media
}

const hexToRgba = (hex?: string, alpha = 1) => {
  if (!hex || !/^#?[0-9A-Fa-f]{6}$/.test(hex)) return `rgba(26,26,26,${alpha})`
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function AnimeDetailHeader({ anime }: AnimeDetailHeaderProps) {
  const [bannerLoaded, setBannerLoaded] = useState(false)
  const [coverLoaded, setCoverLoaded] = useState(false)
  
  const title = anime?.title?.userPreferred || anime?.title?.romaji || anime?.title?.english || 'Unknown'
  const subtitle = anime?.title?.english && anime.title.english !== title ? anime.title.english : undefined
  const coverImage = anime?.coverImage?.extraLarge || anime?.coverImage?.large
  const bannerImage = anime?.bannerImage
  const coverColor = anime?.coverImage?.color || '#0b0b0b'
  const score = anime?.averageScore ?? anime?.meanScore
  const episodes = anime?.episodes
  const status = anime?.status
  const format = anime?.format
  const season = anime?.season
  const seasonYear = anime?.seasonYear
  const genres = anime?.genres?.filter(Boolean) || []
  const studios = anime?.studios?.nodes?.filter(Boolean) || []
  const externalLinks = anime?.externalLinks || []
  const favourites = anime?.favourites
  const nextAiring = anime?.nextAiringEpisode

  return (
    <header className="relative w-full">
      {/* HERO SECTION */}
      <div className="relative h-[500px] md:h-[700px] w-full overflow-hidden">
        {/* Background Banner */}
        <div className="absolute inset-0">
          {bannerImage ? (
            <Image
              src={bannerImage}
              alt={`${title} banner`}
              fill
              sizes="100vw"
              priority
              onLoadingComplete={() => setBannerLoaded(true)}
              className={cn(
                "object-cover scale-105 transition-all duration-700 ease-in-out",
                bannerLoaded ? "opacity-100 blur-0" : "opacity-0 blur-lg"
              )}
            />
          ) : (
            <div 
              className="w-full h-full" 
              style={{ background: `linear-gradient(135deg, ${hexToRgba(coverColor, 1)} 0%, #000 100%)` }} 
            />
          )}

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative h-full max-w-[1680px] mx-auto px-4 md:px-6 lg:px-8">
          {/* Back Button */}
          <div className="absolute top-4 md:top-6 left-4 md:left-6 lg:left-8 z-10">
            <BackButton />
          </div>
          
          <div className="flex items-end h-full pb-12 md:pb-16">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 w-full">
              {/* Cover Image */}
              <div className="shrink-0">
                <div className="relative w-44 md:w-56 lg:w-64 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/20">
                  {coverImage ? (
                    <Image
                      src={coverImage}
                      alt={`${title} cover`}
                      fill
                      sizes="(max-width: 768px) 176px, (max-width: 1024px) 224px, 256px"
                      priority
                      onLoadingComplete={() => setCoverLoaded(true)}
                      className={cn(
                        "object-cover transition-all duration-700 ease-in-out",
                        coverLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-lg"
                      )}
                    />
                  ) : (
                    <div className="w-full h-full" style={{ backgroundColor: coverColor }} />
                  )}
                </div>
              </div>

              {/* Title & Meta */}
              <div className="flex-1 flex flex-col justify-end pb-2">
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-2">
                      {title}
                    </h1>
                    {subtitle && (
                      <p className="text-base md:text-lg text-white/70 font-medium">{subtitle}</p>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap items-center gap-3">
                    {typeof score === 'number' && (
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                        <span className="text-lg">⭐</span>
                        <span className="text-base font-bold text-white">{score}%</span>
                      </div>
                    )}

                    {episodes && (
                      <div className="px-4 py-2.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                        <span className="text-base font-semibold text-white">{episodes} Episodes</span>
                      </div>
                    )}

                    {status && (
                      <div className="px-4 py-2.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                        <span className="text-base font-semibold text-white capitalize">
                          {status.toLowerCase()}
                        </span>
                      </div>
                    )}

                    {format && (
                      <div className="px-4 py-2.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                        <span className="text-base font-semibold text-white">{format}</span>
                      </div>
                    )}
                  </div>

                  {/* Genres */}
                  {genres.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {genres.slice(0, 5).map((g) => (
                        <span 
                          key={g} 
                          className="px-3 py-1.5 rounded-full text-sm font-medium bg-white/5 border border-white/10 text-white/90"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS SECTION */}
      <div className="">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Column - Metadata */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Information</h2>
                
                <div className="space-y-5">
                  {season && seasonYear && (
                    <div>
                      <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                        Season
                      </div>
                      <div className="text-base font-medium text-white capitalize">
                        {season.toLowerCase()} {seasonYear}
                      </div>
                    </div>
                  )}

                  {anime?.popularity != null && (
                    <div>
                      <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                        Popularity
                      </div>
                      <div className="text-base font-medium text-white">
                        #{anime.popularity.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {favourites != null && (
                    <div>
                      <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                        Favorites
                      </div>
                      <div className="text-base font-medium text-white">
                        {favourites.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {nextAiring && (
                    <div>
                      <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                        Next Episode
                      </div>
                      <div className="text-base font-medium text-white">
                        Episode {nextAiring.episode}
                      </div>
                    </div>
                  )}
                </div>

                {/* Studios */}
                {studios.length > 0 && (
                  <div className="pt-4 border-t border-zinc-800">
                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                      Studios
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {studios.map((s) => s && (
                        <span 
                          key={s.id} 
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-zinc-900 border border-zinc-800 text-white"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Links */}
                <div className="pt-4 border-t border-zinc-800">
                  <AnimeDetailExternalLinks externalLinks={externalLinks} />
                </div>
              </div>
            </div>

            {/* Right Column - Description */}
            <div className="lg:col-span-2">
              {anime?.description && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Synopsis</h2>
                  <div className="p-6 md:p-8 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <p className="text-zinc-300 leading-relaxed text-base">
                      {anime.description.replace(/<[^>]*>/g, '')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}