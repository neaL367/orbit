"use client"

import { CACHE_TIMES } from "@/lib/constants"
import { useGraphQL } from "@/lib/graphql/hooks"
import { UpcomingAiringAnimeQuery } from "@/lib/graphql/queries"
import { extractMediaList } from "@/lib/anime-utils"
import { CarouselView } from "./carousel-view"

type UpcomingAiringCarouselProps = {
  className?: string
}

export function UpcomingAiringCarouselClient({
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
      className={className}
      error={error}
      isLoading={isLoading}
      onRetryAction={() => refetch()}
    />
  )
}

