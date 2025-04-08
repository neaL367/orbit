// src/app/graphql/queries/home.ts

import { gql } from "@apollo/client";
import { MEDIA_FRAGMENT } from "./fragment";

export const HOME_PAGE_QUERY = gql`
  ${MEDIA_FRAGMENT}
  query ($isAdult: Boolean) {
    trending: Page(page: 1, perPage: 6) {
      media(sort: TRENDING_DESC, type: ANIME, isAdult: $isAdult) {
        ...MediaFragment
      }
    }
    popular: Page(page: 1, perPage: 6) {
      media(sort: POPULARITY_DESC, type: ANIME, isAdult: $isAdult) {
        ...MediaFragment
      }
    }
    topRated: Page(page: 1, perPage: 6) {
      media(sort: SCORE_DESC, type: ANIME, isAdult: $isAdult) {
        ...MediaFragment
      }
    }
    upcoming: Page(page: 1, perPage: 6) {
      airingSchedules(
        sort: TIME,
        notYetAired: true,
        airingAt_greater: 0,
        media: { type: ANIME, isAdult: $isAdult }
      ) {
        id
        airingAt
        media {
          ...MediaFragment
        }
      }
    }
  }
`;
