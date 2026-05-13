import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { CACHE_TIMES } from '@/lib/constants'
import { getCurrentSeason, getCurrentYear } from '@/lib/utils'
import {
  Media,
  type TrendingAnimeQuery,
  type PopularAnimeQuery,
  type TopRatedAnimeQuery,
  type SeasonalAnimeQuery,
  type SearchAnimeQuery,
} from '@/lib/graphql/types/graphql'
import {
  PER_PAGE,
  type PageParam,
  getQueryConfig,
  parseDiscoveryFilters,
  getDiscoveryVariables
} from '@/features/anime/utils/discovery'

type DiscoveryListPage =
  | TrendingAnimeQuery
  | PopularAnimeQuery
  | TopRatedAnimeQuery
  | SeasonalAnimeQuery
  | SearchAnimeQuery

function getNextPageParam(lastPage: DiscoveryListPage): PageParam | undefined {
  const pageInfo = lastPage.Page?.pageInfo
  if (pageInfo?.hasNextPage) {
    return { page: (pageInfo.currentPage ?? 0) + 1 }
  }
  return undefined
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

  const filters = useMemo(() => parseDiscoveryFilters(searchParams), [searchParams])

  const variables = useMemo(() => getDiscoveryVariables(filters, dateValues as any), [filters, dateValues])

  const enabled = filters.sort !== 'search' || Boolean(filters.search?.trim())

  const { queryKey, fetcher } = getQueryConfig(filters.sort, variables)

  const query = useInfiniteQuery({
    queryKey,
    enabled,
    initialPageParam: { page: 1 } satisfies PageParam,
    staleTime: CACHE_TIMES.MEDIUM,
    retry: 2,
    getNextPageParam: (lastPage: DiscoveryListPage) => getNextPageParam(lastPage),
    queryFn: async ({ pageParam }) => {
      const page = (pageParam as PageParam).page
      const withPage = { ...variables, page }
      return fetcher(withPage as any)() as Promise<DiscoveryListPage>
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
