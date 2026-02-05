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
}

function CarouselItemComponent({
  anime,
  index,
  current,
}: CarouselItemProps) {
  const now = useCurrentTime()
  const [highResLoaded, setHighResLoaded] = useState(false)

  const title = useMemo(() => getAnimeTitle(anime), [anime])
  const highResSrc = anime.bannerImage || anime.coverImage?.extraLarge || anime.coverImage?.large
  const episodeNumber = anime.nextAiringEpisode?.episode || 0

  const timeUntilAiring = useMemo(() => {
    if (!anime.nextAiringEpisode?.airingAt || now === null) return 0
    const timeUntil = anime.nextAiringEpisode.airingAt - now
    return timeUntil > 0 ? timeUntil : 0
  }, [anime.nextAiringEpisode, now])

  // Determine quality levels for progressive loading
  const { days, hours, minutes, seconds } = formatTimeUntilAiringDetailed(timeUntilAiring)

  const isActive = current === index
  const isPriority = index === 0

  const handleImageLoad = useCallback(() => {
    if (!highResLoaded) {
      setHighResLoaded(true)
    }
  }, [highResLoaded])

  const highResRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (highResRef.current?.complete) {
      const t = setTimeout(() => handleImageLoad(), 0)
      return () => clearTimeout(t)
    }
  }, [handleImageLoad])

  return (
    <CarouselItem className="pl-0 w-full basis-full">
      <Link
        href={`/anime/${anime.id}`}
        className="h-[400px] md:h-[500px] block relative group overflow-hidden bg-black"
      >
        {highResSrc && (
          <img
            ref={highResRef}
            src={highResSrc}
            alt={title}
            loading={isPriority ? "eager" : "lazy"}
            onLoad={handleImageLoad}
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-all duration-1000 grayscale group-hover:grayscale-0',
              highResLoaded ? 'opacity-40 group-hover:opacity-70 scale-100' : 'opacity-0 scale-110'
            )}
          />
        )}

        {/* Content Box */}
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <div className={cn(
            "transition-all duration-700 delay-100",
            isActive ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
          )}>
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.4em] text-primary">EP {episodeNumber}</span>
                <div className="h-[1px] w-12 bg-white/10" />
              </div>

              <h3 className="text-4xl md:text-6xl font-display leading-[0.9] text-white">
                {title}
              </h3>

              {now !== null && timeUntilAiring > 0 && (
                <div className="flex items-baseline gap-2 pt-4">
                  <span className="text-2xl font-display tabular-nums">
                    {days > 0 && `${days}d `}
                    {hours > 0 && `${hours}h `}
                    {minutes > 0 && `${minutes}m `}
                    {seconds >= 0 && `${seconds}s`}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Until Premiere</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-[1px] bg-white/5" />
        <div className="absolute top-0 right-0 w-[1px] h-32 bg-white/5" />
      </Link>
    </CarouselItem>
  )
}

export const UpcomingAiringCarouselItem = memo(CarouselItemComponent)
