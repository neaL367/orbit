import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { CACHE_TIMES } from '@/lib/constants'
import {
  getCurrentSeason,
  getCurrentYear,
} from '@/lib/utils'
import {
  useInfiniteTrendingAnimeQuery,
  useInfinitePopularAnimeQuery,
  useInfiniteTopRatedAnimeQuery,
  useInfiniteSeasonalAnimeQuery,
  useInfiniteSearchAnimeQuery,
  MediaSeason,
  MediaFormat,
  MediaStatus,
  Media,
} from '@/lib/graphql/types/graphql'

type SortType = 'trending' | 'popular' | 'top-rated' | 'seasonal' | 'search'

const PER_PAGE = 24

/**
 * Custom hook for anime list page
 */
export function useAnimeList() {
  const searchParams = useSearchParams()

  const dateValues = useMemo(() => ({
    currentSeason: getCurrentSeason(),
    currentYear: getCurrentYear(),
  }), [])

  // Parse filters
  const filters = useMemo(() => {
    const search = searchParams.get('search') || ''
    const sort = search ? 'search' : (searchParams.get('sort') || 'trending') as SortType
    const season = searchParams.get('season') as MediaSeason | null
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : null
    const genres = searchParams.get('genres')?.split(',').filter(Boolean) || []
    const format = searchParams.get('format') as MediaFormat | null
    const status = searchParams.get('status') as MediaStatus | null

    return { sort, search, season, year, genres, format, status }
  }, [searchParams])

  // Build variables
  const variables = useMemo(() => {
    const genresArray = filters.genres.length > 0 ? filters.genres : undefined
    const base = {
      perPage: PER_PAGE,
      genres: genresArray,
      format: filters.format || undefined,
      status: filters.status || undefined,
    }

    if (filters.sort === 'seasonal') {
      return {
        ...base,
        season: (filters.season || dateValues.currentSeason) as MediaSeason,
        seasonYear: filters.year || dateValues.currentYear,
      }
    }

    if (filters.sort === 'search') {
      return {
        ...base,
        search: filters.search || undefined,
      }
    }

    return {
      ...base,
      season: filters.season || undefined,
      seasonYear: filters.year || undefined,
    }
  }, [filters, dateValues])

  // React Query Options
  const queryOptions = {
    staleTime: CACHE_TIMES.MEDIUM,
    retry: 2,
    initialPageParam: { page: 1 },
    getNextPageParam: (lastPage: any) => {
      const pageInfo = lastPage?.Page?.pageInfo
      if (pageInfo?.hasNextPage) {
        return { page: (pageInfo.currentPage || 0) + 1 }
      }
      return undefined
    }
  }

  // Active Hook Selection
  const trending = useInfiniteTrendingAnimeQuery(variables, { ...queryOptions, enabled: filters.sort === 'trending' })
  const popular = useInfinitePopularAnimeQuery(variables, { ...queryOptions, enabled: filters.sort === 'popular' })
  const topRated = useInfiniteTopRatedAnimeQuery(variables, { ...queryOptions, enabled: filters.sort === 'top-rated' })
  const seasonal = useInfiniteSeasonalAnimeQuery(variables as any, { ...queryOptions, enabled: filters.sort === 'seasonal' })
  const search = useInfiniteSearchAnimeQuery(variables as any, { ...queryOptions, enabled: filters.sort === 'search' && !!filters.search })

  const activeQuery = useMemo(() => {
    switch (filters.sort) {
      case 'trending': return trending
      case 'popular': return popular
      case 'top-rated': return topRated
      case 'seasonal': return seasonal
      case 'search': return search
      default: return trending
    }
  }, [filters.sort, trending, popular, topRated, seasonal, search])

  // Process data
  const animeList = useMemo(() => {
    const pages = activeQuery.data?.pages || []
    const mediaMap = new Map<number, Media>()

    pages.forEach((page: any) => {
      const media = page?.Page?.media?.filter(
        (anime: any): anime is Media => !!anime && !anime.isAdult
      ) || []
      media.forEach((anime: any) => {
        if (!mediaMap.has(anime.id)) mediaMap.set(anime.id, anime)
      })
    })

    return Array.from(mediaMap.values())
  }, [activeQuery.data])

  return {
    ...activeQuery,
    animeList,
    showRank: filters.sort === 'top-rated',
    perPage: PER_PAGE,
    dateValues,
    filters,
  }
}

