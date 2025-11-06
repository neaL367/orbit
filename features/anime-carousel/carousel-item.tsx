/**
 * Carousel item component for upcoming airing anime
 */

import Link from 'next/link'
import Image from 'next/image'
import { CarouselItem } from '@/components/ui/carousel'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getAnimeTitle, formatTimeUntilAiringDetailed } from '@/features/shared'
import type { Media } from '@/graphql/graphql'

type CarouselItemProps = {
  anime: Media
  index: number
  current: number
  onImageLoad: (id: number) => void
  loadedImages: Set<number>
}

export function UpcomingAiringCarouselItem({
  anime,
  index,
  current,
  onImageLoad,
  loadedImages,
}: CarouselItemProps) {
  const title = getAnimeTitle(anime)
  const bannerImage = anime.bannerImage || anime.coverImage?.large || anime.coverImage?.medium
  const coverColor = anime.coverImage?.color || '#1a1a1a'
  const nextEpisode = anime.nextAiringEpisode
  const timeUntilAiring = nextEpisode?.timeUntilAiring || 0
  const episodeNumber = nextEpisode?.episode || 0
  const { days, hours, minutes } = formatTimeUntilAiringDetailed(timeUntilAiring)
  const isActive = current === index
  const isPriority = index === 0
  const isImageLoaded = loadedImages.has(anime.id) || isPriority

  return (
    <CarouselItem className="pl-0 basis-full">
      <Link href={`/anime/${anime.id}`}>
        <Card className="group relative overflow-hidden border-0 bg-zinc-900 hover:bg-zinc-800 transition-colors">
          <div className="relative aspect-video h-[300px] w-full overflow-hidden">
            {/* Placeholder background */}
            <div
              className="absolute inset-0 z-0"
              style={{ backgroundColor: coverColor }}
            />
            
            {/* Banner Image */}
            {bannerImage && (
              <Image
                src={bannerImage}
                alt={title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={isPriority}
                loading={isPriority ? 'eager' : 'lazy'}
                fetchPriority={isPriority ? 'high' : 'auto'}
                referrerPolicy="no-referrer"
                onLoad={() => onImageLoad(anime.id)}
                className={cn(
                  'object-cover transition-opacity duration-300 z-10',
                  isImageLoaded ? 'opacity-100' : 'opacity-0'
                )}
              />
            )}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
            
            {/* Episode badge */}
            <div className="absolute top-4 right-4 z-10">
              <div className="px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 bg-black/60 shadow-lg">
                <p className="text-sm font-bold text-white">Episode {episodeNumber}</p>
              </div>
            </div>
            
            {/* Content overlay */}
            <div
              className={cn(
                'absolute bottom-0 left-0 right-0 p-6 transition-all duration-600 ease-out z-10',
                isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              )}
              style={{
                animation: isActive ? 'fadeUp 0.6s ease-out' : 'none',
              }}
            >
              <h3 className="text-2xl md:text-3xl max-w-[400px] font-extrabold mb-3 line-clamp-2 text-white drop-shadow-2xl leading-tight">
                {title}
              </h3>
              
              {timeUntilAiring > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-md border border-white/20 bg-black/50">
                    <span className="text-base font-bold text-white">
                      {days > 0 && `${days}d `}
                      {hours > 0 && `${hours}h `}
                      {minutes > 0 && `${minutes}m`}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-zinc-300 uppercase tracking-wide">
                    until airing
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </CarouselItem>
  )
}

