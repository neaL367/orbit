import { cache } from "react"
import { apolloClient } from "@/app/services/apollo-client"
import { TOP_RATED_ANIME_QUERY } from "../graphql/queries/top-rated"
import { AnimeMedia, PageInfo } from "@/lib/types"

export const getTopRatedAnime = cache(async (page = 1, perPage = 20, isAdult = false) => {
    try {
        const { data } = await apolloClient.query({
            query: TOP_RATED_ANIME_QUERY,
            variables: { page, perPage, isAdult },
            fetchPolicy: "network-only",
        })

        return {
            media: data.Page.media as AnimeMedia[],
            pageInfo: data.Page.pageInfo as PageInfo,
        }
    } catch (error) {
        console.error("Error fetching top rated anime:", error)
        return { media: [], pageInfo: { hasNextPage: false, currentPage: page, total: 0 } }
    }
})