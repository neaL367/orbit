'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useCallback } from 'react'
import { useInfiniteGraphQL } from '@/hooks/use-infinite-graphql'
import { AnimeCard } from '@/features/shared/anime-card'
import { BackButton } from '@/features/shared/back-button'
import { AnimeFilters } from '@/features/anime-filters/anime-filters'
import {
  TrendingAnimeQuery,
  PopularAnimeQuery,
  TopRatedAnimeQuery,
  SeasonalAnimeQuery,
} from '@/queries/media'
import {
  getCurrentSeason,
  getCurrentYear,
  getNextSeason,
  getNextSeasonYear,
} from '@/hooks/use-date'
import type { Media, MediaFormat, MediaSeason, MediaStatus } from '@/graphql/graphql'

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
        return `${season.charAt(0).toUpperCase() + season.slice(1).toLowerCase()} ${year} Anime`
      }
      return 'Seasonal Anime'
    default:
      return 'Anime'
  }
}

export default function AnimeListPage() {
  const searchParams = useSearchParams()
  const sort = (searchParams.get('sort') || 'trending') as SortType
  const perPage = 24
  const season = searchParams.get('season') as MediaSeason | null
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : null
  const genres = searchParams.get('genres')?.split(',').filter(Boolean) || []
  const format = searchParams.get('format') as string | null
  const status = searchParams.get('status') as string | null

  const dateValues = useMemo(() => ({
    currentSeason: getCurrentSeason(),
    currentYear: getCurrentYear(),
    nextSeason: getNextSeason(),
    nextSeasonYear: getNextSeasonYear(),
  }), [])

  // Determine query type and showRank
  const showRank = sort === 'top-rated'

  // Build filter variables
  const genresArray = genres.length > 0 ? genres : undefined
  const formatValue = format ? (format as MediaFormat) : undefined
  const statusValue = status ? (status as MediaStatus) : undefined
  const seasonValue = season ? (season as MediaSeason) : undefined
  const seasonYearValue = year || undefined

  // Handle seasonal query separately due to different variable types
  const seasonalBaseVariables = useMemo(() => ({
    perPage,
    season: (season || dateValues.currentSeason) as MediaSeason,
    seasonYear: year || dateValues.currentYear,
    genres: genresArray,
    format: formatValue,
    status: statusValue,
  }), [perPage, season, year, dateValues, genresArray, formatValue, statusValue])

  const regularBaseVariables = useMemo(() => ({
    perPage,
    genres: genresArray,
    format: formatValue,
    status: statusValue,
    season: seasonValue,
    seasonYear: seasonYearValue,
  }), [perPage, genresArray, formatValue, statusValue, seasonValue, seasonYearValue])

  // Call all hooks (required by React rules) but only use the active one
  const trendingData = useInfiniteGraphQL(TrendingAnimeQuery, regularBaseVariables)
  const popularData = useInfiniteGraphQL(PopularAnimeQuery, regularBaseVariables)
  const topRatedData = useInfiniteGraphQL(TopRatedAnimeQuery, regularBaseVariables)
  const seasonalData = useInfiniteGraphQL(SeasonalAnimeQuery, seasonalBaseVariables)

  // Select the appropriate data based on sort
  const infiniteQuery = useMemo(() => {
    switch (sort) {
      case 'trending':
        return trendingData
      case 'popular':
        return popularData
      case 'top-rated':
        return topRatedData
      case 'seasonal':
        return seasonalData
      default:
        return trendingData
    }
  }, [sort, trendingData, popularData, topRatedData, seasonalData])

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = infiniteQuery

  // Flatten all pages into a single array
  const animeList = useMemo(() => {
    if (!data?.pages) return []
    const allMedia: Media[] = []
    data.pages.forEach((page) => {
      const pageData = page as { Page?: { media?: Array<Media | null> } } | undefined
      const media = pageData?.Page?.media?.filter((anime: Media | null): anime is Media => anime !== null && !anime.isAdult) || []
      allMedia.push(...media)
    })
    return allMedia
  }, [data])

  const title = getPageTitle(sort, season || undefined, year?.toString())

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="mb-8">
          <BackButton className="mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{title}</h1>
          <p className="text-zinc-400 mb-6">
            {animeList.length > 0 && `${animeList.length} anime loaded`}
          </p>
          <AnimeFilters />
        </div>

        {isLoading && animeList.length === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(perPage)].map((_, i) => (
              <div key={i} className="aspect-2/3 bg-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <p className="text-red-400">Error loading anime. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {animeList.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
              {animeList.map((anime, index) => {
                if (!anime) return null
                const rank = showRank ? index + 1 : undefined
                return <AnimeCard key={anime.id} anime={anime} rank={rank} />
              })}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex items-center justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                  className="px-8 py-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFetchingNextPage ? 'Loading more...' : 'Load More'}
                </button>
              </div>
            )}

            {!hasNextPage && animeList.length > 0 && (
              <div className="text-center py-8 text-zinc-400">
                No more anime to load
              </div>
            )}
          </>
        )}

        {!isLoading && !error && animeList.length === 0 && (
          <div className="text-center py-12 text-zinc-400">
            No anime found.
          </div>
        )}
      </div>
    </div>
  )
}

