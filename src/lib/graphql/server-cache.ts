import { cache } from 'react'
import { executeGraphQL } from './server'
import { AnimeByIdQuery } from './queries/anime-by-id'
import { TrendingAnimeQuery, PopularAnimeQuery, SeasonalAnimeQuery, TopRatedAnimeQuery } from './queries'
import { MediaSeason } from './types/graphql'
import type {
    AnimeByIdQuery as AnimeByIdQueryType,
    TrendingAnimeQuery as TrendingAnimeQueryType,
    PopularAnimeQuery as PopularAnimeQueryType,
    SeasonalAnimeQuery as SeasonalAnimeQueryType,
    TopRatedAnimeQuery as TopRatedAnimeQueryType
} from './types/graphql'

/**
 * Cached data fetching for server components
 * Uses React.cache to deduplicate requests during a single render pass
 */

// Cache the anime details fetch to share between generateMetadata and page
export const getCachedAnime = cache(async (id: number) => {
    return executeGraphQL<AnimeByIdQueryType>(AnimeByIdQuery.toString(), { id })
})

// Cache home page sections (optional transparency, mainly for consistency)
export const getCachedTrending = cache(async (perPage: number = 6) => {
    return executeGraphQL<TrendingAnimeQueryType>(TrendingAnimeQuery.toString(), { page: 1, perPage })
})

export const getCachedPopular = cache(async (perPage: number = 6) => {
    return executeGraphQL<PopularAnimeQueryType>(PopularAnimeQuery.toString(), { page: 1, perPage })
})

export const getCachedSeasonal = cache(async (season: MediaSeason, year: number, perPage: number = 6) => {
    return executeGraphQL<SeasonalAnimeQueryType>(SeasonalAnimeQuery.toString(), {
        season,
        seasonYear: year,
        page: 1,
        perPage
    })
})

export const getCachedTopRated = cache(async (perPage: number = 6) => {
    return executeGraphQL<TopRatedAnimeQueryType>(TopRatedAnimeQuery.toString(), { page: 1, perPage })
})
