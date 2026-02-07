'use cache'

import {
    cacheLife,
    cacheTag
} from 'next/cache'
import { executeGraphQL } from './engine/fetch-server'
import { AnimeByIdQuery } from './queries/anime-by-id'
import { TrendingAnimeQuery } from './queries/trending-anime'
import { PopularAnimeQuery } from './queries/popular-anime'
import { SeasonalAnimeQuery } from './queries/seasonal-anime'
import { TopRatedAnimeQuery } from './queries/top-rated-anime'
import { UpcomingAiringAnimeQuery } from './queries/upcoming-airing-anime'
import { MediaSeason } from './types/graphql'
import type {
    AnimeByIdQuery as AnimeByIdQueryType,
    TrendingAnimeQuery as TrendingAnimeQueryType,
    PopularAnimeQuery as PopularAnimeQueryType,
    SeasonalAnimeQuery as SeasonalAnimeQueryType,
    TopRatedAnimeQuery as TopRatedAnimeQueryType,
    UpcomingAiringAnimeQuery as UpcomingAiringAnimeQueryType
} from './types/graphql'

/**
 * Cached data fetching for server components
 * Uses Next.js 16 "use cache" to persist data across requests
 * This significantly improves performance by avoiding redundant GraphQL calls
 */

export async function getCachedAnime(id: number) {
    cacheLife('days')
    cacheTag('anime-detail', `anime-${id}`)
    return executeGraphQL<AnimeByIdQueryType>(AnimeByIdQuery.toString(), { id })
}

export async function getCachedTrending(perPage: number = 6) {
    cacheLife('minutes')
    cacheTag('anime-trending', 'anime-list')
    return executeGraphQL<TrendingAnimeQueryType>(TrendingAnimeQuery.toString(), { page: 1, perPage })
}

export async function getCachedPopular(perPage: number = 6) {
    cacheLife('minutes')
    cacheTag('anime-popular', 'anime-list')
    return executeGraphQL<PopularAnimeQueryType>(PopularAnimeQuery.toString(), { page: 1, perPage })
}

export async function getCachedSeasonal(season: MediaSeason, year: number, perPage: number = 6) {
    cacheLife('hours')
    cacheTag('anime-seasonal', 'anime-list', `anime-season-${season}-${year}`)
    return executeGraphQL<SeasonalAnimeQueryType>(SeasonalAnimeQuery.toString(), {
        season,
        seasonYear: year,
        page: 1,
        perPage
    })
}

export async function getCachedTopRated(perPage: number = 6) {
    cacheLife('hours')
    cacheTag('anime-top-rated', 'anime-list')
    return executeGraphQL<TopRatedAnimeQueryType>(TopRatedAnimeQuery.toString(), { page: 1, perPage })
}

export async function getCachedUpcomingAiring(perPage: number = 10) {
    cacheLife('minutes')
    cacheTag('anime-upcoming', 'anime-list')
    return executeGraphQL<UpcomingAiringAnimeQueryType>(UpcomingAiringAnimeQuery.toString(), { page: 1, perPage })
}
