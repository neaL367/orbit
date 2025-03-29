"use server"

import { MediaQueries } from "@/anilist/queries/media"
import { SearchQueries } from "@/anilist/queries/search"
import { GenreQueries } from "@/anilist/queries/genre"

// Wrapper function to handle errors consistently
async function safeApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
        return await apiCall()
    } catch (error) {
        console.error("API call failed:", error)
        // Return a structured error that won't break the Server Component render
        throw new Error(`API request failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
}

// Trending anime server action
export async function fetchMoreTrendingAnime(page: number) {
    return safeApiCall(async () => {
        const perPage = 18
        const data = await MediaQueries.getTrending({ page, perPage })
        const anime = data?.data?.Page?.media || []
        const hasNextPage = data?.data?.Page?.pageInfo?.hasNextPage || false

        return { anime, hasNextPage }
    })
}

// Popular anime server action
export async function fetchMorePopularAnime(page: number) {
    return safeApiCall(async () => {
        const perPage = 18
        const data = await MediaQueries.getPopular({ page, perPage })
        const anime = data?.data?.Page?.media || []
        const hasNextPage = data?.data?.Page?.pageInfo?.hasNextPage || false

        return { anime, hasNextPage }
    })
}

// Top rated anime server action
export async function fetchMoreTopRatedAnime(page: number) {
    return safeApiCall(async () => {
        const perPage = 18
        const data = await MediaQueries.getTopRated({ page, perPage })
        const anime = data?.data?.Page?.media || []
        const hasNextPage = data?.data?.Page?.pageInfo?.hasNextPage || false

        return { anime, hasNextPage }
    })
}

// Search anime server action
export async function fetchMoreSearchResults(query: string, page: number) {
    return safeApiCall(async () => {
        const perPage = 18
        const data = await SearchQueries.search({ query, page, perPage })
        const anime = data?.data?.Page?.media || []
        const hasNextPage = data?.data?.Page?.pageInfo?.hasNextPage || false

        return { anime, hasNextPage }
    })
}

// Genre anime server action
export async function fetchMoreGenreAnime(genre: string, page: number) {
    return safeApiCall(async () => {
        const perPage = 18
        const data = await GenreQueries.getByGenre({ genre, page, perPage })
        const anime = data?.data?.Page?.media || []
        const hasNextPage = data?.data?.Page?.pageInfo?.hasNextPage || false

        return { anime, hasNextPage }
    })
}

// Seasonal anime server action
export async function fetchMoreSeasonalAnime(season: string, year: number, page: number) {
    return safeApiCall(async () => {
        const perPage = 18
        const data = await MediaQueries.getSeasonal({
            season,
            year,
            page,
            perPage,
        })
        const anime = data?.data?.Page?.media || []
        const hasNextPage = data?.data?.Page?.pageInfo?.hasNextPage || false

        return { anime, hasNextPage }
    })
}

