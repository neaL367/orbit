import { gql } from "@apollo/client";
import { MEDIA_FRAGMENT } from "./fragment";

export const SEASONAL_ANIME_QUERY = gql`
      ${MEDIA_FRAGMENT}
      query ($season: MediaSeason, $year: Int, $page: Int, $perPage: Int, $isAdult: Boolean) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            hasNextPage
            currentPage
            total
          }
          media(type: ANIME, season: $season, seasonYear: $year, sort: POPULARITY_DESC, isAdult: $isAdult) {
            ...MediaFragment
          }
        }
      }
    `