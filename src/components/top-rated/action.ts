"use server"

import { MediaQueries } from "@/anilist/queries/media"

export async function fetchMoreTopRatedAnime(page: number) {
    try {
        // Calculate how many items to fetch
        // If we're approaching 100 items, only fetch what's needed to reach 100
        const currentTotal = (page - 1) * 20
        const remainingToFetch = 100 - currentTotal
        const perPage = Math.min(20, remainingToFetch)

        // If we've already fetched 100 or more, return empty result
        if (perPage <= 0) {
            return { anime: [], hasNextPage: false }
        }

        const response = await MediaQueries.getTopRated({
            page,
            perPage,
        })

        return {
            anime: response?.data?.Page?.media || [],
            hasNextPage: response?.data?.Page?.pageInfo?.hasNextPage || false,
        }
    } catch (error) {
        console.error("Error fetching more top rated anime:", error)
        return { anime: [], hasNextPage: false }
    }
}

