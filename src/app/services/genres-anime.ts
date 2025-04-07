import { client } from "@/app/services/apollo-client"
import { cache } from "react"
import { ANIME_BY_GENRE_QUERY, GENRES_QUERY } from "../graphql/queries/genres"
import { AnimeMedia, PageInfo } from "@/lib/types"

export const getGenres = cache(async (includeAdult = false) => {
    try {
        const { data } = await client.query({
            query: GENRES_QUERY,
            fetchPolicy: "network-only",
        })
        const nsfwGenres = ["Ecchi", "Hentai"]
        return data.GenreCollection.filter((genre: string) => includeAdult || !nsfwGenres.includes(genre)) as string[]
    } catch (error) {
        console.error("Error fetching genres:", error)
        return []
    }
})

export const getGenreBySlug = cache(async (genre: string, page = 1, perPage = 20, isAdult = false) => {
    try {
        const { data } = await client.query({
            query: ANIME_BY_GENRE_QUERY,
            variables: { genre, page, perPage, isAdult },
            fetchPolicy: "network-only",
        })
        return {
            media: data.Page.media as AnimeMedia[],
            pageInfo: data.Page.pageInfo as PageInfo,
        }
    } catch (error) {
        console.error("Error fetching anime by genre:", error)
        return { media: [], pageInfo: { hasNextPage: false, currentPage: page, total: 0 } }
    }
})