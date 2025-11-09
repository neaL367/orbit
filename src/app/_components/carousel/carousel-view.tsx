"use client"

import { useState, useEffect } from "react"
import type { Route } from "next"
import { cn } from "@/lib/utils"
import Autoplay from "embla-carousel-autoplay"
import { Carousel, CarouselContent, type CarouselApi } from "@/components/ui/carousel"
import { ErrorState, SectionHeader } from "@/components/ui/shared"
import { UpcomingAiringCarouselItem } from "./carousel-item"
import type { Media } from "@/lib/graphql/types/graphql"

type CarouselViewProps = {
  data: Media[]
  hideViewAll?: boolean
  className?: string
  error?: Error | null
  isLoading?: boolean
  onRetry?: () => void
}

export function CarouselView({
  data,
  hideViewAll = false,
  className,
  error,
  isLoading = false,
  onRetry,
}: CarouselViewProps) {
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

  const animeList = data.filter((anime) => anime.nextAiringEpisode)

  return (
    <div className={cn("w-full", className)}>
      {/* SectionHeader - Always Visible */}
      <SectionHeader
        title="Upcoming Airing"
        subtitle="Anime episodes coming soon"
        viewAllHref={hideViewAll ? undefined : ("/schedule" as Route)}
      />

      {/* Content Section - Shows loading, error, or carousel */}
      {error ? (
        <ErrorState
          message="Error loading upcoming anime"
          onRetry={onRetry}
          className="bg-zinc-900 rounded-xl"
        />
      ) : isLoading ? (
        <div className="h-[400px] bg-zinc-900 rounded-xl animate-pulse" />
      ) : animeList.length === 0 ? (
        null
      ) : (
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 10000,
              stopOnInteraction: false,
              stopOnMouseEnter: false,
            }),
          ]}
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
      )}
    </div>
  )
}

