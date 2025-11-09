'use client'

import { notFound } from 'next/navigation'
import { Suspense, use } from 'react'
import { CACHE_TIMES } from '@/lib/constants'
import { DetailView } from './view'
import { Loading } from './loading'
import { Error } from './error'
import { useGraphQL } from '@/services/graphql/hooks'
import { AnimeByIdQuery } from '@/services/graphql/queries/anime-by-id'
import type { Media } from '@/lib/graphql/types/graphql'

function AnimeDetailContent({ params }: { params: Promise<{ animeId: string }> }) {
  const { animeId: animeIdParam } = use(params)
  const animeId = parseInt(animeIdParam, 10)

  if (isNaN(animeId)) {
    notFound()
  }

  const { data, isLoading, error, refetch } = useGraphQL(
    AnimeByIdQuery,
    { id: animeId },
    {
      staleTime: CACHE_TIMES.LONG, // 10 minutes - detail pages don't change often
      retry: 2
    }
  )

  if (isLoading) {
    return <Loading />
  }

  const mediaData = data as { Media?: Media } | undefined
  const anime = mediaData?.Media

  if (error || !anime) {
    return <Error onRetry={() => refetch()} />
  }

  return <DetailView data={anime} />
}

export function AnimeDetail({ params }: { params: Promise<{ animeId: string }> }) {
  return (
    <Suspense>
      <AnimeDetailContent params={params} />
    </Suspense>
  )
}

