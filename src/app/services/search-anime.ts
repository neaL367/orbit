import { cache } from "react"
import { client } from "@/app/services/apollo-client"
import { SEARCH_ANIME_QUERY } from "../graphql/queries/search"
import { AnimeMedia, PageInfo } from "@/lib/types"

export const getSearchAnime = cache(async (searchTerm: string, page = 1, perPage = 20, isAdult = false) => {

    try {
        const { data } = await client.query({
            query: SEARCH_ANIME_QUERY,
            variables: { search: searchTerm, page, perPage, isAdult },
            fetchPolicy: "network-only",
        })

        return {
            media: data.Page.media as AnimeMedia[],
            pageInfo: data.Page.pageInfo as PageInfo,
        }
    } catch (error) {
        console.error("Error searching anime:", error)
        return { media: [], pageInfo: { hasNextPage: false, currentPage: page, total: 0 } }
    }
})