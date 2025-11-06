'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import { Card } from '@/components/ui/card'
import { useGraphQL } from '@/hooks/use-graphql'
import { UpcomingAiringAnimeQuery } from '@/queries/media'
import { cn } from '@/lib/utils'
import type { Media } from '@/graphql/graphql'

export function UpcomingAiringCarousel() {
  const { data, isLoading, error, refetch } = useGraphQL(
    UpcomingAiringAnimeQuery, 
    { page: 1, perPage: 10 },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes - carousel updates frequently
      retry: 3
    }
  )
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  const handleImageLoad = (id: number) => {
    setLoadedImages((prev) => new Set(prev).add(id))
  }

  useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap())

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap())
    }

    api.on('select', handleSelect)
    return () => {
      api.off('select', handleSelect)
    }
  }, [api])

  if (isLoading) {
    return (
      <div className="w-full mb-12">
        <div className="h-96 bg-zinc-900 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Upcoming Airing</h2>
            <p className="text-zinc-400 text-sm">Anime episodes coming soon</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 py-12 bg-zinc-900 rounded-xl">
          <p className="text-red-400">Error loading upcoming anime</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const pageData = data as { Page?: { media?: Array<Media | null> } } | undefined
  const animeList = pageData?.Page?.media?.filter(
    (anime: Media | null) => anime && !anime.isAdult && anime.nextAiringEpisode
  ) || []

  if (animeList.length === 0) {
    return null
  }

  const autoplayPlugin = Autoplay({
    delay: 10000,
    stopOnInteraction: false,
    stopOnMouseEnter: false,
  })

  return (
    <div className="w-full mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Upcoming Airing</h2>
          <p className="text-zinc-400 text-sm">Anime episodes coming soon</p>
        </div>
      </div>
      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[autoplayPlugin]}
        className="w-full"
      >
        <CarouselContent className="ml-0 ">
          {animeList.map((anime, index) => {
            if (!anime) return null

            const title = anime.title?.userPreferred || anime.title?.romaji || anime.title?.english || 'Unknown'
            const bannerImage = anime.bannerImage || anime.coverImage?.extraLarge || anime.coverImage?.large
            const coverColor = anime.coverImage?.color || '#1a1a1a'
            const nextEpisode = anime.nextAiringEpisode
            const timeUntilAiring = nextEpisode?.timeUntilAiring || 0
            const episodeNumber = nextEpisode?.episode || 0

            // Calculate time until airing
            const days = Math.floor(timeUntilAiring / 86400)
            const hours = Math.floor((timeUntilAiring % 86400) / 3600)
            const minutes = Math.floor((timeUntilAiring % 3600) / 60)

            const isActive = current === index

            return (
              <CarouselItem key={anime.id} className="pl-0 basis-full ">
                <Link href={`/anime/${anime.id}`}>
                  <Card className="group relative overflow-hidden border-0 bg-zinc-900 hover:bg-zinc-800 transition-colors">
                    <div className="relative aspect-video h-[300px] w-full overflow-hidden">
                      {bannerImage ? (
                        <Image
                          src={bannerImage}
                          alt={title}
                          fill
                          sizes="100vw"
                          loading="eager"
                          referrerPolicy="no-referrer"
                          onLoad={() => handleImageLoad(anime.id)}
                          className={cn(
                            "object-cover transition-all duration-700 ease-in-out group-hover:scale-110",
                            loadedImages.has(anime.id) ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-lg"
                          )}
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: coverColor }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
                      <div className="absolute top-4 right-4 z-10">
                        <div className="px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 bg-black/60 shadow-lg">
                          <p className="text-sm font-bold text-white">Episode {episodeNumber}</p>
                        </div>
                      </div>
                      <div 
                        className={cn(
                          "absolute bottom-0 left-0 right-0 p-6 transition-all duration-600 ease-out z-10",
                          isActive 
                            ? "translate-y-0 opacity-100" 
                            : "translate-y-4 opacity-0"
                        )}
                        style={{
                          animation: isActive ? 'fadeUp 0.6s ease-out' : 'none'
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
          })}
        </CarouselContent>
      </Carousel>
      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

