'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Media } from '@/graphql/graphql'
import type { Route } from 'next'

type MediaItem = Media

// Helper function to convert hex to rgba with opacity
const hexToRgba = (hex: string, opacity: number = 1): string => {
  if (!hex || hex.length < 7) return `rgba(26, 26, 26, ${opacity})`
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function AnimeCard({ anime }: { anime: MediaItem}) {
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

  return (
    <Link href={`/anime/${anime?.id}` as Route} className="group block">
      <Card
        className={cn(
          'relative overflow-hidden rounded-xl border bg-zinc-900/90 transition-all duration-300',
          'hover:-translate-y-1 hover:shadow-2xl'
        )}
        style={{
          borderColor: hexToRgba(coverColor, 0.3),
          boxShadow: `0 4px 6px -1px ${hexToRgba(coverColor, 0.1)}, 0 2px 4px -1px ${hexToRgba(coverColor, 0.06)}`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = hexToRgba(coverColor, 0.8)
          e.currentTarget.style.boxShadow = `0 20px 25px -5px ${hexToRgba(coverColor, 0.3)}, 0 10px 10px -5px ${hexToRgba(coverColor, 0.1)}`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = hexToRgba(coverColor, 0.3)
          e.currentTarget.style.boxShadow = `0 4px 6px -1px ${hexToRgba(coverColor, 0.1)}, 0 2px 4px -1px ${hexToRgba(coverColor, 0.06)}`
        }}
      >
        {/* Cover with Info Overlay */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl">
          {coverImage ? (
            <>
              <Image
                src={coverImage}
                alt={title}
                fill
                priority={false}
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="50vw"
                loading="eager"
              />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{ backgroundColor: coverColor }}
            />
          )}

          {/* Gradient from bottom for info section background */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent "
          // style={{ 
          //   background: `linear-gradient(to top, ${hexToRgba(coverColor, 0.1)} 0%, ${hexToRgba(coverColor, 0.1)} 20%, transparent 60%)`
          // }}
          />

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
                      backgroundColor: hexToRgba(coverColor, 0.4),
                      borderColor: hexToRgba(coverColor, 0.6),
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
                  backgroundColor: hexToRgba(coverColor, 0.3),
                  borderColor: hexToRgba(coverColor, 0.6),
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
