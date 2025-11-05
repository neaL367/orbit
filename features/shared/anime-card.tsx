'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Media } from '@/graphql/graphql'
import type { Route } from 'next'

type MediaItem = Media

const hexToRgba = (hex: string, opacity: number = 1): string => {
  if (!hex || hex.length < 7) return `rgba(26, 26, 26, ${opacity})`
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

type AnimeCardProps = {
  anime: MediaItem
  rank?: number
}

export function AnimeCard({ anime, rank }: AnimeCardProps) {
  const title =
    anime?.title?.userPreferred ||
    anime?.title?.romaji ||
    anime?.title?.english ||
    'Unknown'

  const coverImage = anime?.coverImage?.extraLarge || anime?.coverImage?.large || anime?.coverImage?.medium
  const coverColor = anime?.coverImage?.color || '#1a1a1a'
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
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
              loading="lazy"
              quality={75}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ backgroundColor: coverColor }}
            />
          )}

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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

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