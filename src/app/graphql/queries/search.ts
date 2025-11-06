import { gql } from "@apollo/client";
import { MEDIA_FRAGMENT } from "./fragment";

export const SEARCH_ANIME_QUERY = gql`
    ${MEDIA_FRAGMENT}
    query ($search: String, $page: Int, $perPage: Int, $isAdult: Boolean) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
          currentPage
          total
        }
        media(search: $search, type: ANIME, isAdult: $isAdult) {
          ...MediaFragment
        }
      }
    }
  `