'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Card } from '@/components/ui/card'
import { useGraphQL } from '@/hooks/use-graphql'
import { UpcomingAiringAnimeQuery } from '@/queries/media'
import { cn } from '@/lib/utils'
import type { Media } from '@/graphql/graphql'

export function UpcomingAiringCarousel() {
  const { data, isLoading, error } = useGraphQL(UpcomingAiringAnimeQuery, { page: 1, perPage: 10 })
  const [isLoaded, setIsLoaded] = useState(false)

  if (isLoading) {
    return (
      <div className="w-full mb-12">
        <div className="h-96 bg-zinc-900 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return null
  }

  const pageData = data as { Page?: { media?: Array<Media | null> } } | undefined
  const animeList = pageData?.Page?.media?.filter(
    (anime: Media | null) => anime && !anime.isAdult && anime.nextAiringEpisode
  ) || []

  if (animeList.length === 0) {
    return null
  }

  return (
    <div className="w-full mb-12">
      <div className="flex items-center justify-between mb-6 px-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Upcoming Airing</h2>
          <p className="text-zinc-400 text-sm">Anime episodes coming soon</p>
        </div>
      </div>
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {animeList.map((anime) => {
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

            return (
              <CarouselItem key={anime.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                <Link href={`/anime/${anime.id}`}>
                  <Card className="group relative overflow-hidden border-0 bg-zinc-900 hover:bg-zinc-800 transition-colors">
                    <div className="relative aspect-video w-full overflow-hidden">
                      {bannerImage ? (
                        <Image
                          src={bannerImage}
                          alt={title}
                          fill
                          sizes="50vw"
                          onLoadingComplete={() => setIsLoaded(true)}
                          className={cn(`object-cover transition-all duration-700 ease-in-out not-first:${isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-lg"} group-hover:scale-110`)}
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: coverColor }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <div className="px-3 py-1.5 rounded-lg backdrop-blur-md border bg-black/40">
                          <p className="text-xs font-semibold text-white">Episode {episodeNumber}</p>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold mb-2 line-clamp-2">{title}</h3>
                        {timeUntilAiring > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-zinc-300">
                              {days > 0 && `${days}d `}
                              {hours > 0 && `${hours}h `}
                              {minutes > 0 && `${minutes}m`}
                            </span>
                            <span className="text-zinc-400">until airing</span>
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
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  )
}

