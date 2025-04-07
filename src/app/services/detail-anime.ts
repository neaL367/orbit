import { apolloClient } from "@/app/services/apollo-client"
import { cache } from "react"
import { ANIME_DETAILS_QUERY } from "../graphql/queries/detail"
import { AnimeMedia } from "@/lib/types"

export const getAnimeDetails = cache(async (id: string) => {

    try {
        const { data } = await apolloClient.query({
            query: ANIME_DETAILS_QUERY,
            variables: { id: Number.parseInt(id) },
            fetchPolicy: "network-only",
        })

        return data.Media as AnimeMedia
    } catch (error) {
        console.error("Error fetching anime details:", error)
        return null
    }
})