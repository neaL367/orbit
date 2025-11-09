'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState, memo, useCallback, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { hexToRgba, getAnimeTitle } from '@/lib/anime-utils'
import type { Media } from '@/lib/graphql/types/graphql'
import type { Route } from 'next'

type MediaItem = Media

type AnimeCardProps = {
  anime: MediaItem
  rank?: number
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'auto' | 'low'
}

function AnimeCardComponent({ anime, rank, loading = 'eager', fetchPriority = 'high' }: AnimeCardProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const cardData = useMemo(() => {
    return {
      id: anime.id,
      title: getAnimeTitle(anime),
      coverImage: anime.coverImage ? {
        medium: anime.coverImage.medium,
        large: anime.coverImage.large,
        extraLarge: anime.coverImage.extraLarge,
        color: anime.coverImage.color,
      } : null,
      episodes: anime.episodes,
      duration: anime.duration,
      genres: anime.genres,
      format: anime.format,
      startDate: anime.startDate ? {
        year: anime.startDate.year,
      } : null,
    }
  }, [anime])
  
  const title = cardData.title
  // Use medium as default (smallest) for cards, let srcset provide larger images for bigger screens
  const coverImage = cardData.coverImage?.medium || cardData.coverImage?.large || cardData.coverImage?.extraLarge || undefined
  const coverColor = cardData.coverImage?.color || '#1a1a1a'
  
  // Generate srcset for cover image - use realistic widths for card displays
  const coverSrcSet = useMemo(() => {
    const sizes = []
    if (cardData.coverImage?.medium) sizes.push(`${cardData.coverImage.medium} 300w`)
    if (cardData.coverImage?.large) sizes.push(`${cardData.coverImage.large} 500w`)
    if (cardData.coverImage?.extraLarge) sizes.push(`${cardData.coverImage.extraLarge} 700w`)
    return sizes.length > 1 ? sizes.join(', ') : undefined
  }, [cardData.coverImage])
  
  const handleClick = useCallback(() => {
    const referrerData = {
      pathname: pathname,
      search: searchParams.toString(),
      sort: pathname === '/anime' ? searchParams.get('sort') : null,
    }
    sessionStorage.setItem('animeDetailReferrer', JSON.stringify(referrerData))
    sessionStorage.setItem('animeDetailTitle', title)
  }, [pathname, searchParams, title])

  
  const episodes = cardData.episodes ?? undefined
  const duration = cardData.duration ?? undefined
  const genres = useMemo(() => cardData.genres?.filter(Boolean) || [], [cardData.genres])
  const format = cardData.format ?? undefined
  const year = cardData.startDate?.year ?? undefined

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
      href={`/anime/${cardData.id}` as Route} 
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
              sizes="(max-width: 640px) 300px, (max-width: 1024px) 400px, 500px"
              alt={title}
              loading={loading}
              decoding="async"
              fetchPriority={fetchPriority}
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
  // Compare props
  if (prevProps.rank !== nextProps.rank) return false
  if (prevProps.loading !== nextProps.loading) return false
  if (prevProps.fetchPriority !== nextProps.fetchPriority) return false
  
  const prev = prevProps.anime
  const next = nextProps.anime
  
  // Compare ID
  if (prev.id !== next.id) return false
  
  // Compare title (all possible title fields)
  const prevTitle = prev.title?.userPreferred || prev.title?.romaji || prev.title?.english
  const nextTitle = next.title?.userPreferred || next.title?.romaji || next.title?.english
  if (prevTitle !== nextTitle) return false
  
  // Compare cover image URLs
  const prevCover = prev.coverImage?.medium || prev.coverImage?.large || prev.coverImage?.extraLarge
  const nextCover = next.coverImage?.medium || next.coverImage?.large || next.coverImage?.extraLarge
  if (prevCover !== nextCover) return false
  
  // Compare cover color
  if (prev.coverImage?.color !== next.coverImage?.color) return false
  
  // Compare other display properties
  if (prev.episodes !== next.episodes) return false
  if (prev.duration !== next.duration) return false
  if (prev.format !== next.format) return false
  if (prev.startDate?.year !== next.startDate?.year) return false
  
  // Compare genres (check length and first two items)
  const prevGenres = prev.genres?.filter(Boolean).slice(0, 2) || []
  const nextGenres = next.genres?.filter(Boolean).slice(0, 2) || []
  if (prevGenres.length !== nextGenres.length) return false
  if (prevGenres.some((genre, i) => genre !== nextGenres[i])) return false
  
  return true
})

