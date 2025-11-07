'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useMemo, memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { hexToRgba, getAnimeTitle } from '../utils/anime-utils'
import type { Media } from '@/graphql/graphql'
import type { Route } from 'next'

type MediaItem = Media

type AnimeCardProps = {
  anime: MediaItem
  rank?: number
  priority?: boolean
}

function AnimeCardComponent({ anime, rank, priority = false }: AnimeCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const title = useMemo(() => getAnimeTitle(anime), [anime])
  const coverImage = useMemo(() => 
    anime?.coverImage?.extraLarge || anime?.coverImage?.large || anime?.coverImage?.medium,
    [anime?.coverImage]
  )
  const coverColor = useMemo(() => anime?.coverImage?.color || '#1a1a1a', [anime?.coverImage?.color])
  
  const episodes = anime?.episodes
  const duration = anime?.duration
  const genres = useMemo(() => anime?.genres?.filter(Boolean) || [], [anime?.genres])
  const format = anime?.format
  const year = anime?.startDate?.year

  const colors = useMemo(() => ({
    border: hexToRgba(coverColor, 0.3),
    shadow: `0 4px 6px -1px ${hexToRgba(coverColor, 0.1)}, 0 2px 4px -1px ${hexToRgba(coverColor, 0.06)}`,
    badgeBg: hexToRgba(coverColor, 0.4),
    badgeBorder: hexToRgba(coverColor, 0.6),
  }), [coverColor])

  return (
    <Link 
      href={`/anime/${anime?.id}` as Route} 
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-zinc-400 rounded-xl"
      aria-label={`View ${title} details`}
    >
      <Card
        className={cn(
          'relative overflow-hidden rounded-xl border bg-zinc-900/90 transition-all duration-200',
          'hover:-translate-y-1 will-change-transform'
        )}
        style={{
          borderColor: colors.border,
          boxShadow: colors.shadow,
        } as React.CSSProperties}
      >
        {/* Cover with Info Overlay */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
          {/* Placeholder background - always visible */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{ 
              backgroundColor: coverColor,
              opacity: imageLoaded && !imageError ? 0 : 1
            }}
          />

          {/* Image */}
          {coverImage && !imageError && (
            <Image
              src={coverImage}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              referrerPolicy="no-referrer"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true)
                setImageLoaded(true)
              }}
              className={cn(
                "object-cover transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
            />
          )}

          {/* Rank Badge */}
          {rank !== undefined && (
            <div className="absolute top-0 left-0 z-20">
              <div 
                className="flex items-center justify-center w-9 h-9 rounded-br-xl backdrop-blur-md border-2 border-white/30 shadow-lg"
                style={{
                  backgroundColor: hexToRgba(coverColor, 0.6),
                  borderTop: 'none',
                  borderLeft: 'none',
                }}
              >
                <span className="text-sm font-bold text-white drop-shadow-lg">#{rank}</span>
              </div>
            </div>
          )}

          {/* Gradient overlay - stronger at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Info Section - Overlaid at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2 z-10">
            {/* Title */}
            <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight drop-shadow-lg">
              {title}
            </h3>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              {episodes && (
                <span className="text-white/90 drop-shadow-md font-medium">
                  {episodes} ep
                </span>
              )}
              {duration && (
                <span className="text-white/80 drop-shadow-md">
                  {duration}m
                </span>
              )}
              {year && (
                <span className="text-white/80 drop-shadow-md">
                  {year}
                </span>
              )}
              {format && (
                <span className="text-white/70 drop-shadow-md text-[10px] uppercase tracking-wide">
                  {format.replace(/_/g, ' ')}
                </span>
              )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {genres.slice(0, 2).map((genre: string | null) => (
                  <Badge
                    key={genre}
                    className="text-[10px] font-medium px-2 py-0.5 text-white backdrop-blur-sm border"
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
          </div>
        </div>
      </Card>
    </Link>
  )
}

export const AnimeCard = memo(AnimeCardComponent, (prevProps, nextProps) => {
  return prevProps.anime.id === nextProps.anime.id && 
         prevProps.rank === nextProps.rank
})

