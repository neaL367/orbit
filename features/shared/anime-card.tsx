'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { hexToRgba, getAnimeTitle } from './utils/anime-utils'
import type { Media } from '@/graphql/graphql'
import type { Route } from 'next'

type MediaItem = Media

type AnimeCardProps = {
  anime: MediaItem
  rank?: number
}

export function AnimeCard({ anime, rank }: AnimeCardProps) {
  const [mediumLoaded, setMediumLoaded] = useState(false)
  const [highQualityLoaded, setHighQualityLoaded] = useState(false)
  const title = getAnimeTitle(anime)

  const mediumImage = anime?.coverImage?.medium
  const highQualityImage = anime?.coverImage?.extraLarge 
  const coverColor = anime?.coverImage?.color || '#1a1a1a'
  
  const currentImage = highQualityLoaded && highQualityImage ? highQualityImage : mediumImage
  const score = anime?.averageScore || anime?.meanScore
  const episodes = anime?.episodes
  const duration = anime?.duration
  const genres = anime?.genres?.filter(Boolean) || []
  const status = anime?.status?.toLowerCase()

  const colors = useMemo(() => ({
    border: hexToRgba(coverColor, 0.3),
    borderHover: hexToRgba(coverColor, 0.8),
    shadow: `0 4px 6px -1px ${hexToRgba(coverColor, 0.1)}, 0 2px 4px -1px ${hexToRgba(coverColor, 0.06)}`,
    shadowHover: `0 20px 25px -5px ${hexToRgba(coverColor, 0.3)}, 0 10px 10px -5px ${hexToRgba(coverColor, 0.1)}`,
    badgeBg: hexToRgba(coverColor, 0.4),
    badgeBorder: hexToRgba(coverColor, 0.6),
    statusBg: hexToRgba(coverColor, 0.3),
  }), [coverColor])

  return (
    <Link href={`/anime/${anime?.id}` as Route} className="group block">
      <Card
        className={cn(
          'relative overflow-hidden rounded-xl border bg-zinc-900/90 transition-all duration-300',
          'hover:-translate-y-1 hover:shadow-2xl will-change-transform'
        )}
        style={{
          borderColor: colors.border,
          boxShadow: colors.shadow,
          '--border-hover': colors.borderHover,
          '--shadow-hover': colors.shadowHover,
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = colors.borderHover
          e.currentTarget.style.boxShadow = colors.shadowHover
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = colors.border
          e.currentTarget.style.boxShadow = colors.shadow
        }}
      >
        {/* Cover with Info Overlay */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl">
          {/* Placeholder background - always visible */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: coverColor }}
          />
          {currentImage ? (
            <>
              {/* Medium quality image - loads first */}
              {mediumImage && (
                <Image
                  src={mediumImage}
                  alt={title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  loading="lazy"
                  fetchPriority="high"
                  referrerPolicy="no-referrer"
                  onLoad={() => setMediumLoaded(true)}
                  className={cn(
                    "object-cover transition-all duration-500 ease-out group-hover:scale-110 group-hover:brightness-70",
                    mediumLoaded ? "opacity-100 blur-0" : "opacity-0 blur-md",
                    highQualityLoaded && highQualityImage ? "opacity-0" : ""
                  )}
                />
              )}
              {/* High quality image - loads after medium is loaded, swaps in when ready */}
              {highQualityImage && mediumLoaded && (
                <Image
                  src={highQualityImage}
                  alt={title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  priority={false}
                  loading="eager"
                  referrerPolicy="no-referrer"
                  onLoad={() => setHighQualityLoaded(true)}
                  className={cn(
                    "object-cover transition-all duration-500 ease-out group-hover:scale-110 group-hover:brightness-70",
                    highQualityLoaded ? "opacity-100 blur-0" : "opacity-0"
                  )}
                />
              )}
            </>
          ) : null}

          {/* Rank Badge */}
          {rank !== undefined && (
            <div className="absolute top-0 left-0 z-20">
              <div 
                className="flex items-center justify-center w-8 h-8 rounded-br-xl backdrop-blur-md border-2 border-white/30 shadow-lg"
                style={{
                  backgroundColor: hexToRgba(coverColor, 0.5),
                  borderTop: 'none',
                  borderLeft: 'none',
                }}
              >
                <span className="text-sm font-bold text-white">#{rank}</span>
              </div>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 group-hover:opacity-0" />

          {/* Info Section - Overlaid at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2 z-10">
            {/* Title */}
            <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight drop-shadow-lg">
              {title}
            </h3>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-2 text-xs">
              {score && (
                <span
                  className="font-semibold drop-shadow-md"
                  style={{ color: '#fff', textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)' }}
                >
                  {score}%
                </span>
              )}
              {episodes && (
                <span className="text-white/80 drop-shadow-md">{episodes} ep</span>
              )}
              {duration && (
                <span className="text-white/80 drop-shadow-md">{duration}m</span>
              )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {genres.slice(0, 2).map((genre: string | null) => (
                  <Badge
                    key={genre}
                    className="text-[10px] font-medium px-1.5 py-0.5 text-white backdrop-blur-sm"
                    style={{
                      backgroundColor: colors.badgeBg,
                      borderColor: colors.badgeBorder,
                      borderWidth: '1px'
                    }}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            )}

            {/* Status */}
            {status && (
              <Badge
                className="text-[10px] capitalize text-white backdrop-blur-sm"
                style={{
                  backgroundColor: colors.statusBg,
                  borderColor: colors.badgeBorder,
                  borderWidth: '1px'
                }}
              >
                {status}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}