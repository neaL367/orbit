import { gql } from "@apollo/client";
import { MEDIA_FRAGMENT } from "./fragment";

export const ALL_TIME_POPULAR_ANIME_QUERY = gql`
    ${MEDIA_FRAGMENT}
    query ($page: Int, $perPage: Int, $isAdult: Boolean) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
          currentPage
          total
        }
        media(type: ANIME, sort: POPULARITY_DESC, isAdult: $isAdult) {
          ...MediaFragment
        }
      }
    }
  `