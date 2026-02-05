import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useInfiniteGraphQL } from '@/lib/graphql/hooks'
import { CACHE_TIMES } from '@/lib/constants'
import { TrendingAnimeQuery } from '@/lib/graphql/queries/trending-anime'
import { PopularAnimeQuery } from '@/lib/graphql/queries/popular-anime'
import { TopRatedAnimeQuery } from '@/lib/graphql/queries/top-rated-anime'
import { SeasonalAnimeQuery } from '@/lib/graphql/queries/seasonal-anime'
import { SearchAnimeQuery } from '@/lib/graphql/queries/search-anime'
import {
  getCurrentSeason,
  getCurrentYear,
} from '@/lib/utils'
import type { Media, MediaFormat, MediaSeason, MediaStatus } from '@/lib/graphql/types/graphql'

type SortType = 'trending' | 'popular' | 'top-rated' | 'seasonal' | 'search'

const PER_PAGE = 24

/**
 * Parse search params into filter values
 */
function parseSearchParams(searchParams: URLSearchParams) {
  const search = searchParams.get('search') || ''
  const sort = search ? 'search' : (searchParams.get('sort') || 'trending') as SortType
  const season = searchParams.get('season') as MediaSeason | null
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : null
  const genres = searchParams.get('genres')?.split(',').filter(Boolean) || []
  const format = searchParams.get('format') as string | null
  const status = searchParams.get('status') as string | null

  return { sort, search, season, year, genres, format, status }
}

/**
 * Build GraphQL variables from filters
 */
function buildGraphQLVariables(
  filters: ReturnType<typeof parseSearchParams>,
  dateValues: { currentSeason: MediaSeason; currentYear: number }
) {
  const { search, season, year, genres, format, status } = filters

  const genresArray = genres.length > 0 ? genres : undefined
  const formatValue = format ? (format as MediaFormat) : undefined
  const statusValue = status ? (status as MediaStatus) : undefined
  const seasonValue = season ? (season as MediaSeason) : undefined
  const seasonYearValue = year || undefined
  const searchValue = search || undefined

  const regularVariables = {
    perPage: PER_PAGE,
    search: searchValue,
    genres: genresArray,
    format: formatValue,
    status: statusValue,
    season: seasonValue,
    seasonYear: seasonYearValue,
  }

  const seasonalVariables = {
    perPage: PER_PAGE,
    season: (season || dateValues.currentSeason) as MediaSeason,
    seasonYear: year || dateValues.currentYear,
    genres: genresArray,
    format: formatValue,
    status: statusValue,
  }

  const searchVariables = {
    perPage: PER_PAGE,
    search: searchValue,
    genres: genresArray,
    format: formatValue,
    status: statusValue,
  }

  return { regularVariables, seasonalVariables, searchVariables }
}

/**
 * Flatten and deduplicate anime list from infinite query pages
 */
function flattenAnimeList(pages: unknown[]): Media[] {
  const mediaMap = new Map<number, Media>()

  pages.forEach((page) => {
    const pageData = page as { Page?: { media?: Array<Media | null> } } | undefined
    const media = pageData?.Page?.media?.filter(
      (anime: Media | null): anime is Media => anime !== null && !anime.isAdult
    ) || []

    media.forEach((anime) => {
      if (!mediaMap.has(anime.id)) {
        mediaMap.set(anime.id, anime)
      }
    })
  })

  return Array.from(mediaMap.values())
}

/**
 * Custom hook for anime list page
 */
export function useAnimeList() {
  const searchParams = useSearchParams()
  const filters = useMemo(() => parseSearchParams(searchParams), [searchParams])

  const dateValues = useMemo(() => ({
    currentSeason: getCurrentSeason(),
    currentYear: getCurrentYear(),
  }), [])

  const { regularVariables, seasonalVariables, searchVariables } = useMemo(
    () => buildGraphQLVariables(filters, dateValues),
    [filters, dateValues]
  )

  const queryOptions = {
    enabled: true,
    staleTime: CACHE_TIMES.MEDIUM,
    retry: 2,
  }

  const trendingData = useInfiniteGraphQL(
    TrendingAnimeQuery,
    regularVariables,
    { ...queryOptions, enabled: filters.sort === 'trending' }
  )

  const popularData = useInfiniteGraphQL(
    PopularAnimeQuery,
    regularVariables,
    { ...queryOptions, enabled: filters.sort === 'popular' }
  )

  const topRatedData = useInfiniteGraphQL(
    TopRatedAnimeQuery,
    regularVariables,
    { ...queryOptions, enabled: filters.sort === 'top-rated' }
  )

  const seasonalData = useInfiniteGraphQL(
    SeasonalAnimeQuery,
    seasonalVariables,
    { ...queryOptions, enabled: filters.sort === 'seasonal' }
  )

  const searchData = useInfiniteGraphQL(
    SearchAnimeQuery,
    searchVariables,
    { ...queryOptions, enabled: filters.sort === 'search' && !!filters.search }
  )

  const activeQuery = useMemo(() => {
    switch (filters.sort) {
      case 'trending':
        return trendingData
      case 'popular':
        return popularData
      case 'top-rated':
        return topRatedData
      case 'seasonal':
        return seasonalData
      case 'search':
        return searchData
      default:
        return trendingData
    }
  }, [filters.sort, trendingData, popularData, topRatedData, seasonalData, searchData])

  const animeList = useMemo(() => {
    const queryData = activeQuery.data as { pages?: unknown[] } | undefined
    if (!queryData?.pages) return []
    return flattenAnimeList(queryData.pages)
  }, [activeQuery.data])

  return {
    ...activeQuery,
    animeList,
    showRank: filters.sort === 'top-rated',
    perPage: PER_PAGE,
  }
}

