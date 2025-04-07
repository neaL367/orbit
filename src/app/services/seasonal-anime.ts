import { client } from "@/app/services/apollo-client"
import { SEASONAL_ANIME_QUERY } from "../graphql/queries/seasonal"
import { cache } from "react"
import { AnimeMedia, PageInfo, Season } from "@/lib/types"

export const getSeasonalAnime = cache(
    async (
        season: string = getCurrentSeason().season,
        year: number = getCurrentSeason().year,
        page = 1,
        perPage = 20,
        isAdult = false,
    ) => {

        try {
            const { data } = await client.query({
                query: SEASONAL_ANIME_QUERY,
                variables: {
                    season: season.toUpperCase(),
                    year,
                    page,
                    perPage,
                    isAdult,
                },
                fetchPolicy: "network-only",
            })

            return {
                media: data.Page.media as AnimeMedia[],
                pageInfo: data.Page.pageInfo as PageInfo,
                season: {
                    season: season.toUpperCase(),
                    year,
                },
            }
        } catch (error) {
            console.error("Error fetching seasonal anime:", error)
            return { media: [], pageInfo: { hasNextPage: false, currentPage: page, total: 0 } }
        }
    },
)

export function getCurrentSeason(): Season {
    const now = new Date()
    const month = now.getMonth() + 1 
    const year = now.getFullYear()

    let season: "WINTER" | "SPRING" | "SUMMER" | "FALL"

    if (month >= 1 && month <= 3) {
        season = "WINTER"
    } else if (month >= 4 && month <= 6) {
        season = "SPRING"
    } else if (month >= 7 && month <= 9) {
        season = "SUMMER"
    } else {
        season = "FALL"
    }

    return { year, season }
}