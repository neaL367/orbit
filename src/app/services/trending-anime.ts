import { cache } from "react"
import { apolloClient } from "@/app/services/apollo-client"
import { TRENDING_ANIME_QUERY } from "../graphql/queries/trending"
import { AnimeMedia, PageInfo } from "@/lib/types"

export const getTrendingAnime = cache(async (page = 1, perPage = 20, isAdult = false) => {

    try {
        const { data } = await apolloClient.query({
            query: TRENDING_ANIME_QUERY,
            variables: { page, perPage, isAdult },
            fetchPolicy: "network-only",
        })

        return {
            media: data.Page.media as AnimeMedia[],
            pageInfo: data.Page.pageInfo as PageInfo,
        }
    } catch (error) {
        console.error("Error fetching trending anime:", error)
        return { media: [], pageInfo: { hasNextPage: false, currentPage: page, total: 0 } }
    }
})