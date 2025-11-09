"use client"

import { CACHE_TIMES } from "@/lib/constants"
import { useGraphQL } from "@/services/graphql/hooks"
import { UpcomingAiringAnimeQuery } from "@/services/graphql/queries"
import { extractMediaList } from "@/lib/anime-utils"
import { CarouselView } from "./carousel-view"

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
      retry: 2,
    },
  )

  const allMedia = extractMediaList(data)

  return (
    <CarouselView
      data={allMedia}
      hideViewAll={hideViewAll}
      className={className}
      error={error}
      isLoading={isLoading}
      onRetry={() => refetch()}
    />
  )
}

