'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState, memo, useCallback, useMemo } from 'react'
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
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const title = useMemo(() => getAnimeTitle(anime), [anime])
  const coverImage = useMemo(() => 
    anime?.coverImage?.extraLarge || anime?.coverImage?.large || anime?.coverImage?.medium,
    [anime]
  )
  const coverColor = useMemo(() => anime?.coverImage?.color || '#1a1a1a', [anime])
  
  // Generate srcset for cover image
  const coverSrcSet = useMemo(() => {
    const sizes = []
    if (anime?.coverImage?.extraLarge) sizes.push(`${anime.coverImage.extraLarge} 600w`)
    if (anime?.coverImage?.large) sizes.push(`${anime.coverImage.large} 400w`)
    if (anime?.coverImage?.medium) sizes.push(`${anime.coverImage.medium} 300w`)
    return sizes.length > 1 ? sizes.join(', ') : undefined
  }, [anime])
  
  const handleClick = useCallback(() => {
    const referrerData = {
      pathname: pathname,
      search: searchParams.toString(),
      sort: pathname === '/anime' ? searchParams.get('sort') : null,
    }
    sessionStorage.setItem('animeDetailReferrer', JSON.stringify(referrerData))
    sessionStorage.setItem('animeDetailTitle', title)
  }, [pathname, searchParams, title])

  
  const episodes = anime?.episodes
  const duration = anime?.duration
  const genres = useMemo(() => anime?.genres?.filter(Boolean) || [], [anime?.genres])
  const format = anime?.format
  const year = anime?.startDate?.year

  const styles = useMemo(() => {
    const badgeBg = hexToRgba(coverColor, 0.4)
    const badgeBorder = hexToRgba(coverColor, 0.6)
    const rankBg = hexToRgba(coverColor, 0.85)
    return {
      badgeBg,
      badgeBorder,
      rankBg,
    }
  }, [coverColor])

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])
  
  const handleImageError = useCallback(() => {
    setImageError(true)
    setImageLoaded(true)
  }, [])

  return (
    <Link 
      href={`/anime/${anime?.id}` as Route} 
      onClick={handleClick}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-zinc-400 rounded-xl"
      aria-label={`View ${title} details`}
    >
      <Card
        className={cn(
          'relative overflow-hidden rounded-xl border bg-zinc-900/90',
          'transition-transform duration-200 ease-out',
          'hover:-translate-y-2 will-change-transform',
          'contain-layout contain-paint'
        )}
      >
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
          <div
            className="absolute inset-0 transition-opacity duration-300 ease-out"
            style={{ 
              backgroundColor: coverColor,
              opacity: imageLoaded && !imageError ? 0 : 1
            }}
          />

          {coverImage && !imageError && (
            <img
              src={coverImage}
              srcSet={coverSrcSet}
              alt={title}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              referrerPolicy="no-referrer"
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={cn(
                'absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ease-out',
                'group-hover:scale-110 transition-transform duration-300 ease-out',
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              )}
            />
          )}

          {rank !== undefined && (
            <div className="absolute top-0 left-0 z-20">
              <div 
                className="relative flex items-center justify-center min-w-[44px] h-11 px-3 rounded-br-2xl rounded-tl-lg backdrop-blur-md group-hover:scale-110 transition-transform duration-200 ease-out overflow-hidden"
                style={{
                  backgroundColor: styles.rankBg,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <span className="relative text-sm font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tight">
                  #{rank}
                </span>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 pointer-events-none" />

          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2.5 z-10">
            <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight drop-shadow-xl group-hover:text-zinc-100 transition-colors">
              {title}
            </h3>

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

            {genres.length > 0 && (
              <div className="hidden sm:flex flex-wrap gap-1.5">
                {genres.slice(0, 2).map((genre: string | null) => (
                  <Badge
                    key={genre}
                    className="text-[10px] font-semibold px-2.5 py-1 text-white backdrop-blur-md border"
                    style={{
                      backgroundColor: styles.badgeBg,
                      borderColor: styles.badgeBorder,
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
  if (prevProps.anime.id !== nextProps.anime.id) return false
  if (prevProps.rank !== nextProps.rank) return false
  
  const prevCover = prevProps.anime.coverImage?.extraLarge || prevProps.anime.coverImage?.large || prevProps.anime.coverImage?.medium
  const nextCover = nextProps.anime.coverImage?.extraLarge || nextProps.anime.coverImage?.large || nextProps.anime.coverImage?.medium
  if (prevCover !== nextCover) return false
  
  if (prevProps.anime.coverImage?.color !== nextProps.anime.coverImage?.color) return false
  
  return true
})

