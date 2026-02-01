'use client'

import Link from 'next/link'
import { useState, useMemo, useCallback, memo, useRef, useEffect } from 'react'
import { CarouselItem } from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import { getAnimeTitle, formatTimeUntilAiringDetailed } from '@/lib/utils/anime-utils'
import { useCurrentTime } from '@/hooks/use-current-time'
import type { Media } from '@/lib/graphql/types/graphql'

type CarouselItemProps = {
  anime: Media
  index: number
  current: number
  onImageLoad: (id: number) => void
  loadedImages: Set<number>
}

function CarouselItemComponent({
  anime,
  index,
  current,
  onImageLoad,
  loadedImages,
}: CarouselItemProps) {
  const now = useCurrentTime()
  const [highResLoaded, setHighResLoaded] = useState(false)
  const [lowResLoaded, setLowResLoaded] = useState(false)

  // Extract only necessary data from Media object
  const animeData = useMemo(() => {
    return {
      id: anime.id,
      title: getAnimeTitle(anime),
      bannerImage: anime.bannerImage,
      coverImage: anime.coverImage,
      nextAiringEpisode: anime.nextAiringEpisode,
    }
  }, [anime])

  const title = animeData.title

  // High-res: banner or extraLarge/large cover
  const highResSrc = animeData.bannerImage || animeData.coverImage?.extraLarge || animeData.coverImage?.large
  // Low-res: medium cover (loads fast as placeholder)
  const lowResSrc = animeData.coverImage?.medium || undefined
  const coverColor = animeData.coverImage?.color || '#1a1a1a'

  const nextEpisode = animeData.nextAiringEpisode
  const episodeNumber = nextEpisode?.episode || 0

  // Standard srcSet for high-res image (responsive fallback)
  const srcSet = useMemo(() => {
    if (animeData.bannerImage) return undefined
    const sizes = []
    if (animeData.coverImage?.medium) sizes.push(`${animeData.coverImage.medium} 600w`)
    if (animeData.coverImage?.large) sizes.push(`${animeData.coverImage.large} 1200w`)
    if (animeData.coverImage?.extraLarge) sizes.push(`${animeData.coverImage.extraLarge} 1600w`)
    return sizes.length > 1 ? sizes.join(', ') : undefined
  }, [animeData.bannerImage, animeData.coverImage])

  const timeUntilAiring = useMemo(() => {
    if (!nextEpisode?.airingAt) return 0
    const airingAt = nextEpisode.airingAt
    const timeUntil = airingAt - now
    return timeUntil > 0 ? timeUntil : 0
  }, [nextEpisode, now])

  const { days, hours, minutes, seconds } = formatTimeUntilAiringDetailed(timeUntilAiring)

  const isActive = current === index
  const isPriority = index === 0
  const isImageLoaded = loadedImages.has(animeData.id) || highResLoaded || isPriority || isActive

  const handleImageLoad = useCallback(() => {
    if (!highResLoaded) {
      setHighResLoaded(true)
      onImageLoad(animeData.id)
    }
  }, [animeData.id, onImageLoad, highResLoaded])

  const handleClick = useCallback(() => {
    const referrerData = {
      pathname: '/',
      search: '',
      sort: null,
    }
    sessionStorage.setItem('animeDetailReferrer', JSON.stringify(referrerData))
    sessionStorage.setItem('animeDetailTitle', title)
  }, [title])

  const highResRef = useRef<HTMLImageElement>(null)
  const lowResRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (highResRef.current?.complete) {
        handleImageLoad()
      }
      if (lowResRef.current?.complete) {
        setLowResLoaded(true)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [handleImageLoad])

  return (
    <CarouselItem className={cn("pl-0 w-full h-[400px] md:h-[450px] basis-full rounded-xl")}>
      <Link
        href={`/anime/${animeData.id}`}
        onClick={handleClick}
        className="h-full block group"
        aria-label={`View details for ${title}`}
      >
        <div className="relative w-full overflow-hidden h-full rounded-xl cursor-pointer bg-zinc-900">
          <div
            className="absolute inset-0 z-0 rounded-xl transition-opacity duration-500"
            style={{
              backgroundColor: coverColor,
              opacity: isImageLoaded ? 0 : 1
            }}
          />

          {/* 1. Low-Res Placeholder */}
          {lowResSrc && !highResLoaded && (
            <img
              ref={lowResRef}
              src={lowResSrc}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              onLoad={() => setLowResLoaded(true)}
              className={cn(
                'absolute inset-0 w-full h-full object-cover blur-md transition-opacity duration-500 z-0 rounded-xl',
                lowResLoaded ? 'opacity-40' : 'opacity-0'
              )}
            />
          )}

          {/* 2. High-Res Banner */}
          {highResSrc && (
            <img
              ref={highResRef}
              src={highResSrc}
              srcSet={srcSet}
              sizes="100vw"
              alt={title}
              loading={isPriority ? "eager" : "lazy"}
              decoding="async"
              referrerPolicy="no-referrer"
              onLoad={handleImageLoad}
              onError={() => setHighResLoaded(true)}
              className={cn(
                'absolute inset-0 w-full h-full object-cover transition-all duration-500 z-10 rounded-xl',
                'group-hover:scale-110',
                highResLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              )}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/30 z-10 rounded-xl group-hover:from-black/90 group-hover:via-black/60 transition-all duration-300" />

          <div className="absolute top-4 right-4 z-20">
            <div className="px-4 py-2 rounded-xl backdrop-blur-md border border-white/30 bg-black/70 shadow-xl group-hover:bg-black/80 group-hover:border-white/40 transition-all duration-300">
              <p className="text-sm font-bold text-white">Episode {episodeNumber}</p>
            </div>
          </div>

          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 p-6 md:p-8 transition-all duration-500 ease-out z-20',
              isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            )}
          >
            <h3 className="text-2xl md:text-3xl lg:text-4xl max-w-[400px] font-extrabold mb-4 line-clamp-2 text-white drop-shadow-2xl leading-tight group-hover:text-zinc-100 transition-colors">
              {title}
            </h3>

            {timeUntilAiring > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl backdrop-blur-md border border-white/30 bg-black/70 shadow-xl group-hover:bg-black/80 group-hover:border-white/40 transition-all duration-300">
                  <span className="text-base md:text-lg font-bold text-white tabular-nums">
                    {days > 0 && `${days}d `}
                    {hours > 0 && `${hours}h `}
                    {minutes > 0 && `${minutes}m `}
                    {seconds >= 0 && `${seconds}s`}
                  </span>
                </div>
                <span className="text-sm md:text-base font-semibold text-zinc-200 uppercase tracking-wider">
                  until airing
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </CarouselItem>
  )
}

export const UpcomingAiringCarouselItem = memo(CarouselItemComponent, (prevProps, nextProps) => {
  // Compare index and current (affects rendering)
  if (prevProps.index !== nextProps.index) return false
  if (prevProps.current !== nextProps.current) return false

  // Compare anime data
  const prev = prevProps.anime
  const next = nextProps.anime

  if (prev.id !== next.id) return false

  // Compare title
  const prevTitle = prev.title?.userPreferred || prev.title?.romaji || prev.title?.english
  const nextTitle = next.title?.userPreferred || next.title?.romaji || next.title?.english
  if (prevTitle !== nextTitle) return false

  // Compare banner image
  if (prev.bannerImage !== next.bannerImage) return false

  // Compare cover image URLs
  const prevCover = prev.coverImage?.large || prev.coverImage?.medium
  const nextCover = next.coverImage?.large || next.coverImage?.medium
  if (prevCover !== nextCover) return false

  // Compare cover color
  if (prev.coverImage?.color !== next.coverImage?.color) return false

  // Compare next airing episode
  if (prev.nextAiringEpisode?.episode !== next.nextAiringEpisode?.episode) return false
  if (prev.nextAiringEpisode?.airingAt !== next.nextAiringEpisode?.airingAt) return false

  // Compare function references
  if (prevProps.onImageLoad !== nextProps.onImageLoad) return false

  // Compare loadedImages Set (reference equality - should be stable)
  if (prevProps.loadedImages !== nextProps.loadedImages) return false

  return true
})

