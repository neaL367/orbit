import {
  MediaSeason,
  MediaFormat,
  MediaStatus,
  useTrendingAnimeQuery,
  useInfiniteTrendingAnimeQuery,
  usePopularAnimeQuery,
  useInfinitePopularAnimeQuery,
  useTopRatedAnimeQuery,
  useInfiniteTopRatedAnimeQuery,
  useSeasonalAnimeQuery,
  useInfiniteSeasonalAnimeQuery,
  useSearchAnimeQuery,
  useInfiniteSearchAnimeQuery,
} from '@/lib/graphql/types/graphql'

export type SortType = 'trending' | 'popular' | 'top-rated' | 'seasonal' | 'search'

export const PER_PAGE = 24

export type PageParam = { page: number }

export function getQueryConfig(sort: SortType, variables: Record<string, unknown>) {
  switch (sort) {
    case 'trending':
      return {
        queryKey: useInfiniteTrendingAnimeQuery.getKey(variables as any),
        fetcher: useTrendingAnimeQuery.fetcher,
      }
    case 'popular':
      return {
        queryKey: useInfinitePopularAnimeQuery.getKey(variables as any),
        fetcher: usePopularAnimeQuery.fetcher,
      }
    case 'top-rated':
      return {
        queryKey: useInfiniteTopRatedAnimeQuery.getKey(variables as any),
        fetcher: useTopRatedAnimeQuery.fetcher,
      }
    case 'seasonal':
      return {
        queryKey: useInfiniteSeasonalAnimeQuery.getKey(variables as any),
        fetcher: useSeasonalAnimeQuery.fetcher,
      }
    case 'search':
      return {
        queryKey: useInfiniteSearchAnimeQuery.getKey(variables as any),
        fetcher: useSearchAnimeQuery.fetcher,
      }
    default:
      return {
        queryKey: useInfiniteTrendingAnimeQuery.getKey(variables as any),
        fetcher: useTrendingAnimeQuery.fetcher,
      }
  }
}

export function parseDiscoveryFilters(searchParams: URLSearchParams | Record<string, string | string[] | undefined>) {
  const getParam = (key: string) => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key)
    }
    const val = searchParams[key]
    return typeof val === 'string' ? val : undefined
  }

  const search = getParam('search') || ''
  const sort = (search ? 'search' : (getParam('sort') || 'trending')) as SortType
  const season = getParam('season') as MediaSeason | null
  const year = getParam('year') ? parseInt(getParam('year')!, 10) : null
  const genres = getParam('genres')?.split(',').filter(Boolean) || []
  const format = getParam('format') as MediaFormat | null
  const status = getParam('status') as MediaStatus | null

  return { sort, search, season, year, genres, format, status }
}

export function getDiscoveryVariables(
  filters: ReturnType<typeof parseDiscoveryFilters>, 
  dateValues: { currentSeason: string | MediaSeason; currentYear: number }
) {
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
}
