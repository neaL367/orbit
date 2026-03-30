import { gql } from './index'

export const UpcomingAiringAnimeQuery = gql`
  query UpcomingAiringAnime($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
        perPage
      }
      media(type: ANIME, sort: [POPULARITY_DESC, TRENDING_DESC], status: RELEASING, isAdult: false) {
        id
        idMal
        title {
          romaji
          english
          native
          userPreferred
        }
        description
        coverImage {
          large
          medium
          extraLarge
          color
        }
        bannerImage
        averageScore
        meanScore
        popularity
        favourites
        status
        genres
        format
        duration
        episodes
        season
        seasonYear
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        tags {
          id
          name
          description
          category
          rank
        }
        studios(isMain: true) {
          nodes {
            id
            name
          }
        }
      }
    }
  }
`
