import { gql } from "@apollo/client";
import { MEDIA_FRAGMENT } from "./fragment";

export const AIRING_SCHEDULE_QUERY = gql`
      ${MEDIA_FRAGMENT}
      query ($page: Int, $perPage: Int, $airingAtGreater: Int, $airingAtLesser: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            hasNextPage
            currentPage
            total
          }
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
              ...MediaFragment
            }
          }
        }
      }
    `