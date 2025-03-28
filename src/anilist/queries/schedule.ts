import { AnilistResponse } from "../modal/common"
import { PaginationParams, SchedulePageResponse } from "../modal/response"
import { apiRequest } from "../utils/api-request"
import { SCHEDULE_FIELDS } from "../utils/fragments"

export const ScheduleQueries = {
  async getAiringSchedule({
    page = 1,
    perPage = 50,
  }: PaginationParams = {}): Promise<AnilistResponse<SchedulePageResponse>> {
    // Get current timestamp and timestamp for 7 days later
    const now = Math.floor(Date.now() / 1000)
    const oneWeekLater = now + 604800

    const query = `
        query ($page: Int, $perPage: Int, $airingAtGreater: Int, $airingAtLesser: Int) {
          Page(page: $page, perPage: $perPage) {
            pageInfo {
              total
              currentPage
              lastPage
              hasNextPage
              perPage
            }
            airingSchedules(airingAt_greater: $airingAtGreater, airingAt_lesser: $airingAtLesser, sort: TIME) {
              ${SCHEDULE_FIELDS}
            }
          }
        }
      `

    return apiRequest<SchedulePageResponse>(query, {
      page,
      perPage,
      airingAtGreater: now,
      airingAtLesser: oneWeekLater,
    })
  },

  // Get upcoming premieres (first episodes)
  async getUpcomingPremieres({
    page = 1,
    perPage = 10,
  }: PaginationParams = {}): Promise<AnilistResponse<SchedulePageResponse>> {
    // Get current timestamp and timestamp for 30 days later
    const now = Math.floor(Date.now() / 1000)
    const oneMonthLater = now + 2592000

    const query = `
        query ($page: Int, $perPage: Int, $airingAtGreater: Int, $airingAtLesser: Int) {
          Page(page: $page, perPage: $perPage) {
            airingSchedules(episode: 1, airingAt_greater: $airingAtGreater, airingAt_lesser: $airingAtLesser, sort: TIME) {
              ${SCHEDULE_FIELDS}
            }
          }
        }
      `

    return apiRequest<SchedulePageResponse>(query, {
      page,
      perPage,
      airingAtGreater: now,
      airingAtLesser: oneMonthLater,
    })
  },
}

