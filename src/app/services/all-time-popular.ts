import { cache } from "react"
import { apolloClient } from "@/app/services/apollo-client"
import { AnimeMedia, PageInfo } from "@/lib/types"
import { ALL_TIME_POPULAR_ANIME_QUERY } from "../graphql/queries/all-time-popular"

export const getAllTimePopularAnime = cache(async (page = 1, perPage = 20, isAdult = false) => {

    try {
        const { data } = await apolloClient.query({
            query: ALL_TIME_POPULAR_ANIME_QUERY,
            variables: { page, perPage, isAdult },
            fetchPolicy: "network-only",
        })

        return {
            media: data.Page.media as AnimeMedia[],
            pageInfo: data.Page.pageInfo as PageInfo,
        }
    } catch (error) {
        console.error("Error fetching all time popular anime:", error)
        return { media: [], pageInfo: { hasNextPage: false, currentPage: page, total: 0 } }
    }
})