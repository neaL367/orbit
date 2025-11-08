"use client"

import { CACHE_TIMES } from "@/lib/constants"
import { useGraphQL } from "@/hooks/use-graphql"
import { UpcomingAiringAnimeQuery } from "@/queries/media"
import { extractMediaList } from "@/features/shared"
import { UpcomingAiringCarouselView } from "./upcoming-airing-carousel-view"

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
    <UpcomingAiringCarouselView
      data={allMedia}
      hideViewAll={hideViewAll}
      className={className}
      error={error}
      isLoading={isLoading}
      onRetry={() => refetch()}
    />
  )
}

