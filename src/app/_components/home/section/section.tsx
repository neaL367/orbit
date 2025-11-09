"use client"

import { useGraphQL } from '@/services/graphql/hooks'
import { CACHE_TIMES } from '@/lib/constants'
import { extractMediaList } from '@/lib/anime-utils'
import { SectionView } from './section-view'
import type { MediaSeason, TypedDocumentString } from '@/lib/graphql/types/graphql'

type AnimeSectionProps = {
  title: string
  query: TypedDocumentString<unknown, { page?: number; perPage?: number; season?: MediaSeason; seasonYear?: number }>
  variables?: { page?: number; perPage?: number; season?: MediaSeason; seasonYear?: number }
  viewAllHref?: string
  showRank?: boolean
}

export function AnimeSection({ title, query, variables, viewAllHref, showRank = false }: AnimeSectionProps) {
  const { data, isLoading, error, refetch } = useGraphQL(
    query, 
    variables || { page: 1, perPage: 5 },
    {
      staleTime: CACHE_TIMES.MEDIUM, // 5 minutes - home page sections update frequently
      retry: 2
    }
  )

  const animeList = extractMediaList(data)
  const page = variables?.page || 1
  const perPage = variables?.perPage || 5

  return (
    <SectionView
      data={animeList}
      title={title}
      viewAllHref={viewAllHref}
      showRank={showRank}
      page={page}
      perPage={perPage}
      isLoading={isLoading}
      error={error}
      onRetry={() => refetch()}
    />
  )
}

