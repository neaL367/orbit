import { cache } from "react"
import { apolloClient } from "@/app/services/apollo-client"
import { AIRING_SCHEDULE_QUERY } from "../graphql/queries/airing-schedule"
import { AiringSchedule, PageInfo } from "@/lib/types"

export const getAiringAnime = cache(
    async (
        page = 1,
        perPage = 20,
        notYetAired = true,
        isAdult = false,
    ) => {
        const now = Math.floor(Date.now() / 1000)
        const weekFromNow = now + 7 * 24 * 60 * 60

        const variables = notYetAired
            ? { page, perPage, airingAtGreater: now, airingAtLesser: weekFromNow }
            : { page, perPage, airingAtGreater: now - 7 * 24 * 60 * 60, airingAtLesser: now }


        try {
            const { data } = await apolloClient.query({
                query: AIRING_SCHEDULE_QUERY,
                variables,
                fetchPolicy: "network-only",
            })

            const schedules = isAdult
                ? data.Page.airingSchedules
                : data.Page.airingSchedules.filter((schedule: AiringSchedule) => !schedule.media.isAdult)

            return {
                schedules,
                pageInfo: data.Page.pageInfo as PageInfo,
            }
        } catch (error) {
            console.error("Error fetching airing schedule:", error)
            return {
                schedules: [],
                pageInfo: { hasNextPage: false, currentPage: page, total: 0 },
            }
        }
    },
)

export function getTimeUntilAiring(timestamp: number): string {
    const now = Date.now() / 1000
    const timeUntil = timestamp - now

    if (timeUntil <= 0) {
        return "Aired"
    }

    const days = Math.floor(timeUntil / (24 * 60 * 60))
    const hours = Math.floor((timeUntil % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((timeUntil % (60 * 60)) / 60)

    if (days > 0) {
        return `${days}d ${hours}h`
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`
    } else {
        return `${minutes}m`
    }
}