'use client'

import { useState, useEffect } from 'react'
import { CACHE_TIMES } from '@/lib/constants'
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselContent,
  type CarouselApi,
} from '@/components/ui/carousel'
import { useGraphQL } from '@/hooks/use-graphql'
import { UpcomingAiringAnimeQuery } from '@/queries/media'
import { ErrorState, SectionHeader, extractMediaList } from '@/features/shared'
import { UpcomingAiringCarouselItem } from './carousel-item'

export function UpcomingAiringCarousel() {
  const { data, isLoading, error, refetch } = useGraphQL(
    UpcomingAiringAnimeQuery, 
    { page: 1, perPage: 10 },
    {
      staleTime: CACHE_TIMES.MEDIUM, // 5 minutes - carousel updates frequently
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

  const allMedia = extractMediaList(data)
  const animeList = allMedia.filter((anime) => anime.nextAiringEpisode)

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
        <SectionHeader
          title="Upcoming Airing"
          subtitle="Anime episodes coming soon"
        />
        <ErrorState
          message="Error loading upcoming anime"
          onRetry={() => refetch()}
          className="bg-zinc-900 rounded-xl"
        />
      </div>
    )
  }

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
      <SectionHeader
        title="Upcoming Airing"
        subtitle="Anime episodes coming soon"
      />
      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[autoplayPlugin]}
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {animeList.map((anime, index) => {
            if (!anime) return null
            return (
              <UpcomingAiringCarouselItem
                key={anime.id}
                anime={anime}
                index={index}
                current={current}
                onImageLoad={handleImageLoad}
                loadedImages={loadedImages}
              />
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

