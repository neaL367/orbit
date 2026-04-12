import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { CACHE_TIMES } from '@/lib/constants'
import { getCurrentSeason, getCurrentYear } from '@/lib/utils'
import { fetcher } from '@/lib/graphql/fetcher'
import {
  TrendingAnimeDocument,
  PopularAnimeDocument,
  TopRatedAnimeDocument,
  SeasonalAnimeDocument,
  SearchAnimeDocument,
  MediaSeason,
  MediaFormat,
  MediaStatus,
  Media,
  type TrendingAnimeQuery,
  type PopularAnimeQuery,
  type TopRatedAnimeQuery,
  type SeasonalAnimeQuery,
  type SearchAnimeQuery,
} from '@/lib/graphql/types/graphql'

type SortType = 'trending' | 'popular' | 'top-rated' | 'seasonal' | 'search'

const PER_PAGE = 24

type DiscoveryListPage =
  | TrendingAnimeQuery
  | PopularAnimeQuery
  | TopRatedAnimeQuery
  | SeasonalAnimeQuery
  | SearchAnimeQuery

type PageParam = { page: number }

function getNextPageParam(lastPage: DiscoveryListPage): PageParam | undefined {
  const pageInfo = lastPage.Page?.pageInfo
  if (pageInfo?.hasNextPage) {
    return { page: (pageInfo.currentPage ?? 0) + 1 }
  }
  return undefined
}

function fetchDiscoveryPage(
  sort: SortType,
  variables: Record<string, unknown>,
  page: number
): Promise<DiscoveryListPage> {
  const withPage = { ...variables, page }
  switch (sort) {
    case 'trending':
      return fetcher(TrendingAnimeDocument, withPage)() as Promise<DiscoveryListPage>
    case 'popular':
      return fetcher(PopularAnimeDocument, withPage)() as Promise<DiscoveryListPage>
    case 'top-rated':
      return fetcher(TopRatedAnimeDocument, withPage)() as Promise<DiscoveryListPage>
    case 'seasonal':
      return fetcher(SeasonalAnimeDocument, withPage)() as Promise<DiscoveryListPage>
    case 'search':
      return fetcher(SearchAnimeDocument, withPage)() as Promise<DiscoveryListPage>
    default:
      return fetcher(TrendingAnimeDocument, withPage)() as Promise<DiscoveryListPage>
  }
}

/**
 * Discovery grid: single infinite query keyed by sort + variables (no parallel hook fan-out).
 */
export function useAnimeList() {
  const searchParams = useSearchParams()

  const dateValues = useMemo(
    () => ({
      currentSeason: getCurrentSeason(),
      currentYear: getCurrentYear(),
    }),
    []
  )

  const filters = useMemo(() => {
    const search = searchParams.get('search') || ''
    const sort = (search ? 'search' : (searchParams.get('sort') || 'trending')) as SortType
    const season = searchParams.get('season') as MediaSeason | null
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : null
    const genres = searchParams.get('genres')?.split(',').filter(Boolean) || []
    const format = searchParams.get('format') as MediaFormat | null
    const status = searchParams.get('status') as MediaStatus | null

    return { sort, search, season, year, genres, format, status }
  }, [searchParams])

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

  const enabled = filters.sort !== 'search' || Boolean(filters.search?.trim())

  const query = useInfiniteQuery({
    queryKey: ['discovery-anime-list', filters.sort, variables] as const,
    enabled,
    initialPageParam: { page: 1 } satisfies PageParam,
    staleTime: CACHE_TIMES.MEDIUM,
    retry: 2,
    getNextPageParam: (lastPage: DiscoveryListPage) => getNextPageParam(lastPage),
    queryFn: async ({ pageParam }) => {
      const page = (pageParam as PageParam).page
      return fetchDiscoveryPage(filters.sort, variables, page)
    },
  })

  const animeList = useMemo(() => {
    const pages = query.data?.pages ?? []
    const mediaMap = new Map<number, Media>()

    for (const page of pages) {
      // API requests already exclude adult titles; list types may omit `isAdult` on selections.
      for (const anime of page.Page?.media ?? []) {
        if (anime == null) continue
        if (!mediaMap.has(anime.id)) mediaMap.set(anime.id, anime as Media)
      }
    }

    return Array.from(mediaMap.values())
  }, [query.data])

  return {
    ...query,
    animeList,
    showRank: filters.sort === 'top-rated',
    perPage: PER_PAGE,
    dateValues,
    filters,
    dataUpdatedAt: query.dataUpdatedAt,
  }
}
