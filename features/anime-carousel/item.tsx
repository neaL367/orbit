'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useMemo, useCallback } from 'react'
import { CarouselItem } from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import { getAnimeTitle, formatTimeUntilAiringDetailed } from '@/features/shared'
import { useCurrentTime } from '@/hooks/use-current-time'
import type { Media } from '@/graphql/graphql'

type ItemProps = {
  anime: Media
  index: number
  current: number
  onImageLoad: (id: number) => void
  loadedImages: Set<number>
}

export function Item({
  anime,
  index,
  current,
  onImageLoad,
  loadedImages,
}: ItemProps) {
  const now = useCurrentTime()
  const [localImageLoaded, setLocalImageLoaded] = useState(false)

  const title = getAnimeTitle(anime)
  const bannerImage = anime.bannerImage || anime.coverImage?.large || anime.coverImage?.medium
  const coverColor = anime.coverImage?.color || '#1a1a1a'
  const nextEpisode = anime.nextAiringEpisode
  const episodeNumber = nextEpisode?.episode || 0

  const timeUntilAiring = useMemo(() => {
    if (!nextEpisode?.airingAt) return 0
    const airingAt = nextEpisode.airingAt
    const timeUntil = airingAt - now
    return timeUntil > 0 ? timeUntil : 0
  }, [nextEpisode?.airingAt, now])
  
  const { days, hours, minutes, seconds } = formatTimeUntilAiringDetailed(timeUntilAiring)

  const isActive = current === index
  const isPriority = index === 0
  const isImageLoaded = loadedImages.has(anime.id) || localImageLoaded || isPriority || isActive

  const handleImageLoad = useCallback(() => {
    setLocalImageLoaded(true)
    onImageLoad(anime.id)
  }, [anime.id, onImageLoad])

  const handleClick = useCallback(() => {
    const referrerData = {
      pathname: '/',
      search: '',
      sort: null,
    }
    sessionStorage.setItem('animeDetailReferrer', JSON.stringify(referrerData))
    sessionStorage.setItem('animeDetailTitle', title)
  }, [title])

  return (
    <CarouselItem className={cn("pl-0 w-full h-[400px] md:h-[450px] basis-full rounded-xl")}>
      <Link 
        href={`/anime/${anime.id}`} 
        onClick={handleClick}
        className="h-full block group"
      >
        <div className="relative w-full overflow-hidden h-full rounded-xl cursor-pointer">
          <div
            className="absolute inset-0 z-0 rounded-xl transition-opacity duration-500"
            style={{ 
              backgroundColor: coverColor,
              opacity: isImageLoaded ? 0 : 1
            }}
          />

          {bannerImage && (
            <Image
              src={bannerImage}
              alt={title}
              fill
              priority={isPriority}
              referrerPolicy="no-referrer"
              onLoad={handleImageLoad}
              onError={() => setLocalImageLoaded(true)}
              className={cn(
                'object-cover transition-all duration-500 z-10 rounded-xl',
                'group-hover:scale-110',
                isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
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

