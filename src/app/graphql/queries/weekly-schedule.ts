import { gql } from "@apollo/client";
import { SCHEDULE_MEDIA_FRAGMENT } from "./fragment";

export const WEEKLY_SCHEDULE_QUERY = gql`
    ${SCHEDULE_MEDIA_FRAGMENT}
    query ($airingAtGreater: Int, $airingAtLesser: Int, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        airingSchedules(
          airingAt_greater: $airingAtGreater
          airingAt_lesser: $airingAtLesser
          sort: TIME
        ) {
          id
          airingAt
          episode
          timeUntilAiring
          media {
            ...ScheduleMediaFragment
          }
        }
      }
    }
  `