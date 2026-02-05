"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import Autoplay from "embla-carousel-autoplay"
import { Carousel, CarouselContent, type CarouselApi } from "@/components/ui/carousel"
import { ErrorState } from "@/components/shared"
import { AnimexSectionHeader } from "@/components/shared/animex-primitives"
import { AnimexSkeleton } from "@/components/shared/animex-skeletons"
import { UpcomingAiringCarouselItem } from "./carousel-item"
import type { Media } from "@/lib/graphql/types/graphql"

type CarouselViewProps = {
  data: Media[]
  className?: string
  error?: Error | null
  isLoading?: boolean
  onRetryAction?: () => void
}

export function CarouselView({
  data,
  className,
  error,
  isLoading = false,
  onRetryAction,
}: CarouselViewProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

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
      <AnimexSectionHeader
        title="Upcoming"
        subtitle="Airing soon"
      />

      {error ? (
        <ErrorState
          message="System offline"
          onRetry={onRetryAction}
          className="bg-zinc-950 p-12 border-subtle"
        />
      ) : isLoading ? (
        <AnimexSkeleton className="h-[400px] w-full" />
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
              delay: 8000,
              stopOnInteraction: false,
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
                />
              )
            })}
          </CarouselContent>
        </Carousel>
      )}
    </div>
  )
}
