'use client'

import Link from 'next/link'
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
}

function AnimeCardComponent({ anime, rank }: AnimeCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const title = useMemo(() => getAnimeTitle(anime), [anime])
  const coverImage = useMemo(() => 
    anime?.coverImage?.extraLarge || anime?.coverImage?.large || anime?.coverImage?.medium,
    [anime?.coverImage]
  )
  const coverImageSrcSet = useMemo(() => {
    const images = []
    if (anime?.coverImage?.medium) images.push(`${anime.coverImage.medium} 300w`)
    if (anime?.coverImage?.large) images.push(`${anime.coverImage.large} 600w`)
    if (anime?.coverImage?.extraLarge) images.push(`${anime.coverImage.extraLarge} 1000w`)
    return images.length > 0 ? images.join(', ') : undefined
  }, [anime])
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
          'relative overflow-hidden rounded-xl border bg-zinc-900/90 transition-all duration-300',
          'hover:-translate-y-2 hover:shadow-2xl will-change-transform',
          'hover:border-opacity-60'
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
            className="absolute inset-0 transition-opacity duration-500"
            style={{ 
              backgroundColor: coverColor,
              opacity: imageLoaded && !imageError ? 0 : 1
            }}
          />

          {/* Image */}
          {coverImage && !imageError && (
            <img
              src={coverImage}
              srcSet={coverImageSrcSet}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
              alt={title}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true)
                setImageLoaded(true)
              }}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-all duration-500",
                imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
                "group-hover:scale-110"
              )}
            />
          )}

          {/* Rank Badge */}
          {rank !== undefined && (
            <div className="absolute top-0 left-0 z-20">
              <div 
                className="relative flex items-center justify-center min-w-[44px] h-11 px-3 rounded-br-2xl rounded-tl-lg backdrop-blur-md shadow-2xl group-hover:scale-110 transition-all duration-300 overflow-hidden"
                style={{
                  backgroundColor: hexToRgba(coverColor, 0.85),
                  borderRight: `2px solid ${hexToRgba(coverColor, 0.9)}`,
                  borderBottom: `2px solid ${hexToRgba(coverColor, 0.9)}`,
                  boxShadow: `0 4px 12px -2px ${hexToRgba(coverColor, 0.4)}, inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`,
                }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Rank number */}
                <span className="relative text-sm font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tight">
                  #{rank}
                </span>
              </div>
            </div>
          )}

          {/* Gradient overlay - stronger at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 group-hover:from-black/90 group-hover:via-black/40 transition-all duration-300" />

          {/* Info Section - Overlaid at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2.5 z-10">
            {/* Title */}
            <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight drop-shadow-xl group-hover:text-zinc-100 transition-colors">
              {title}
            </h3>

            {/* Meta Info */}
            <div className="hidden sm:flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs">
              {episodes && (
                <span className="text-white/95 drop-shadow-lg font-semibold bg-white/10 px-2 py-0.5 rounded-md backdrop-blur-sm">
                  {episodes} ep
                </span>
              )}
              {duration && (
                <span className="text-white/90 drop-shadow-md font-medium">
                  {duration}m
                </span>
              )}
              {year && (
                <span className="text-white/85 drop-shadow-md font-medium">
                  {year}
                </span>
              )}
              {format && (
                <span className="text-white/75 drop-shadow-md text-[10px] uppercase tracking-wider font-medium">
                  {format.replace(/_/g, ' ')}
                </span>
              )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="hidden sm:flex flex-wrap gap-1.5">
                {genres.slice(0, 2).map((genre: string | null) => (
                  <Badge
                    key={genre}
                    className="text-[10px] font-semibold px-2.5 py-1 text-white backdrop-blur-md border group-hover:scale-105 transition-transform duration-200"
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

