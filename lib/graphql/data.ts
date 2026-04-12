'use cache'

/**
 * Server-side cached loaders for RSC. See CACHE_STRATEGY.md for how this relates
 * to fetch-server `next.tags` / revalidate and to the client `/api/graphql` path.
 */

import {
    cacheLife,
    cacheTag
} from 'next/cache'
import { executeGraphQL } from './engine/fetch-server'
import { getScheduleDayRanges } from '@/lib/schedule/day-ranges'
import { 
    AnimeByIdDocument, 
    TrendingAnimeDocument, 
    PopularAnimeDocument, 
    SeasonalAnimeDocument, 
    TopRatedAnimeDocument, 
    UpcomingAiringAnimeDocument, 
    ScheduleAnimeHeroDocument 
} from './types/graphql'
import type {
    AnimeByIdQuery as AnimeByIdQueryType,
    TrendingAnimeQuery as TrendingAnimeQueryType,
    PopularAnimeQuery as PopularAnimeQueryType,
    SeasonalAnimeQuery as SeasonalAnimeQueryType,
    TopRatedAnimeQuery as TopRatedAnimeQueryType,
    UpcomingAiringAnimeQuery as UpcomingAiringAnimeQueryType,
    ScheduleAnimeHeroQuery as ScheduleAnimeHeroQueryType,
    MediaSeason
} from './types/graphql'

/**
 * Cached data fetching for server components
 * Uses Next.js 16 "use cache" to persist data across requests
 * This significantly improves performance by avoiding redundant GraphQL calls
 */

export async function getCachedAnime(id: number) {
    cacheLife('days')
    cacheTag('anime-detail', `anime-${id}`)
    return executeGraphQL<AnimeByIdQueryType>(AnimeByIdDocument.toString(), { id })
}

export async function getCachedTrending(perPage: number = 6) {
    cacheLife('minutes')
    cacheTag('anime-trending', 'anime-list')
    return executeGraphQL<TrendingAnimeQueryType>(TrendingAnimeDocument.toString(), { page: 1, perPage })
}

export async function getCachedPopular(perPage: number = 6) {
    cacheLife('minutes')
    cacheTag('anime-popular', 'anime-list')
    return executeGraphQL<PopularAnimeQueryType>(PopularAnimeDocument.toString(), { page: 1, perPage })
}

export async function getCachedSeasonal(season: MediaSeason, year: number, perPage: number = 6) {
    cacheLife('hours')
    cacheTag('anime-seasonal', 'anime-list', `anime-season-${season}-${year}`)
    return executeGraphQL<SeasonalAnimeQueryType>(SeasonalAnimeDocument.toString(), {
        season,
        seasonYear: year,
        page: 1,
        perPage
    })
}

export async function getCachedTopRated(perPage: number = 6) {
    cacheLife('hours')
    cacheTag('anime-top-rated', 'anime-list')
    return executeGraphQL<TopRatedAnimeQueryType>(TopRatedAnimeDocument.toString(), { page: 1, perPage })
}

export async function getCachedUpcomingAiring(perPage: number = 10) {
    cacheLife('minutes')
    cacheTag('anime-upcoming', 'anime-list')
    return executeGraphQL<UpcomingAiringAnimeQueryType>(UpcomingAiringAnimeDocument.toString(), { page: 1, perPage })
}

export async function getScheduleAnime(page: number = 1, perPage: number = 5, airingAtGreater?: number) {
    cacheLife('minutes')
    cacheTag('anime-schedule', 'anime-list')
    return executeGraphQL<ScheduleAnimeHeroQueryType>(ScheduleAnimeHeroDocument.toString(), {
        page,
        perPage,
        notYetAired: true,
        airingAt_greater: airingAtGreater || Math.floor(Date.now() / 1000)
    })
}

/** Parallel schedule slices for /schedule (matches prior client query split). */
export async function getCachedScheduleWeekBundle() {
    cacheLife('minutes')
    cacheTag('anime-schedule', 'anime-list')
    const dayRanges = getScheduleDayRanges()
    const today = dayRanges[0]

    const [finishedRes, upcomingRes, weekRes] = await Promise.all([
        executeGraphQL<ScheduleAnimeHeroQueryType>(ScheduleAnimeHeroDocument.toString(), {
            page: 1,
            perPage: 50,
            notYetAired: false,
            airingAt_greater: today.start,
            airingAt_lesser: today.end,
        }),
        executeGraphQL<ScheduleAnimeHeroQueryType>(ScheduleAnimeHeroDocument.toString(), {
            page: 1,
            perPage: 50,
            notYetAired: true,
            airingAt_greater: today.start,
            airingAt_lesser: today.end,
        }),
        executeGraphQL<ScheduleAnimeHeroQueryType>(ScheduleAnimeHeroDocument.toString(), {
            page: 1,
            perPage: 100,
            notYetAired: true,
            airingAt_greater: dayRanges[0].start,
            airingAt_lesser: dayRanges[6].end,
        }),
    ])

    return {
        finished: finishedRes.data?.Page?.airingSchedules ?? [],
        upcomingToday: upcomingRes.data?.Page?.airingSchedules ?? [],
        week: weekRes.data?.Page?.airingSchedules ?? [],
    }
}
