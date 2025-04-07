import { cache } from "react"
import { apolloClient } from "@/app/services/apollo-client"
import { WEEKLY_SCHEDULE_QUERY } from "../graphql/queries/weekly-schedule"
import { AiringSchedule } from "@/lib/types"

export const getWeeklyAnime = cache(async (weekOffset = 0, isAdult = false) => {
    const now = Math.floor(Date.now() / 1000)
    const startTime = now + weekOffset * 7 * 24 * 60 * 60
    const endTime = startTime + 7 * 24 * 60 * 60
    try {
        const { data } = await apolloClient.query({
            query: WEEKLY_SCHEDULE_QUERY,
            variables: {
                airingAtGreater: startTime,
                airingAtLesser: endTime,
                page: 1,
                perPage: 50,
            },
            fetchPolicy: "network-only",
        })

        const schedulesByDay: Record<string, AiringSchedule[]> = {
            Sunday: [],
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
        }

        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

        data.Page.airingSchedules.forEach((schedule: AiringSchedule) => {
            if (!isAdult && schedule.media.isAdult) return
            const date = new Date(schedule.airingAt * 1000)
            const dayOfWeek = days[date.getDay()]
            schedulesByDay[dayOfWeek].push(schedule)
        })

        return schedulesByDay
    } catch (error) {
        console.error("Error fetching weekly schedule:", error)
        return {
            Sunday: [],
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
        }
    }
})