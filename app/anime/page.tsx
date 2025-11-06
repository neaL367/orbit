'use client'

import { Suspense, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAnimeList } from '@/hooks/use-anime-list'
import { AnimeCard, BackButton } from '@/features/shared'
import { AnimeFilters } from '@/features/anime-filters'
import {
  AnimeListLoading,
  AnimeListError,
  AnimeListEmpty,
  AnimeListLoadMore,
} from '@/features/anime-list'

type SortType = 'trending' | 'popular' | 'top-rated' | 'seasonal'

function getPageTitle(sort: SortType, season?: string, year?: string): string {
  switch (sort) {
    case 'trending':
      return 'Trending Now'
    case 'popular':
      return 'All Time Popular'
    case 'top-rated':
      return 'Top 100'
    case 'seasonal':
      if (season && year) {
        const capitalizedSeason = season.charAt(0).toUpperCase() + season.slice(1).toLowerCase()
        return `${capitalizedSeason} ${year} Anime`
      }
      return 'Seasonal Anime'
    default:
      return 'Anime'
  }
}

function AnimeListContent() {
  const searchParams = useSearchParams()
  const sort = (searchParams.get('sort') || 'trending') as SortType
  const season = searchParams.get('season') || undefined
  const year = searchParams.get('year') || undefined

  const {
    animeList,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    showRank,
    perPage,
  } = useAnimeList()

  const title = useMemo(
    () => getPageTitle(sort, season, year),
    [sort, season, year]
  )

  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16" style={{ maxWidth: '1680px' }}>
        <div className="mb-8">
          <BackButton className="mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{title}</h1>
          <p className="text-zinc-400 mb-6">
            {animeList.length > 0 && `${animeList.length} anime loaded`}
          </p>
          <AnimeFilters />
        </div>

        {isLoading && animeList.length === 0 && (
          <AnimeListLoading count={perPage} />
        )}

        {error && <AnimeListError onRetry={() => refetch()} />}

        {animeList.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
              {animeList.map((anime, index) => {
                if (!anime) return null
                const rank = showRank ? index + 1 : undefined
                return <AnimeCard key={anime.id} anime={anime} rank={rank} />
              })}
            </div>

            <AnimeListLoadMore
              onLoadMore={handleLoadMore}
              isLoading={isFetchingNextPage}
              hasMore={hasNextPage}
            />
          </>
        )}

        {!isLoading && !error && animeList.length === 0 && <AnimeListEmpty />}
      </div>
    </div>
  )
}

export default function AnimeListPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16" style={{ maxWidth: '1680px' }}>
            <AnimeListLoading count={24} />
          </div>
        </div>
      }
    >
      <AnimeListContent />
    </Suspense>
  )
}

