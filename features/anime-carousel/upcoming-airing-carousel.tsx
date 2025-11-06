"use client"

import { useState, useEffect } from "react"
import type { Route } from "next"
import { CACHE_TIMES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import Autoplay from "embla-carousel-autoplay"
import { Carousel, CarouselContent, type CarouselApi } from "@/components/ui/carousel"
import { useGraphQL } from "@/hooks/use-graphql"
import { UpcomingAiringAnimeQuery } from "@/queries/media"
import { ErrorState, SectionHeader, extractMediaList } from "@/features/shared"
import { UpcomingAiringCarouselItem } from "./carousel-item"

type UpcomingAiringCarouselProps = {
  hideViewAll?: boolean
  className?: string
}

export function UpcomingAiringCarousel({
  hideViewAll = false,
  className,
}: UpcomingAiringCarouselProps) {
  const { data, isLoading, error, refetch } = useGraphQL(
    UpcomingAiringAnimeQuery,
    { page: 1, perPage: 10 },
    {
      staleTime: CACHE_TIMES.MEDIUM,
      retry: 3,
    },
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

    api.on("select", handleSelect)
    return () => {
      api.off("select", handleSelect)
    }
  }, [api])

  const allMedia = extractMediaList(data)
  const animeList = allMedia.filter((anime) => anime.nextAiringEpisode)

  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="h-12 mb-8 animate-pulse bg-zinc-900 rounded-xl" />
        <div className="h-[400px] bg-zinc-900 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("w-full", className)}>
        <SectionHeader
          title="Upcoming Airing"
          subtitle="Anime episodes coming soon"
          viewAllHref={hideViewAll ? undefined : ("/schedule" as Route)}
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
    <div className={cn("w-full", className)}>
      <SectionHeader
        title="Upcoming Airing"
        subtitle="Anime episodes coming soon"
        viewAllHref={hideViewAll ? undefined : ("/schedule" as Route)}
      />
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
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
    </div>
  )
}
