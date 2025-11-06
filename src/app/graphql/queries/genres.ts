import { gql } from "@apollo/client";
import { MEDIA_FRAGMENT } from "./fragment";

export const GENRES_QUERY = gql`
    query {
      GenreCollection
    }
  `

export const ANIME_BY_GENRE_QUERY = gql`
      ${MEDIA_FRAGMENT}
      query ($genre: String, $page: Int, $perPage: Int, $isAdult: Boolean) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            hasNextPage
            currentPage
            total
          }
          media(genre: $genre, type: ANIME, sort: POPULARITY_DESC, isAdult: $isAdult) {
            ...MediaFragment
          }
        }
      }
    `